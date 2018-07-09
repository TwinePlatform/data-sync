const { assoc, omit } = require('ramda');
const merge = require('../merge');

const filterIDs = (o) => Object.keys(o).reduce((acc, k) => assoc(k, o[k].map(omit([`${k}_id`, 'fk_organisation_to_user', 'fk_user_to_organisation'])), acc), {});

describe('Merge', () => {
  [
    {
      name: 'Merges two non-overlapping (partial) entity graphs: only organisations',
      left: {
        organisation: [
          { organisation_name: 'Foobar' },
        ],
      },
      right: {
        organisation: [
          { organisation_name: 'Duck' },
        ],
      },
      expectation: {
        organisation: [
          { organisation_name: 'Foobar' },
          { organisation_name: 'Duck' },
        ],
      },
    },

    {
      name: 'Merges two overlapping (partial) entity graphs: only organisations',
      left: {
        organisation: [
          { organisation_name: 'Foobar' },
        ],
      },
      right: {
        organisation: [
          { organisation_name: 'Foobar', organisation_360_giving_id: 'woo' },
          { organisation_name: 'Duck' },
        ],
      },
      expectation: {
        organisation: [
          { organisation_name: 'Foobar', organisation_360_giving_id: 'woo' },
          { organisation_name: 'Duck' },
        ],
      },
    },

    {
      name: 'Merges two overlapping (partial) entity graphs: users & orgs',
      left: {
        organisation: [
          { organisation_name: 'Foobar' },
        ],

        user: [
          { user_name: 'foo', user_email: 'foo@bar.com' },
        ],
      },
      right: {
        organisation: [
          { organisation_name: 'Foobar', organisation_360_giving_id: 'woo' },
          { organisation_name: 'Duck' },
        ],

        user: [
          { user_name: 'Foo', user_email: 'foo@bar.com' },
        ],
      },
      expectation: {
        organisation: [
          { organisation_name: 'Foobar', organisation_360_giving_id: 'woo' },
          { organisation_name: 'Duck' },
        ],

        user: [
          { user_name: 'Foo', user_email: 'foo@bar.com' },
        ],
      },
    },

    {
      name: 'Merges objects from right to left if they don\'t exist in left',
      left: {},
      right: {
        organisation: [
          { organisation_name: 'Foobar', organisation_360_giving_id: 'woo' },
        ],
      },
      expectation: {
        organisation: [
          { organisation_name: 'Foobar', organisation_360_giving_id: 'woo' },
        ],
      },
    },

    {
      name: 'Merges non-overlapping users',
      left: {
        user: [
          { user_name: 'BazFoo', user_email: 'bazfoo@com.com' },
        ],
      },
      right: {
        user: [
          { user_name: 'Foobar', user_email: 'foobar@moc.moc' },
        ],
      },
      expectation: {
        user: [
          { user_name: 'BazFoo', user_email: 'bazfoo@com.com' },
          { user_name: 'Foobar', user_email: 'foobar@moc.moc' },
        ],
      },
    },

    {
      name: 'Merges duplicate organisation records without losing properties',
      left: {
        organisation: [
          { organisation_name: 'Dog & Fish', organisation_post_code: 'N1' },
        ],

      },
      right: {
        organisation: [
          { organisation_name: 'Dog & Fish', organisation_360_giving_id: 'foo' },
        ],
      },
      expectation: {
        organisation: [
          { organisation_name: 'Dog & Fish', organisation_360_giving_id: 'foo', organisation_post_code: 'N1' },
        ],
      },
    },

    {
      name: 'Merges duplicate user records without losing properties',
      left: {
        user: [
          { user_name: 'Ted', user_email: 'N1', user_is_email_confirmed: true },
        ],

      },
      right: {
        user: [
          { user_name: 'Ted', user_email: 'N1', user_api_key: 'foo' },
        ],
      },
      expectation: {
        user: [
          {
            user_name: 'Ted', user_api_key: 'foo', user_email: 'N1', user_is_email_confirmed: true,
          },
        ],
      },
    },
  ]
    .forEach(({
      name, left, right, expectation,
    }) =>
      test(name, () => expect(filterIDs(merge(left, right))).toEqual(expectation)));

  test('Merges duplicate organisations records keeping foreign keys consistent', () => {
    const left = {
      organisation: [
        { organisation_id: 1, organisation_name: 'Dog & Fish', organisation_post_code: 'N1' },
      ],

      user: [
        {
          user_name: 'Ted', user_email: 'ted@foo.com', user_is_email_confirmed: true, fk_user_to_organisation: 1,
        },
      ],

    };
    const right = {
      organisation: [
        { organisation_id: 3, organisation_name: 'Dog & Fish' },
      ],

      user: [
        {
          user_name: 'Ted', user_email: 'ted@foo.com', user_api_key: 'foo', fk_user_to_organisation: 3,
        },
      ],
    };

    const result = merge(left, right);

    expect(result.organisation).toHaveLength(1);
    expect(result.organisation[0].organisation_id).not.toBe(1);
    expect(typeof result.organisation[0].organisation_id).toBe('string');
    expect(result.user).toHaveLength(1);
    expect(result.user[0].fk_user_to_organisation).toBe(result.organisation[0].organisation_id);
  });

  test('Merges duplicate user records keeping foreign keys consistent in visit events', () => {
    const left = {
      organisation: [
        { organisation_id: 1, organisation_name: 'Dog & Fish', organisation_post_code: 'N1' },
      ],

      user: [
        {
          user_id: 1, user_name: 'Ted', user_email: 'ted@foo.com', user_is_email_confirmed: true, fk_user_to_organisation: 1,
        },
      ],

    };
    const right = {
      organisation: [
        { organisation_id: 3, organisation_name: 'Dog & Fish' },
      ],

      user: [
        {
          user_id: 1, user_name: 'Ted', user_email: 'ted@foo.com', user_api_key: 'foo', fk_user_to_organisation: 3,
        },
      ],

      visit_event: [
        {
          visit_event_id: 1, fk_visit_event_to_organisation: 3, fk_visit_event_to_user: 1,
        },
      ],
    };

    const result = merge(left, right);

    expect(result.organisation).toHaveLength(1);
    expect(result.organisation[0].organisation_id).not.toBe(1);
    expect(typeof result.organisation[0].organisation_id).toBe('string');
    expect(result.user).toHaveLength(1);
    expect(result.user[0].fk_user_to_organisation).toBe(result.organisation[0].organisation_id);
    expect(result.visit_event[0].fk_visit_event_to_user).toBe(result.user[0].user_id);
    expect(result.visit_event[0].fk_visit_event_to_organisation)
      .toBe(result.organisation[0].organisation_id);
  });
});

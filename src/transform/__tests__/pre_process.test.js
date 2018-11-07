require('dotenv').config();
const { replaceKeysWithUUIDs, mapConstantValues, mapToTargetSchema } = require('../pre_process');

describe('replaceKeysWithUUIDs', () => {
  test('Replaces IDs in structure with no foreign keys', () => {
    const entities = {
      organisation: [
        {
          organisation_id: 1,
          organisation_name: 'foo',
        },
        {
          organisation_id: 2,
          organisation_name: 'bar',
        },
      ],

      user: [
        {
          user_id: 1,
          user_name: 'bill',
        },
        {
          user_id: 2,
          user_name: 'ted',
        },
      ],
    };

    const result = replaceKeysWithUUIDs(entities);

    result.organisation.forEach((org) => {
      expect(org.organisation_id).not.toBe(1);
      expect(typeof org.organisation_id).toBe('string');
    });

    result.user.forEach((user) => {
      expect(user.user_id).not.toBe(1);
      expect(typeof user.user_id).toBe('string');
    });

  });

  test('Replaces IDs in structure with foreign keys', () => {
    const entities = {
      organisation: [
        {
          organisation_id: 1,
          organisation_name: 'foo',
        },
        {
          organisation_id: 2,
          organisation_name: 'bar',
        },
      ],

      user: [
        {
          user_id: 1,
          user_name: 'bill',
          fk_user_to_organisation: 2,
        },
        {
          user_id: 2,
          user_name: 'ted',
          fk_user_to_organisation: 1,
        },
      ],
    };

    const result = replaceKeysWithUUIDs(entities);

    result.organisation.forEach((org) => {
      expect(org.organisation_id).not.toBe(1);
      expect(typeof org.organisation_id).toBe('string');
    });

    result.user.forEach((user) => {
      expect(user.user_id).not.toBe(1);
      expect(typeof user.user_id).toBe('string');
    });

    expect(result.user[0].fk_user_to_organisation).toBe(result.organisation[1].organisation_id);
    expect(result.user[1].fk_user_to_organisation).toBe(result.organisation[0].organisation_id);
  });

  test('Replaces IDs in structure with foreign keys | complex', () => {
    const entities = {
      organisation: [
        {
          organisation_id: 1,
          organisation_name: 'foo',
        },
        {
          organisation_id: 2,
          organisation_name: 'bar',
        },
      ],

      user: [
        {
          user_id: 1,
          user_name: 'bill',
          fk_user_to_organisation: 2,
        },
        {
          user_id: 2,
          user_name: 'ted',
          fk_user_to_organisation: 1,
        },
      ],

      visit_event: [
        {
          visit_event_id: 1,
          fk_visit_event_to_user: 1,
          fk_visit_event_to_organisation: 2,
        },
        {
          visit_event_id: 2,
          fk_visit_event_to_user: 2,
          fk_visit_event_to_organisation: 1,
        },
        {
          visit_event_id: 3,
          fk_visit_event_to_user: 1,
          fk_visit_event_to_organisation: 1,
        },
        {
          visit_event_id: 4,
          fk_visit_event_to_user: 2,
          fk_visit_event_to_organisation: 2,
        },
      ],
    };

    const result = replaceKeysWithUUIDs(entities);

    result.organisation.forEach((org) => {
      expect(org.organisation_id).not.toBe(1);
      expect(typeof org.organisation_id).toBe('string');
    });

    result.user.forEach((user) => {
      expect(user.user_id).not.toBe(1);
      expect(typeof user.user_id).toBe('string');
    });

    result.visit_event.forEach((visit_event) => {
      expect(visit_event.visit_event_id).not.toBe(1);
      expect(typeof visit_event.visit_event_id).toBe('string');
    });

    expect(result.user[0].fk_user_to_organisation).toBe(result.organisation[1].organisation_id);
    expect(result.user[1].fk_user_to_organisation).toBe(result.organisation[0].organisation_id);

    expect(result.visit_event[0].fk_visit_event_to_organisation)
      .toBe(result.organisation[1].organisation_id);
    expect(result.visit_event[1].fk_visit_event_to_organisation)
      .toBe(result.organisation[0].organisation_id);
    expect(result.visit_event[2].fk_visit_event_to_organisation)
      .toBe(result.organisation[0].organisation_id);
    expect(result.visit_event[3].fk_visit_event_to_organisation)
      .toBe(result.organisation[1].organisation_id);

    expect(result.visit_event[0].fk_visit_event_to_user).toBe(result.user[0].user_id);
    expect(result.visit_event[1].fk_visit_event_to_user).toBe(result.user[1].user_id);
    expect(result.visit_event[2].fk_visit_event_to_user).toBe(result.user[0].user_id);
    expect(result.visit_event[3].fk_visit_event_to_user).toBe(result.user[1].user_id);


  });
});

describe('mapConstantValues', () => {
  test('maps turnover band to required values', () => {
    const entities = {
      organisation: [
        { organisation_turnover_band: '£100-250k' },
        { organisation_turnover_band: '£250-500k' },
        { organisation_turnover_band: '£500-750k' },
        { organisation_turnover_band: '£750k-1m' },
        { organisation_turnover_band: '£1-5m' },
        { organisation_turnover_band: '£5-10m' },
        { organisation_turnover_band: null },
      ],
      user: [],
    };

    const res = mapConstantValues(entities);

    expect(res).toEqual({
      organisation: [
        { organisation_turnover_band: '£100k-£250k' },
        { organisation_turnover_band: '£250k-£500k' },
        { organisation_turnover_band: '£500k-£750k' },
        { organisation_turnover_band: '£750k-£1m' },
        { organisation_turnover_band: '£1m-£5m' },
        { organisation_turnover_band: '£5m-£10m' },
        { organisation_turnover_band: null },
      ],
      user: [],
    });
  });

  test('maps bad organisation sector to required value', () => {
    const entities = {
      organisation: [
        { organisation_sector: 'pub' },
        { organisation_sector: 'Other' },
        { organisation_sector: null },
      ],
      user: [],
    };

    const res = mapConstantValues(entities);

    expect(res).toEqual({
      organisation: [
        { organisation_sector: 'Community pub, shop or café' },
        { organisation_sector: 'Other' },
        { organisation_sector: null },
      ],
      user: [],
    });
  });

  test('maps user roles to required values', () => {
    const entities = {
      organisation: [],
      user: [
        { user_role_name: 'System Admin' },
        { user_role_name: 'Organisation Admin' },
        { user_role_name: 'Volunteer' },
        { user_role_name: 'foo' },
        { user_role_name: null },
      ],
    };

    const res = mapConstantValues(entities);

    expect(res).toEqual({
      organisation: [],
      user: [
        { user_role_name: 'SYS_ADMIN' },
        { user_role_name: 'CB_ADMIN' },
        { user_role_name: 'VOLUNTEER' },
        { user_role_name: 'VISITOR' },
        { user_role_name: null },
      ],
    });
  });

  test('maps user gender to required values', () => {
    const entities = {
      organisation: [],
      user: [
        { user_gender: 'Rather not say' },
        { user_gender: 'male' },
        { user_gender: 'Male' },
        { user_gender: 'Female' },
        { user_gender: null },
      ],
    };

    const res = mapConstantValues(entities);

    expect(res).toEqual({
      organisation: [],
      user: [
        { user_gender: 'prefer not to say' },
        { user_gender: 'male' },
        { user_gender: 'male' },
        { user_gender: 'female' },
        { user_gender: null },
      ],
    });
  });
});

describe('mapToTargetSchema', () => {
  test('Split organisation into org and user record if coming from visitor schema', () => {
    const entities = {
      organisation: [
        {
          organisation_id: 1,
          organisation_name: 'foobar',
          organisation_email: 'foo@bar.com',
          organisation_password: 'password',
          organisation_created_at: 'now',
        },
        {
          organisation_id: 2,
          organisation_name: 'hi',
          organisation_created_at: 'then',
        },
      ],
      user: [],
    };

    const res = mapToTargetSchema(entities);

    expect(res.organisation).toEqual([
      expect.objectContaining({
        organisation_id: 1,
        organisation_name: 'foobar',
        organisation_360_giving_id: null,
        organisation_sector: 'Community hub, facility or space',
        organisation_region: 'South West',
        organisation_created_at: 'now',
      }),
      expect.objectContaining({
        organisation_id: 2,
        organisation_name: 'hi',
        organisation_360_giving_id: null,
        organisation_sector: 'Community hub, facility or space',
        organisation_region: 'South West',
        organisation_created_at: 'then',
      }),
    ]);

    expect(res.user.map(({ user_id, ...rest }) => rest)).toEqual([
      {
        user_name: 'foobar',
        user_email: 'foo@bar.com',
        user_password: 'password',
        user_gender: 'prefer not to say',
        user_created_at: 'now',
        user_role_name: 'CB_ADMIN',
        user_disability: 'prefer not to say',
        user_ethnicity: 'prefer not to say',
        fk_user_to_organisation: 1,
      },
    ]);
  });

  test('Correct erroneous values', () => {
    const entities = {
      organisation: [
        { organisation_name: process.env.DUPLICATED_360_GIVING_ID_ORGANISATION_NAME, organisation_360_giving_id: '0' },
        { organisation_name: 'foo', organisation_sector: null },
      ],
      user: [
        { user_phone_number: '1111111111111111111111', user_birth_year: 0 },
        { user_id: 0, user_email: process.env.ANONYMOUS_USERS_DUPLICATE_EMAIL },
        { user_name: 'random visitor', user_email: 'twinesocialbizintel@gmail.com' },
      ],
    };

    const res = mapToTargetSchema(entities);

    expect(res).toEqual({
      organisation: [
        {
          organisation_name: process.env.DUPLICATED_360_GIVING_ID_ORGANISATION_NAME,
          organisation_360_giving_id: null,
          organisation_region: 'South West',
          organisation_sector: 'Community hub, facility or space',
        },
        {
          organisation_name: 'foo',
          organisation_360_giving_id: null,
          organisation_region: 'South West',
          organisation_sector: 'Community hub, facility or space',
        },
      ].map(expect.objectContaining),
      user: [
        {
          user_phone_number: '11111111111111111111',
          user_birth_year: null,
          user_gender: 'prefer not to say',
          user_role_name: 'VISITOR',
          user_disability: 'prefer not to say',
          user_ethnicity: 'prefer not to say',
        },
        {
          user_id: 0,
          user_email: null,
          user_gender: 'prefer not to say',
          user_role_name: 'VISITOR',
          user_disability: 'prefer not to say',
          user_ethnicity: 'prefer not to say',
        },
        {
          user_name: 'random visitor',
          user_email: null,
          user_gender: 'prefer not to say',
          user_role_name: 'VISITOR',
          user_disability: 'prefer not to say',
          user_ethnicity: 'prefer not to say',
        },
      ],
      volunteer_log: [],
    });
  });
});

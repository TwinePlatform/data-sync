const { replaceKeysWithUUIDs } = require('../pre_process');

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

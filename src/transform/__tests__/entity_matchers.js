const matchers = require('../entity_matchers');

describe('Entity Matchers', () => {
  describe('Organisation', () => {
    test('No match because of no name', () => {
      const left = { organisation_name: 'foo' };
      const right = {};
      const res = matchers.organisation.doMatch(left, right);

      expect(res).toBe(false);
    });

    test('No match because of different name', () => {
      const left = { organisation_name: 'foo' };
      const right = { organisation_name: 'barbaz' };
      const res = matchers.organisation.doMatch(left, right);

      expect(res).toBe(false);
    });

    test('Exact match', () => {
      const left = { organisation_name: 'foo' };
      const right = { organisation_name: 'foo' };
      const res = matchers.organisation.doMatch(left, right);

      expect(res).toBe(true);
    });

    test('Case insensitive match', () => {
      const left = { organisation_name: 'foo' };
      const right = { organisation_name: 'FOO' };
      const res = matchers.organisation.doMatch(left, right);

      expect(res).toBe(true);
    });

    test('Partial match within Levenshtein distance threshold', () => {
      const left = { organisation_name: 'foop' };
      const right = { organisation_name: 'f-oo' };
      const res = matchers.organisation.doMatch(left, right);

      expect(res).toBe(true);
    });
  });

  describe('User', () => {
    test('No match because of null email', () => {
      const left = { user_email: null };
      const right = { user_email: 'foo@bar.com' };
      const res = matchers.user.doMatch(left, right);

      expect(res).toBe(false);
    });

    test('No match because of different email', () => {
      const left = { user_email: null };
      const right = { user_email: 'foo@bar.com' };
      const res = matchers.user.doMatch(left, right);

      expect(res).toBe(false);
    });

    test('Exact match', () => {
      const left = { user_email: 'foo@bar.com' };
      const right = { user_email: 'foo@bar.com' };
      const res = matchers.user.doMatch(left, right);

      expect(res).toBe(true);
    });
  });

  describe('Visit Event', () => {
    test('Always false', () => {
      [
        { visit_event_id: 1, fk_visit_event_to_user: 2, fk_visit_event_to_organisation: 3 },
        null,
        -1,
        '',
        '\n',
      ].forEach((arg) => {
        const res = matchers.visit_event.doMatch(arg);
        expect(res).toBe(false);
      });
    });
  });

  describe('Visit Activity', () => {
    test('Always false', () => {
      [
        { visit_activity_id: 1, fk_visit_activity_to_user: 2, fk_visit_activity_to_organisation: 3 },
        null,
        -1,
        '',
        '\n',
      ].forEach((arg) => {
        const res = matchers.visit_activity.doMatch(arg);
        expect(res).toBe(false);
      });
    });
  });

  describe('Visit Feedback', () => {
    test('Always false', () => {
      [
        { visit_feedback_id: 1, fk_visit_feedback_to_user: 2, fk_visit_feedback_to_organisation: 3 },
        null,
        -1,
        '',
        '\n',
      ].forEach((arg) => {
        const res = matchers.visit_feedback.doMatch(arg);
        expect(res).toBe(false);
      });
    });
  });

  describe('Volunteer Log', () => {
    test('Always false', () => {
      [
        { volunteer_log_id: 1, fk_volunteer_log_to_user: 2, fk_volunteer_log_to_organisation: 3 },
        null,
        -1,
        '',
        '\n',
      ].forEach((arg) => {
        const res = matchers.volunteer_log.doMatch(arg);
        expect(res).toBe(false);
      });
    });
  });

  describe('Outreach campaign', () => {
    test('Always false', () => {
      [
        { outreach_campaign_id: 1, fk_outreach_campaign_to_organisation: 3 },
        null,
        -1,
        '',
        '\n',
      ].forEach((arg) => {
        const res = matchers.outreach_campaign.doMatch(arg);
        expect(res).toBe(false);
      });
    });
  });

  describe('Outreach meeting', () => {
    test('Always false', () => {
      [
        { outreach_meeting_id: 1, fk_outreach_meeting_to_user: 2 },
        null,
        -1,
        '',
        '\n',
      ].forEach((arg) => {
        const res = matchers.outreach_meeting.doMatch(arg);
        expect(res).toBe(false);
      });
    });
  });

  describe('Frontline account', () => {
    test('Always false', () => {
      [
        { frontline_account_id: 1, fk_frontline_account_to_organisation: 3 },
        null,
        -1,
        '',
        '\n',
      ].forEach((arg) => {
        const res = matchers.frontline_account.doMatch(arg);
        expect(res).toBe(false);
      });
    });
  });
});

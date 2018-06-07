const Pipeline = require('..');
const { merge, omit } = require('ramda');

describe('Visitor pipeline', () => {
  const row1 = {
    organisation_id: 1,
    organisation_email: 'foo@bar.com',
    organisation_name: 'foo',
    activity_id: 9,
    activity_name: 'baz',
    user_id: 4,
    user_name: 'barry',
    feedback_id: 3,
    feedback_score: -1,
    visit_id: 2,
    visit_to_user_fk: 4,
  };
  const row2 = {
    organisation_id: 2,
    organisation_email: 'mar@bar.com',
    organisation_name: 'mar',
    activity_id: 4,
    activity_name: 'har',
    user_id: 2,
    user_name: 'terry',
    feedback_id: 11,
    feedback_score: 0,
    visit_id: 3,
    visit_to_user_fk: 2,
  };

  describe('Normalize', () => {

    describe('Single row', () => {
      test('should create top level organisation object with correct child objects', () => {
        const rows = [row1];

        const result = Pipeline.normalize(rows);

        expect(result).toEqual({
          1: {
            organisation_id: 1,
            organisation_name: 'foo',
            organisation_email: 'foo@bar.com',
            activity: { 9: { activity_id: 9, activity_name: 'baz' } },
            visit: { 2: { visit_id: 2, visit_to_user_fk: 4 } },
            feedback: { 3: { feedback_id: 3, feedback_score: -1 } },
            user: { 4: { user_id: 4, user_name: 'barry' } },
          },
        });
      });
    });


    describe('Multiple rows', () => {
      test('should not create duplicates when organisation record appears multiple times', () => {
        const rows = [row1, row1];

        const result = Pipeline.normalize(rows);

        expect(result).toEqual({
          1: {
            organisation_id: 1,
            organisation_name: 'foo',
            organisation_email: 'foo@bar.com',
            activity: { 9: { activity_id: 9, activity_name: 'baz' } },
            visit: { 2: { visit_id: 2, visit_to_user_fk: 4 } },
            feedback: { 3: { feedback_id: 3, feedback_score: -1 } },
            user: { 4: { user_id: 4, user_name: 'barry' } },
          },
        });
      });

      test('should create additional record for distinct organisation records', () => {
        const rows = [row1, row2];

        const result = Pipeline.normalize(rows);

        expect(result).toEqual({
          1: {
            organisation_id: 1,
            organisation_name: 'foo',
            organisation_email: 'foo@bar.com',
            activity: { 9: { activity_id: 9, activity_name: 'baz' } },
            visit: { 2: { visit_id: 2, visit_to_user_fk: 4 } },
            feedback: { 3: { feedback_id: 3, feedback_score: -1 } },
            user: { 4: { user_id: 4, user_name: 'barry' } },
          },
          2: {
            organisation_id: 2,
            organisation_name: 'mar',
            organisation_email: 'mar@bar.com',
            activity: { 4: { activity_id: 4, activity_name: 'har' } },
            visit: { 3: { visit_id: 3, visit_to_user_fk: 2 } },
            feedback: { 11: { feedback_id: 11, feedback_score: 0 } },
            user: { 2: { user_id: 2, user_name: 'terry' } },
          },
        });
      });

      test('should not merge duplicate activity record into normalized object', () => {
        const row3 = merge(row1, omit(['organisation_id', 'organisation_email', 'organisation_name', 'activity_id', 'activity_name'], row2));
        const rows = [row1, row3];

        const result = Pipeline.normalize(rows);

        expect(result).toEqual({
          1: {
            organisation_id: 1,
            organisation_name: 'foo',
            organisation_email: 'foo@bar.com',
            activity: { 9: { activity_id: 9, activity_name: 'baz' } },
            visit: {
              2: { visit_id: 2, visit_to_user_fk: 4 },
              3: { visit_id: 3, visit_to_user_fk: 2 },
            },
            feedback: {
              3: { feedback_id: 3, feedback_score: -1 },
              11: { feedback_id: 11, feedback_score: 0 },
            },
            user: { 4: { user_id: 4, user_name: 'barry' }, 2: { user_id: 2, user_name: 'terry' } },
          },
        });
      });

      test('should not merge duplicate visit record into normalized object', () => {
        const row3 = merge(row1, omit(['organisation_id', 'organisation_email', 'organisation_name', 'visit_id', 'visit_name'], row2));
        const rows = [row1, row3];

        const result = Pipeline.normalize(rows);

        expect(result).toEqual({
          1: {
            organisation_id: 1,
            organisation_name: 'foo',
            organisation_email: 'foo@bar.com',
            activity: { 9: { activity_id: 9, activity_name: 'baz' }, 4: { activity_id: 4, activity_name: 'har' } },
            visit: { 2: { visit_id: 2, visit_to_user_fk: 4 } },
            feedback: {
              3: { feedback_id: 3, feedback_score: -1 },
              11: { feedback_id: 11, feedback_score: 0 },
            },
            user: { 4: { user_id: 4, user_name: 'barry' }, 2: { user_id: 2, user_name: 'terry' } },
          },
        });
      });

      test('should not merge duplicate feedback record into normalized object', () => {
        const row3 = merge(row1, omit(['organisation_id', 'organisation_email', 'organisation_name', 'feedback_id', 'feedback_name'], row2));
        const rows = [row1, row3];

        const result = Pipeline.normalize(rows);

        expect(result).toEqual({
          1: {
            organisation_id: 1,
            organisation_name: 'foo',
            organisation_email: 'foo@bar.com',
            activity: { 9: { activity_id: 9, activity_name: 'baz' }, 4: { activity_id: 4, activity_name: 'har' } },
            visit: {
              2: { visit_id: 2, visit_to_user_fk: 4 },
              3: { visit_id: 3, visit_to_user_fk: 2 },
            },
            feedback: { 3: { feedback_id: 3, feedback_score: -1 } },
            user: { 4: { user_id: 4, user_name: 'barry' }, 2: { user_id: 2, user_name: 'terry' } },
          },
        });
      });

      test('should not merge duplicate user record into normalized object', () => {
        const row3 = merge(row1, omit(['organisation_id', 'organisation_email', 'organisation_name', 'user_id', 'user_name'], row2));
        const rows = [row1, row3];

        const result = Pipeline.normalize(rows);

        expect(result).toEqual({
          1: {
            organisation_id: 1,
            organisation_name: 'foo',
            organisation_email: 'foo@bar.com',
            activity: { 9: { activity_id: 9, activity_name: 'baz' }, 4: { activity_id: 4, activity_name: 'har' } },
            visit: {
              2: { visit_id: 2, visit_to_user_fk: 4 },
              3: { visit_id: 3, visit_to_user_fk: 2 },
            },
            feedback: {
              3: { feedback_id: 3, feedback_score: -1 },
              11: { feedback_id: 11, feedback_score: 0 },
            },
            user: { 4: { user_id: 4, user_name: 'barry' } },
          },
        });
      });
    });
  });
});

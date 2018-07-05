/*
 * Load volunteer log data into target DB
 *
 * Populates the following tables:
 * - volunteer_hours_log
 */
const {
  pickAll,
} = require('ramda');
const { sanitiseEntity, prefixColNames } = require('../shared/util');
const { findOrgById } = require('./organisation');
const { findUserById } = require('./user');

const getVolunteerLog = pickAll(['duration', 'created_at', 'started_at']);

const main = (primary, trx) =>
  Promise.all(primary.volunteer_log
    .map(sanitiseEntity('volunteer_log'))
    .map(async (l) => {
      const log = getVolunteerLog(l);
      const user = findUserById(l.fk_volunteer_log_to_user, primary.user);
      const org = prefixColNames(findOrgById(l.fk_volunteer_log_to_organisation, primary.organisation));

      if (Object.keys(user).length === 0) {
        console.log('No user found', l.fk_volunteer_log_to_user);
        return Promise.resolve();
      }

      return trx('volunteer_hours_log')
        .insert({
          ...log,
          volunteer_activity_id: trx('volunteer_activity').select('volunteer_activity_id').where({ volunteer_activity_name: l.activity }),
          user_account_id: trx('user_account').select('user_account_id').where(user),
          community_business_id: trx('community_business').select('community_business_id').innerJoin('organisation', 'organisation.organisation_id', 'community_business.organisation_id').where(org),
        });
    }));


module.exports = {
  main,
};

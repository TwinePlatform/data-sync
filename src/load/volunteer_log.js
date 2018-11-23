/*
 * Load volunteer log data into target DB
 *
 * Populates the following tables:
 * - volunteer_hours_log
 */
const {
  pickAll,
} = require('ramda');
const { sanitiseEntity, prefixColNames, log } = require('../shared/util');
const { findOrgById } = require('./organisation');
const { findUserById } = require('./user');

const getVolunteerLog = pickAll(['duration', 'created_at', 'started_at']);

const main = (primary, trx) =>
  Promise.all(primary.volunteer_log
    .map(sanitiseEntity('volunteer_log'))
    .map(async (l) => {
      const fk = l.fk_volunteer_log_to_organisation;
      const vlog = getVolunteerLog(l);
      const user = findUserById(l.fk_volunteer_log_to_user, primary.user);
      const org = prefixColNames(findOrgById(fk, primary.organisation));

      if (Object.keys(user).length === 0) {
        log('No user found for volunteer log', l);
        return Promise.resolve();
      }

      const [id] = await trx('volunteer_hours_log')
        .insert({
          ...vlog,
          volunteer_activity_id: trx('volunteer_activity').select('volunteer_activity_id').where({ volunteer_activity_name: l.activity }),
          user_account_id: trx('user_account').select('user_account_id').where(user),
          organisation_id: trx('organisation').select('organisation_id').where(org),
        })
        .returning('volunteer_hours_log_id');

      await trx('data_sync_log')
        .insert({
          foreign_key: id,
          table_name: 'volunteer_hours_log',
        });
    }));


module.exports = {
  main,
};

/*
 * Load visit event data into target DB
 *
 * Populates the following tables:
 * - visit
 */
const { sanitiseEntity } = require('../shared/util');
const { findVisitActivityById } = require('./visit_activity');
const { findUserById } = require('./user');


const sanitiseVisitEvent = sanitiseEntity('visit_event');


const main = (primary, trx) =>
  Promise.all(primary.visit_event
    .map(sanitiseVisitEvent)
    .map(async (v) => {
      const u = findUserById(v.fk_visit_event_to_user, primary.user);
      const a = findVisitActivityById(v.fk_visit_event_to_visit_activity, primary.visit_activity);

      if (Object.keys(u).length === 0) {
        console.log('Nothing found', v.fk_visit_event_to_user);
        console.log(v);
        return Promise.resolve();
      }

      return trx('visit')
        .insert({
          user_account_id: trx('user_account').select('user_account_id').where(u),
          visit_activity_id: trx('visit_activity').select('visit_activity_id').where(a),
        });
    }));


module.exports = {
  main,
};

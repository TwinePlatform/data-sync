/*
 * Load visit feedback data into target DB
 *
 * Populates the following tables:
 * - visit_feedback
 */
const { pickAll } = require('ramda');
const { sanitiseEntity, prefixColNames, log } = require('../shared/util');
const { tryFindOrgById } = require('./organisation');


const sanitiseVisitFeedback = sanitiseEntity('visit_feedback');
const getVisitFeedback = pickAll(['score', 'created_at']);

const main = (primary, trx) =>
  Promise.all(primary.visit_feedback
    .map(sanitiseVisitFeedback)
    .map(async (f) => {
      const fk = f.fk_visit_feedback_to_organisation;
      const feedback = getVisitFeedback(f);
      const org = tryFindOrgById(fk, primary.organisation);

      if (org === null) {
        log('No organisation found for feedback', f);
        return Promise.resolve();
      }

      const [id] = await trx('visit_feedback')
        .insert({
          ...feedback,
          organisation_id: trx('organisation')
            .select('organisation_id')
            .where(prefixColNames(org)),
        })
        .returning('visit_feedback_id');

      await trx('data_sync_log')
        .insert({
          foreign_key: id,
          table_name: 'visit_feedback',
        });
    }));


module.exports = {
  main,
};

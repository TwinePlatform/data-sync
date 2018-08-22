/*
 * Load visit feedback data into target DB
 *
 * Populates the following tables:
 * - visit_feedback
 */
const {
  pickAll,
} = require('ramda');
const { sanitiseEntity, prefixColNames } = require('../shared/util');
const { findOrgById } = require('./organisation');


const sanitiseVisitFeedback = sanitiseEntity('visit_feedback');
const getVisitFeedback = pickAll(['score', 'created_at']);

const main = (primary, trx) =>
  Promise.all(primary.visit_feedback
    .map(sanitiseVisitFeedback)
    .map((f) => {
      const fk = f.fk_visit_feedback_to_organisation;
      const feedback = getVisitFeedback(f);
      const org = prefixColNames(findOrgById(fk, primary.organisation));

      return trx('visit_feedback')
        .insert({
          ...feedback,
          organisation_id: trx('organisation')
            .select('organisation_id')
            .where(org),
        });
    }));


module.exports = {
  main,
};

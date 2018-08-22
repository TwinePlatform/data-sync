/*
 * Load visit activity data into target DB
 *
 * Populates the following tables:
 * - visit_activity
 */
const {
  compose, omit, filter, head, map,
} = require('ramda');
const { prefixColNames, sanitiseEntity, mapKeys } = require('../shared/util');
const { findOrgById } = require('./organisation');


const sanitiseVisitActivity = sanitiseEntity('visit_activity');

const getVisitActivity = compose(
  mapKeys((k) => k === 'name' ? 'visit_activity_name' : k),
  omit(['fk_visit_activity_to_organisation'])
);

const findVisitActivityById = (id, visit_activities) => compose(
  filter((s) => typeof s !== 'undefined'), // remove keys with undefined values
  getVisitActivity, // form visit_activity record from row
  head, // strip organisation out of array
  map(sanitiseVisitActivity), // sanitise the fields
  filter((o) => o.visit_activity_id === id), // choose the right visit activity
)(visit_activities);


const main = (primary, trx) =>
  Promise.all(primary.visit_activity
    .map(sanitiseVisitActivity)
    .map(async (a) => {
      const fk = a.fk_visit_activity_to_organisation;
      const act = getVisitActivity(a);
      const org = prefixColNames(findOrgById(fk, primary.organisation));

      return trx('visit_activity')
        .insert({
          ...act,
          organisation_id: trx('organisation')
            .select('organisation_id')
            .where(org),
        });
    }));


module.exports = {
  main,
  findVisitActivityById,
};

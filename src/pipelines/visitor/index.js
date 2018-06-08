/*
 * Visitor ingestion pipeline
 *
 * Fetches data from the visitor database, and constructs a de-duplicated, normalised object
 * structure, rooted on each community business.
 */
const { filterWithKeys, generateAliasString } = require('../../shared/util');
const fieldTranslation = require('./fieldMap');


// getOrgFields :: Object -> Object
const getOrgFields = filterWithKeys((s) => s.startsWith('organisation_'));

// collectEntityFromRow :: (Object, Object) -> Object
const collectEntityFromRow = (org, row) => (entity) =>
  !(org[entity] && org[entity][row[`${entity}_id`]])
    ? {
      ...org[entity] || {}, // spread the existing object if there is one
      ...{ [row[`${entity}_id`]]: filterWithKeys((s) => s.startsWith(`${entity}_`))(row) },
    }
    : org[entity];

// collectRow :: (Object, Object) -> Object
const collectRow = (acc, row) => {
  const id = row.organisation_id;

  if (!(id in acc)) {
    acc[id] = getOrgFields(row);
  }

  const collectEntity = collectEntityFromRow(acc[id], row);

  ['activity', 'visit', 'feedback', 'user'].forEach((entity) => {
    acc[id][entity] = collectEntity(entity);
  });

  return acc;
};


const _ = {
  // Pipeline.ingest :: KnexClient -> Promise([Row])
  ingest: (client) =>
    client.select(client.raw(generateAliasString(fieldTranslation)))
      .from('cbusiness')
      .innerJoin('users', 'cbusiness.id', 'users.cb_id')
      .innerJoin('activities', 'cbusiness.id', 'activities.cb_id')
      .innerJoin('feedback', 'cbusiness.id', 'feedback.cb_id')
      .innerJoin('visits', 'cbusiness.id', 'visits.cb_id'),

  // Pipeline.normalize :: [Row] -> Object
  normalize: (rows) => rows.reduce(collectRow, {}),
};


// Pipeline :: KnexClient -> Object
module.exports = (client) => _.ingest(client).then(_.normalize);
module.exports.normalize = _.normalize;
module.exports.ingest = _.ingest;

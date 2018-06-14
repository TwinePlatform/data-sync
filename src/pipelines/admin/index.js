const { filter } = require('ramda');
const { generateAliasString, filterWithKeys } = require('../../shared/util');
const fieldTranslation = require('./fieldMap.js');

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

  ['user', 'outreach', 'meeting', 'volunteer_activity', 'volunteer_log', 'frontline_account'].forEach((entity) => {
    acc[id][entity] = collectEntity(entity);
  });

  return acc;
};

// cleanRows :: [Row] -> [Row]
const cleanRows = (rows) =>
  rows
    .map(filter(Boolean))
    .filter((o) => Object.keys(o).length > 0);


const _ = {
  // ingest :: KnexClient -> Promise ([Row])
  ingest: (client) =>
    client.select(client.raw(generateAliasString(fieldTranslation)))
      .from('organisations')
      .fullOuterJoin('sectors', 'organisations.sector_id', 'sectors.id')
      .fullOuterJoin('regions', 'organisations.region_id', 'regions.id')
      .fullOuterJoin('users', 'users.organisation_id', 'organisations.id')
      .fullOuterJoin('genders', 'users.gender_id', 'genders.id')
      .fullOuterJoin('user_roles', 'users.role_id', 'user_roles.id')
      .fullOuterJoin('meetings', 'meetings.organisation_id', 'organisations.id')
      .fullOuterJoin('meeting_types', 'meetings.type', 'meeting_types.id')
      .fullOuterJoin('logs', 'logs.organisation_id', 'organisations.id')
      .fullOuterJoin('activities', 'logs.activity_id', 'activities.id')
      .fullOuterJoin('outreaches', 'outreaches.organisation_id', 'organisations.id')
      .fullOuterJoin('outreach_child_types', 'outreaches.outreach_child_type', 'outreach_child_types.id')
      .fullOuterJoin('outreach_types', 'outreaches.outreach_type', 'outreach_types.id')
      .fullOuterJoin('frontlinesms_api_keys', 'frontlinesms_api_keys.organisation_id', 'organisations.id')
      .then(cleanRows),

  // normalize :: [Row] -> Object
  normalize: (rows) => rows.reduce(collectRow, {}),
};

module.exports = (client) => _.ingest(client).then(_.normalize);
module.exports.ingest = _.ingest;
module.exports.normalize = _.normalize;

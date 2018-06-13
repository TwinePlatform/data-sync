const { generateAliasString } = require('../../shared/util');
const fieldTranslation = require('./fieldMap.js');

const _ = {
  // ingest :: KnexClient -> Promise ([Row])
  ingest: (client) =>
    client.select(client.raw(generateAliasString(fieldTranslation)))
      .from('organisations')
      .leftOuterJoin('sectors', 'organisations.sector_id', 'sectors.id')
      .leftOuterJoin('regions', 'organisations.region_id', 'regions.id')
      .fullOuterJoin('users', 'users.organisation_id', 'organisations.id')
      .leftOuterJoin('genders', 'users.gender_id', 'genders.id')
      .leftOuterJoin('user_roles', 'users.role_id', 'user_roles.id')
      .fullOuterJoin('meetings', 'meetings.organisation_id', 'organisations.id')
      .leftOuterJoin('meeting_types', 'meetings.type', 'meeting_types.id')
      .fullOuterJoin('logs', 'logs.organisation_id', 'organisations.id')
      .fullOuterJoin('activities', 'logs.activity_id', 'activities.id')
      .fullOuterJoin('outreaches', 'outreaches.organisation_id', 'organisations.id')
      .fullOuterJoin('outreach_child_types', 'outreaches.outreach_child_type', 'outreach_child_types.id')
      .fullOuterJoin('outreach_types', 'outreaches.outreach_type', 'outreach_types.id')
      .fullOuterJoin('frontlinesms_api_keys', 'frontlinesms_api_keys.organisation_id', 'organisations.id'),

  normalize: (a) => a,
};

module.exports = (client) => _.ingest(client).then(_.normalize);
module.exports.ingest = _.ingest;
module.exports.normalize = _.normalize;

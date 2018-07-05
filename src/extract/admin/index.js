const { pickAll } = require('ramda');
const { generateAliasString } = require('../../shared/util');
const adminFieldMap = require('./fieldMap');


module.exports = (client) => Promise.all([
  client.select(client.raw(generateAliasString(pickAll(['organisations', 'regions', 'sectors'], adminFieldMap)).join(', ')))
    .from('organisations')
    .leftOuterJoin('sectors', 'sectors.id', 'organisations.sector_id')
    .leftOuterJoin('regions', 'regions.id', 'organisations.region_id'),

  client.select(client.raw(generateAliasString(pickAll(['users', 'genders', 'user_roles'], adminFieldMap)).join(', ')))
    .from('users')
    .leftOuterJoin('genders', 'genders.id', 'users.gender_id')
    .innerJoin('user_roles', 'user_roles.id', 'users.role_id'),

  client.select(client.raw(generateAliasString(pickAll(['outreaches', 'outreach_types', 'outreach_child_types', 'meeting_types'], adminFieldMap)).join(', ')))
    .from('outreaches')
    .innerJoin('outreach_types', 'outreach_types.id', 'outreaches.outreach_type')
    .innerJoin('outreach_child_types', 'outreach_child_types.id', 'outreaches.outreach_child_type')
    .innerJoin('meeting_types', 'meeting_types.id', 'outreaches.interaction_type'),

  client.select(client.raw(generateAliasString(pickAll(['logs', 'activities'], adminFieldMap)).join(', ')))
    .from('logs')
    .innerJoin('activities', 'activities.id', 'logs.activity_id'),

  client.select(client.raw(generateAliasString(pickAll(['frontlinesms_api_keys'], adminFieldMap)).join(', ')))
    .from('frontlinesms_api_keys'),
])
  .then(([
    organisation, user, outreach_campaign, volunteer_log, frontline_account,
  ]) => ({
    organisation, user, outreach_campaign, volunteer_log, frontline_account,
  }));

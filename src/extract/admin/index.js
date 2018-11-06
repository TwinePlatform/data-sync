const { pickAll } = require('ramda');
const { generateAliases } = require('../../shared/util');
const adminFieldMap = require('./fieldMap');


module.exports = (client) => Promise.all([
  client.select(client.raw(generateAliases(pickAll(['organisations', 'regions', 'sectors', 'admin_codes'], adminFieldMap)).join(', ')))
    .from('organisations')
    .leftOuterJoin('sectors', 'sectors.id', 'organisations.sector_id')
    .leftOuterJoin('regions', 'regions.id', 'organisations.region_id')
    .leftOuterJoin('admin_codes', 'admin_codes.organisation_id', 'organisations.id')
    .where({ 'organisations.deleted_at': null, 'admin_codes.deleted_at': null }),

  client.select(client.raw(generateAliases(pickAll(['users', 'genders', 'user_roles'], adminFieldMap)).join(', ')))
    .from('users')
    .leftOuterJoin('genders', 'genders.id', 'users.gender_id')
    .innerJoin('user_roles', 'user_roles.id', 'users.role_id')
    .whereNot({ 'users.password': '' })
    .andWhere({ 'users.deleted_at': null }),

  client.select(client.raw(generateAliases(pickAll(['outreaches', 'outreach_types', 'outreach_child_types', 'meeting_types'], adminFieldMap)).join(', ')))
    .from('outreaches')
    .innerJoin('outreach_types', 'outreach_types.id', 'outreaches.outreach_type')
    .innerJoin('outreach_child_types', 'outreach_child_types.id', 'outreaches.outreach_child_type')
    .innerJoin('meeting_types', 'meeting_types.id', 'outreaches.interaction_type')
    .where({ 'outreaches.deleted_at': null }),

  client.select(client.raw(generateAliases(pickAll(['logs', 'activities'], adminFieldMap)).join(', ')))
    .from('logs')
    .leftOuterJoin('activities', 'activities.id', 'logs.activity_id')
    .innerJoin('organisations', 'organisations.id', 'logs.organisation_id')
    .where({ 'logs.deleted_at': null, 'organisations.deleted_at': null }),

  client.select(client.raw(generateAliases(pickAll(['frontlinesms_api_keys'], adminFieldMap)).join(', ')))
    .from('frontlinesms_api_keys'),
])
  .then(([
    organisation, user, outreach_campaign, volunteer_log, frontline_account,
  ]) => ({
    organisation, user, outreach_campaign, volunteer_log, frontline_account,
  }));

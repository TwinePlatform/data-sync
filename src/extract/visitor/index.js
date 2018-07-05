const { pickAll } = require('ramda');
const { generateAliasString } = require('../../shared/util');
const visitorFieldMap = require('./fieldMap');


module.exports = (client) => Promise.all([
  client.select(generateAliasString(pickAll(['cbusiness'], visitorFieldMap))).from('cbusiness'),
  client.select(generateAliasString(pickAll(['users'], visitorFieldMap))).from('users'),
  client.select(generateAliasString(pickAll(['visits'], visitorFieldMap))).from('visits'),
  client.select(generateAliasString(pickAll(['feedback'], visitorFieldMap))).from('feedback'),
  client.select(generateAliasString(pickAll(['activities'], visitorFieldMap))).from('activities'),
])
  .then(([organisation, user, visit_event, visit_feedback, visit_activity]) => ({
    organisation, user, visit_event, visit_feedback, visit_activity,
  }));

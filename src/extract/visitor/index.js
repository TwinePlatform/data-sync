const { pickAll } = require('ramda');
const { generateAliases } = require('../../shared/util');
const visitorFieldMap = require('./fieldMap');


module.exports = (client) => Promise.all([
  client.select(generateAliases(pickAll(['cbusiness'], visitorFieldMap))).from('cbusiness'),
  client.select(generateAliases(pickAll(['users'], visitorFieldMap))).from('users'),
  client.select(generateAliases(pickAll(['visits'], visitorFieldMap))).from('visits'),
  client.select(generateAliases(pickAll(['feedback'], visitorFieldMap))).from('feedback'),
  client.select(generateAliases(pickAll(['activities'], visitorFieldMap))).from('activities'),
])
  .then(([organisation, user, visit_event, visit_feedback, visit_activity]) => ({
    organisation, user, visit_event, visit_feedback, visit_activity,
  }));

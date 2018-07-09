const { main: organisation } = require('./organisation');
const { main: user } = require('./user');
const { main: visit_activity } = require('./visit_activity');
const { main: visit_event } = require('./visit_event');
const { main: visit_feedback } = require('./visit_feedback');
const { main: frontline_account } = require('./frontline_account');
const { main: volunteer_log } = require('./volunteer_log');
const { main: outreach_campaign } = require('./outreach_campaign');

module.exports = {
  organisation,
  user,
  visit_activity,
  visit_event,
  visit_feedback,
  frontline_account,
  volunteer_log,
  outreach_campaign,
};

/*
 * Load outreach data into target DB
 *
 * Populates the following tables:
 * - outreach_campaign
 * - outreach_meeting
 */
const { zip } = require('ramda');
const { sanitiseEntity, prefixColNames } = require('../shared/util');
const { findOrgById } = require('./organisation');
const { findUserById } = require('./user');


const main = (primary, trx) =>
  Promise.all(zip(primary.outreach_campaign, primary.outreach_meeting)
    .map(([c, m]) => [sanitiseEntity('outreach_campaign')(c), sanitiseEntity('outreach_meeting')(m)])
    .map(async ([c, m]) => {
      const fk = c.fk_outreach_campaign_to_organisation;
      const org = prefixColNames(findOrgById(fk, primary.organisation));
      const user = findUserById(m.fk_outreach_meeting_to_user, primary.user);

      const res = await trx('outreach_campaign')
        .insert({
          outreach_type_id: trx('outreach_type').select('outreach_type_id').where({ outreach_type_name: c.type }),
          organisation_id: trx('organisation').select('organisation_id').where(org),
        })
        .returning('outreach_campaign_id');

      return trx('outreach_meeting')
        .insert({
          user_account_id: trx('user_account').select('user_account_id').where(user),
          outreach_campaign_id: res[0],
          outreach_meeting_type_id: trx('outreach_meeting_type').select('outreach_meeting_type_id').where({ outreach_meeting_type_name: m.type }),
          outreach_partner: 'Unknown',
          meeting_subject: 'Unknown',
          scheduled_at: m.scheduled_at,
        });
    }));


module.exports = {
  main,
};

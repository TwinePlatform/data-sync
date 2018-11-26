/*
 * Load frontline account data into target DB
 *
 * Populates the following tables:
 * - frontline_account
 * - subscription
 */
const {
  compose, omit,
} = require('ramda');
const { sanitiseEntity, mapKeys, log } = require('../shared/util');
const { tryFindOrgById } = require('./organisation');


const sanitiseFrontlineAccount = sanitiseEntity('frontline_account');

const getFrontlineAccount = compose(
  mapKeys((k) => ({ api_key: 'frontline_api_key', workspace_id: 'frontline_workspace_id' }[k] || k)),
  omit(['fk_frontline_account_to_organisation'])
);


const main = (primary, trx) =>
  Promise.all(primary.frontline_account
    .map(sanitiseFrontlineAccount)
    .map(async (f) => {
      const frontline = getFrontlineAccount(f);
      const org = tryFindOrgById(f.fk_frontline_account_to_organisation, primary.organisation);

      if (org === null) {
        log('No organisation found for frontline account', f);
        return Promise.resolve();
      }

      const [frontlineId] = await trx('frontline_account')
        .insert(frontline)
        .returning('frontline_account_id');

      await trx('data_sync_log')
        .insert({
          foreign_key: frontlineId,
          table_name: 'frontline_account',
        });

      // By default set the expiry date to 1 year from now
      const now = new Date();
      now.setFullYear(now.getUTCFullYear() + 1);

      const [subscriptionId] = await trx('subscription')
        .insert({
          owner_id: trx('organisation').select('organisation_id').where(org),
          beneficiary_id: trx('organisation').select('organisation_id').where(org),
          frontline_account_id: frontlineId,
          subscription_status: 'active',
          subscription_type_id: trx('subscription_type').select('subscription_type_id').where({ subscription_type_name: 'community_business:full' }),
          expires_at: now,
        })
        .returning('subscription_id');

      return trx('data_sync_log')
        .insert({
          foreign_key: subscriptionId,
          table_name: 'subscription',
        });
    }));


module.exports = {
  main,
};

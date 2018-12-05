/*
 * Load user data into target DB
 *
 * Populates the following tables:
 * - user_account
 * - user_account_access_role
 */
const {
  map, head, filter, compose, omit,
} = require('ramda');
const { sanitiseEntity, mapKeys, log } = require('../shared/util');
const { tryFindOrgById } = require('./organisation');


const sanitiseUser = sanitiseEntity('user');

const getUser = compose(
  mapKeys((k) => ({ password: 'user_password', name: 'user_name' }[k] || k)),
  omit(['role_names', 'gender', 'disability', 'ethnicity', 'fk_user_to_organisation'])
);

const findUserById = (id, users) => compose(
  filter((s) => typeof s !== 'undefined'), // remove keys with undefined values
  getUser, // form user record from row
  head, // strip organisation out of array
  map(sanitiseUser), // sanitise the fields
  filter((o) => o.user_id === id), // choose the right user
)(users);

const main = (primary, trx) =>
  Promise.all(primary.user
    .map(sanitiseUser)
    .map(async (u) => {
      const roles = u.role_names;

      const user = getUser(u);
      const org = tryFindOrgById(u.fk_user_to_organisation, primary.organisation);

      if (org === null) {
        log('No organisation found for user', u);
        return Promise.resolve();
      }

      const [userId] = await trx('user_account')
        .insert({
          ...user,
          gender_id: trx('gender').select('gender_id').where({ gender_name: u.gender }),
          disability_id: trx('disability').select('disability_id').where({ disability_name: u.disability }),
          ethnicity_id: trx('ethnicity').select('ethnicity_id').where({ ethnicity_name: u.ethnicity }),
        })
        .returning('user_account_id');

      await trx('data_sync_log')
        .insert({
          foreign_key: userId,
          table_name: 'user_account',
        });

      const userAccessRoleIds = await Promise.all(roles.map((role) =>
        trx('user_account_access_role')
          .insert({
            organisation_id: trx('organisation').select('organisation_id').where(org),
            user_account_id: userId,
            access_role_id: trx('access_role').select('access_role_id').where({ access_role_name: role }),
          })
          .returning('user_account_access_role_id')));

      return Promise.all(userAccessRoleIds.map(([id]) =>
        trx('data_sync_log')
          .insert({
            foreign_key: id,
            table_name: 'user_account_access_role',
          })));
    }));


module.exports = {
  main,
  findUserById,
};

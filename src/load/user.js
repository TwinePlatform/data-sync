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
const { sanitiseEntity, mapKeys } = require('../shared/util');
const { findOrgById } = require('./organisation');


const sanitiseUser = sanitiseEntity('user');

const getUser = compose(
  mapKeys((k) => ({ password: 'user_password', name: 'user_name' }[k] || k)),
  omit(['role_name', 'gender', 'fk_user_to_organisation'])
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
      const role = u.role_name;
      const org = findOrgById(u.fk_user_to_organisation, primary.organisation);
      const user = getUser(u);

      const res = await trx('user_account')
        .insert({
          ...user,
          gender_id: trx('gender').select('gender_id').where({ gender_name: u.gender }),
        })
        .returning('user_account_id');

      return trx('user_account_access_role')
        .insert({
          organisation_id: trx('organisation').select('organisation_id').where(org),
          user_account_id: res[0],
          access_role_id: trx('access_role').select('access_role_id').where({ access_role_name: role }),
        });
    }));


module.exports = {
  main,
  findUserById,
};

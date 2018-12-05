/*
 * Entity Matchers
 *
 * Functions that determine whether two entities should be merged in the merge
 * algorithm (see /src/transform/merge.js)
 *
 * NOTE: these functions are non-trivial only for those entities that exist in
 * both source databases (which is just organisations and users)
 */
const Levenshtein = require('fast-levenshtein');
const { log } = require('../shared/util');
const { omit } = require('ramda');


module.exports = {
  organisation: {
    doMatch: (a, b) => {
      if (!(a && b && a.organisation_name && b.organisation_name)) {
        return false;
      }

      const distance = Levenshtein.get(
        a.organisation_name.toLowerCase(),
        b.organisation_name.toLowerCase()
      );

      if (distance < 3) {
        log(`Match found: ${a.organisation_name} with ${b.organisation_name}`);
        log(`Edit distance: ${distance}`);
        return true;
      }
      return false;
    },
  },

  user: {
    doMatch: (a, b) => {
      if (a.user_email !== null && b.user_email !== null
        && a.user_email.toLowerCase() === b.user_email.toLowerCase()) {
        log(`Match found: ${a.user_name} with ${b.user_name} on email ${a.user_email}`);
        log(`IDs: ${a.user_id} <><> ${b.user_id}`);
        return true;
      }
      return false;
    },

    merge: (a, b) => {
      let roles = a.user_role_names.concat(b.user_role_names)
        .filter((x, i, s) => s.indexOf(x) >= i);

      Object.assign(a, omit(['user_role_names'], a), omit(['user_role_names'], b));

      if (
        roles.includes('CB_ADMIN')
        && roles.includes('VOLUNTEER')
      ) {
        roles = ['CB_ADMIN', 'VOLUNTEER_ADMIN'];
      }

      if (
        roles.includes('VOLUNTEER_ADMIN')
        && roles.includes('VOLUNTEER')
      ) {
        roles = ['VOLUNTEER_ADMIN'];
      }

      if (
        roles.includes('CB_ADMIN')
        && roles.includes('VISITOR')
      ) {
        roles = ['CB_ADMIN'];
      }

      a.user_role_names = roles;

    },
  },

  visit_event: {
    doMatch: () => false,
  },
  outreach_campaign: {
    doMatch: () => false,
  },
  volunteer_log: {
    doMatch: () => false,
  },
  outreach_meeting: {
    doMatch: () => false,
  },
  frontline_account: {
    doMatch: () => false,
  },
  visit_feedback: {
    doMatch: () => false,
  },
  visit_activity: {
    doMatch: () => false,
  },
};

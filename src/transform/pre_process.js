/*
 * Data pre-processing
 *
 * These functions describe operations on data that are performed directly after the extraction.
 *
 * NOTE:
 * This module (specifically, mapToTargetSchema) relies on the presence of a git-ignored file
 * "region_map.js". See the function description for more details
 */
const { randomBytes } = require('crypto');
const uuid = require('uuid/v4');
const { omit, evolve, equals } = require('ramda');
const regionMap = require('./region_map');


const FKName = (from, to) => `fk_${from}_to_${to}`;
const getFK = (o, { from, to }) => o[FKName(from, to)];


/*
 * replaceKeysWithUUIDs
 *
 * Need to replace all primary keys and their related foreign
 * keys with UUIDs in order to prevent key collisions during
 * comparisons and merging.
 *
 * This should be performed before any other significant
 * transformations are performed
 */
const replaceKeysWithUUIDs = (entities) => {
  const entityNames = Object.keys(entities);

  entityNames
    .forEach((name) => {
      const entitySet = entities[name];

      entitySet.forEach((entity) => {
        const oldPK = entity[`${name}_id`];
        const newPK = uuid();

        entity[`${name}_id`] = newPK;

        entityNames
          .filter((e) => e !== name)
          .forEach((otherName) => {

            entities[otherName].forEach((otherEntity) => {

              if (getFK(otherEntity, { from: otherName, to: name }) === oldPK) {
                otherEntity[`fk_${otherName}_to_${name}`] = newPK;
              }

            });

          });
      });
    });

  return entities;
};

/*
 * removeTestData
 *
 * Concerns only test data in the visitor app, since this is well understood,
 * and removal can be easily done based on references to a small set of
 * community business IDs
 */
const removeTestData = (entities) => {
  const cb_ids = [1, 2, 3, 4, 10];
  const propNotInIds = (prop) => (o) => !cb_ids.includes(o[prop]);

  const keyNames = {
    organisation: 'organisation_id',
    user: 'fk_user_to_organisation',
    visit_activity: 'fk_visit_activity_to_organisation',
    visit_event: 'fk_visit_event_to_organisation',
    visit_feedback: 'fk_visit_feedback_to_organisation',
  };

  Object.keys(keyNames)
    .forEach((k) => {
      entities[k] = entities[k].filter(propNotInIds(keyNames[k]));
    });

  // Additional filtering on visit_event records
  entities.visit_event = entities.visit_event
    // Ignored: visit to real CB made by test account
    .filter((e) => e.visit_event_id !== 155)
    // Ignored: visits from test orgs
    .filter((e) => ![1, 2, 3, 4, 10].includes(e.fk_visit_event_to_organisation))
    // filter out foreign key b/c not part of new data model
    .map(omit(['fk_visit_event_to_organisation']));

  return entities;
};


/*
 * mapConstantValues
 *
 * All three data models have overlapping constants (e.g. gender, sectors),
 * but use slightly different values to represent them.
 *
 * Data coming in from either data source must therefore be re-mapped to use
 * the constant-values expected by the target data model.
 */
const mapConstantValues = (entities) => {
  entities.organisation.forEach((org) => {
    // Turnover band mapping for volunteer app:
    // > This is just to make the use of "£", "k" and "m" consistent
    switch (org.organisation_turnover_band) {
      case '£100-250k':
        org.organisation_turnover_band = '£100k-£250k';
        break;

      case '£250-500k':
        org.organisation_turnover_band = '£250k-£500k';
        break;

      case '£500-750k':
        org.organisation_turnover_band = '£500k-£750k';
        break;

      case '£750k-1m':
        org.organisation_turnover_band = '£750k-£1m';
        break;

      case '£1-5m':
        org.organisation_turnover_band = '£1m-£5m';
        break;

      case '£5-10m':
        org.organisation_turnover_band = '£5m-£10m';
        break;

      default:
        break;
    }

    // > Some organisations from the admin app have sector names that are
    //   changed in the new data model
    if (org.organisation_sector === 'Environmental or nature conservation') {
      org.organisation_sector = 'Environment or nature';
    }

    if (org.organisation_sector === 'Sports and leisure') {
      org.organisation_sector = 'Sport & leisure';
    }
  });

  entities.user.forEach((user) => {
    // User role mapping
    // > Users coming from the admin app have role names corresponding directly to
    //   roles in the new data model

    if (typeof user.user_role_names === 'string') {
      const cbAdmins = process.env.CB_ADMIN_EMAILS.split(',').map((x) => x.toLowerCase());

      switch (user.user_role_names) {
        case 'System Admin':
          user.user_role_names = ['SYS_ADMIN'];
          break;

        case 'Organisation Admin':
          if (cbAdmins.includes(user.user_email.toLowerCase())) {
            user.user_role_names = ['CB_ADMIN', 'VOLUNTEER_ADMIN'];
          } else {
            user.user_role_names = ['VOLUNTEER_ADMIN'];
          }
          break;

        case 'Volunteer':

          user.user_role_names = ['VOLUNTEER'];
          break;

        default:
          console.log('WARNING: uncaught user');
          break;
      }
    }

    // User gender mapping
    // > Lower case for consistency, and map "rather" to "prefer"
    if (typeof user.user_gender === 'string') {
      user.user_gender = user.user_gender.toLowerCase();

      if (user.user_gender === 'rather not say') {
        user.user_gender = 'prefer not to say';
      }
    }
  });

  return entities;
};


/*
 * mapToTargetSchema
 *
 * Both data sources use different schema to the target. Some entities need to be
 * mapped between and/or split into entities that correspond to the target schema.
 *
 * NOTE:
 * This function relies on the presence of a git-ignored file "region_map.js". This
 * file should export an object where the keys can be compiled to regexes to match
 * organisation names, and the values are region names compatible with the target
 * schema.
 */
const mapToTargetSchema = (entities) => {
  entities.organisation.forEach((org) => {
    // Organisations from Visitor app:
    // > organisations coming from the visitor app include password and email fields
    // > the visitor data model conflates the notion of organisation and user
    // > in the target data model, these concepts are separate
    if (org.hasOwnProperty('organisation_password') && org.hasOwnProperty('organisation_email')) {
      // Generate a new user record based on the email/password
      const user_id = uuid();
      const user = {
        user_id,
        user_name: org.organisation_name,
        user_email: org.organisation_email,
        user_password: org.organisation_password,
        user_created_at: org.organisation_created_at,
        fk_user_to_organisation: org.organisation_id,
        user_role_names: ['CB_ADMIN'], // By definition, this user is a CB_ADMIN
      };
      entities.user.push(user);
      delete org.organisation_email;
      delete org.organisation_password;
    }

    // Organisations without region:
    // > Organisations coming from the visitor app do not record their region
    // > Organisations coming from the admin app have a nullable `region` field
    // > Some organisations have their region fields manually set via the "regionMap"
    //   which associates regexes on the organisations with region names
    if (!org.hasOwnProperty('organisation_region')) {
      Object.keys(regionMap).forEach((orgRegex) => {
        const re = new RegExp(orgRegex, 'i');

        if (re.test(org.organisation_name)) {
          org.organisation_region = regionMap[orgRegex];
        } else {
          // Default to some region since this column is non-nullable.
          // This should only really happen for test orgs on the visitor.
          org.organisation_region = 'South West';
        }
      });

      if (!org.hasOwnProperty('organisation_region')) {
        org.organisation_region = 'South West';
      }
    }

    // Organisations without sectors
    // > Set the default sector as "Community hub", which is reasonably vague; can be changed later
    if (!org.hasOwnProperty('organisation_sector') || org.organisation_sector === null) {
      org.organisation_sector = 'Community hub, facility or space';
    }

    // Duplicated 360Giving IDs
    // > One organisation is signed up twice on the admin app with the same 360 ID
    // > Set the ID to null on the organisation that will be removed
    if (org.organisation_name === process.env.DUPLICATED_360_GIVING_ID_ORGANISATION_NAME) {
      org.organisation_360_giving_id = null;
    }

    // Undefined 360Giving IDs
    // > Organisations coming from the visitor app will not have a 360_giving_id field
    // > Default to null
    org.organisation_360_giving_id = org.organisation_360_giving_id || null;

    // "External workspace" organisations needn't have a turnover band
    if (org.organisation_name.startsWith('External Workspace')) {
      org.organisation_turnover_band = null;
    }

    // Generate admin codes if organisation doesn't already have one
    if (!org.organisation_admin_code) {
      org.organisation_admin_code = randomBytes(4).toString('hex');
    }

    // Fix inconsistent casing on extra workspace organisations
    if (/^extra workspace/i.test(org.organisation_name)) {
      org.organisation_name = org.organisation_name.replace('workspace', 'Workspace');
    }
  });


  entities.user.forEach((user) => {
    // User role names
    // > Users from the visitor app do not have a role assigned to them
    // > They are all visitors, except those already marked as CB_ADMINs above
    if (!user.hasOwnProperty('user_role_names')) {

      user.user_role_names = ['VISITOR'];
    }

    // User gender
    // > Default to "prefer not to say"
    if (!user.hasOwnProperty('user_gender') || user.user_gender === null || typeof user.user_gender !== 'string') {
      user.user_gender = 'prefer not to say';
    }

    // User disability
    // > Default to "prefer not to say"
    if (!user.hasOwnProperty('user_disability') || user.user_disability === null || typeof user.user_disability !== 'string') {
      user.user_disability = 'prefer not to say';
    }

    // User ethnicity
    // > Defaut to "prefer not to say"
    if (!user.hasOwnProperty('user_ethnicity') || user.user_ethnicity === null || typeof user.user_ethnicity !== 'string') {
      user.user_ethnicity = 'prefer not to say';
    }

    // User phone number
    // > Truncate overly long phone numbers
    if (user.hasOwnProperty('user_phone_number') && user.user_phone_number.length > 20) {
      user.user_phone_number = user.user_phone_number.slice(0, 20);
    }

    // User birth year
    // > Set to null any birth years that are clearly false or undefined
    if (user.hasOwnProperty('user_birth_year') && user.user_birth_year < 1890) {
      user.user_birth_year = null;
    }

    // Duplicate user e-mail
    // > Some user e-mails are duplicated across multiple accounts. This is a genuine
    //   use-case (see https://github.com/TwinePlatform/hq/issues/21)
    // > However, we set the emails of the anonymous accounts to null, as discussed in
    //   the linked issue.
    if (
      user.user_email === process.env.ANONYMOUS_USERS_DUPLICATE_EMAIL
      && user.user_id !== process.env.ANONYMOUS_USERS_MASTER_ID
    ) {
      user.user_email = null;
    }

    // Duplicate user e-mail
    // > E-mails for test accounts are re-used and can safely be set to null
    if (user.user_email === 'twinesocialbizintel@gmail.com' && user.user_name === 'random visitor') {
      user.user_email = null;
    }

    if (user.user_password) {
      user.user_password = user.user_password.replace('$2y$', '$2a$');
    }
  });

  (entities.visit_activity || []).forEach((activity) => {
    // Deleted visit Activities
    // > This field is going from a boolean to a timestamp in the new model
    // > We can reasonably use the current time
    if (activity.visit_activity_deleted) {
      activity.visit_activity_deleted_at = (new Date()).toISOString();
    }
    delete activity.visit_activity_deleted;
  });

  (entities.outreach_campaign || []).forEach((outreach_campaign) => {
    // Outreach Campaigns
    // > In the admin data model, there currently appears to be a 1-to-1 correspondence
    //   between rows in the "outreach_campaigns" table and what we now consider to be
    //   "outreach meetings" (which have a many-to-one relationship with "outreach campaigns")
    // > We therefore split each "outreach_campaign" model into a corresponding "outreach_meeting"
    //   meeting model too.
    const id = uuid();
    const oc = {
      outreach_campaign_id: id,
      outreach_campaign_type: outreach_campaign.outreach_campaign_type,
      fk_outreach_campaign_to_organisation: outreach_campaign.fk_outreach_campaign_to_organisation,
    };
    const om = {
      fk_outreach_meeting_to_user: outreach_campaign.fk_outreach_campaign_to_user,
      fk_outreach_meeting_to_outreach_campaign: id,
      outreach_meeting_type: outreach_campaign.outreach_campaign_interaction_type,
      outreach_meeting_scheduled_at: outreach_campaign.outreach_campaign_scheduled_at,
    };

    Object.assign(outreach_campaign, oc);
    delete outreach_campaign.fk_outreach_campaign_to_user;
    delete outreach_campaign.outreach_campaign_interaction_type;
    delete outreach_campaign.outreach_campaign_scheduled_at;

    entities.outreach_meeting = (entities.outreach_meeting || []).concat(om);
  });

  entities.volunteer_log = (entities.volunteer_log || [])
    .reduce((acc, l) => { // Remove duplicate logs
      const d = l.volunteer_log_started_at;

      if (!(d instanceof Date)) {
        return [...acc, l];
      }

      if (d.toISOString().startsWith('2018-04-30T23:00:00.000')
          && l.volunteer_log_duration === 480
          && l.volunteer_log_updated_at.toISOString().startsWith('2018-08-06T18:33:04')
      ) {
        return acc;
      }

      if (d.toISOString().startsWith('2018-09-06T11:03:13')
          && l.volunteer_log_updated_at.toISOString().startsWith('2018-09-07T10:03:31')
      ) {
        return acc;
      }

      if (d.toISOString().startsWith('2017-12-08T')
        && l.volunteer_log_duration === 420
        && l.volunteer_log_updated_at.toISOString().startsWith('2017-12-08T15:48:44')
      ) {
        return acc;
      }

      if (d.toISOString().startsWith('2018-09-17T15:47:01')
        && l.volunteer_log_duration === 420
      ) {
        const strippedAcc = acc.map((a) => omit(['volunteer_log_id'], a));
        const strippedLog = omit(['volunteer_log_id'], l);

        const existingLog = strippedAcc.find((x) => equals(x, strippedLog));

        if (existingLog) {
          return acc;
        }
      }

      if (d.toISOString().startsWith('2018-10-22T20:47:51')
        && l.volunteer_log_duration === 120
        && l.volunteer_log_created_at.toISOString().startsWith('2018-10-24T05:20:54')
      ) {
        return acc;
      }

      return [...acc, l];
    }, [])
    .map(evolve({ volunteer_log_duration: (a) => a * 60, volunteer_log_activity: (a) => a || 'Other' }));

  entities.visit_event = (entities.visit_event || []).filter((v) => {
    const d = v.visit_event_created_at;

    if (d.toISOString().startsWith('2018-07-26T11:18:37')
      || d.toISOString().startsWith('2018-07-26T15:59:43')
      || d.toISOString().startsWith('2018-06-22T10:34:29')
    ) {
      return false;
    }
    return true;
  });

  return entities;
};


module.exports = {
  replaceKeysWithUUIDs,
  removeTestData,
  mapConstantValues,
  mapToTargetSchema,
};

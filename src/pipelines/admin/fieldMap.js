/*
 * Field mapping for Twine Admin App Database
 *
 * Determines the column name aliases to prevent fields overwriting each other in the results.
 * Also serves as a column filter; columns not named in the mapping will be omitted from results.
 *
 * Structured as follows:
 *
 * {
 *   tableName: {
 *     columName: 'targetEntityName_targetFieldName',
 *     ...
 *   },
 *   ...
 * }
 *
 * The convention used to prevent name collisions is `entityName_fieldName`
 */

/*
 * NOTE: Tables ignored...
 *  - password_resets   = Transient data
 *  - invitations       = Transient data
 *  - admin_codes       = Transient data
 *  - frontlinesms_logs = Retrievable via FrontlineSMS API
 *  - survey_answers    = Retrievable via FrontlineSMS API
 *  - survey_questions  = Retrievable via FrontlineSMS API
 *  - financial_data    = Retrievable via FrontlineSMS API
 */
module.exports = {
  organisations: {
    id: 'organisation_id',
    name: 'organisation_name',
    address1: 'organisation_address_1',
    address2: 'organisation_address_2',
    town_city: 'organisation_town_city',
    postcode: 'organisation_post_code',
    lat: 'organisation_lat',
    long: 'organisation_lng',
    turnover_band: 'organisation_turnover_band',
    created_at: 'organisation_created_at',
    updated_at: 'organisation_modified_at',
    deleted_at: 'organisation_deleted_at',
    '360_giving_id': 'organisation_360_giving_id',
    // OMITTED: company_number     = Unneeded
    // OMITTED: merchant_id        = Unneeded
    // OMITTED: community_business = Flag to indicate whether ...
    // OMITTED: type               = Determines whether member of Twine Energy programme,
    //                             = now handled via subscription types
    // OMITTED: region_id          = Handled in JOIN
    // OMITTED: sector_id          = Handled in JOIN
  },
  regions: {
    name: 'organisation_region',
  },
  sectors: {
    name: 'organisation_sector',
  },
  users: {
    id: 'user_id',
    name: 'user_name',
    email: 'user_email',
    password: 'user_password',
    phone: 'user_phone_number',
    yearOfBirth: 'user_birth_year',
    status: 'user_status',
    created_at: 'user_created_at',
    updated_at: 'user_modified_at',
    deleted_at: 'user_deleted_at',
    api_token: 'user_api_token',
    // OMITTED: region_id = Handled in JOIN
    // OMITTED: gender_id = Handled in JOIN
    // OMITTED: role_id   = Handled in JOIN
  },
  user_roles: {
    name: 'user_role_name',
  },
  meetings: {
    id: 'outreach_meeting_id',
    partner: 'outreach_meeting_partner',
    date: 'outreach_meeting_scheduled_at',
    user_id: 'outreach_meeting_to_user_fk',
    // OMITTED: type            = Handled in JOIN
    // OMITTED: user_id         = Handled in JOIN
    // OMITTED: organisation_id = Handled in JOIN
  },
  activities: {
    id: 'volunteer_activity_id',
    name: 'volunteer_activity_name',
    created_at: 'volunteer_activity_created_at',
    updated_at: 'volunteer_activity_modified_at',
    deleted_at: 'volunteer_activity_deleted_at',
  },
  logs: {
    id: 'volunteer_log_id',
    user_id: 'volunteer_log_to_user_fk',
    activity_id: 'volunteer_log_to_volunteer_activity_fk',
    duration: 'volunteer_log_duration',
    date_of_log: 'volunteer_log_created_at',
    // OMITTED: organisation_id = Handled in JOIN
  },
  frontlinesms_api_keys: {
    id: 'frontline_account_id',
    key: 'frontline_account_api_key',
    workspace_id: 'frontline_account_workspace_id',
    // OMITTED: organisation_id = Handled in JOIN
  },
  outreaches: {
    id: 'outreach_id',
    date: 'outreach_scheduled_at',
    interaction_type: 'outreach_interaction_type',
    user_id: 'outreach_to_user_fk',
    created_at: 'outreach_created_at',
    updated_at: 'outreach_updated_at',
    deleted_at: 'outreach_deleted_at',
    // OMITTED: outreach_child_type = Handled in JOIN
    // OMITTED: outreach_type       = Handled in JOIN
    // OMITTED: organisation_id     = Handled in JOIN
  },
  outreach_types: {
    name: 'outreach_type',
    // OMITTED: created_at = Unimportant
    // OMITTED: updated_at = Unimportant
    // OMITTED: deleted_at = Unimportant
  },
  outreach_child_types: {
    name: 'outreach_child_type',
    // OMITTED: created_at = Unimportant
    // OMITTED: updated_at = Unimportant
    // OMITTED: deleted_at = Unimportant
    // OMITTED: outreach_id = Unknown meaning
  },
};

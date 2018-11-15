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
 *  - frontlinesms_logs = Retrievable via FrontlineSMS API
 *  - survey_answers    = Retrievable via FrontlineSMS API
 *  - survey_questions  = Retrievable via FrontlineSMS API
 *  - financial_data    = Retrievable via FrontlineSMS API
 *  - meetings          = Empty table
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
    // OMITTED: company_number     = Unimportant
    // OMITTED: merchant_id        = Unimportant
    // OMITTED: community_business = Flag to indicate whether ...?
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
  genders: {
    name: 'user_gender',
  },
  users: {
    id: 'user_id',
    name: 'user_name',
    email: 'user_email',
    password: 'user_password',
    phone: 'user_phone_number',
    yearOfBirth: 'user_birth_year',
    created_at: 'user_created_at',
    updated_at: 'user_modified_at',
    deleted_at: 'user_deleted_at',
    organisation_id: 'fk_user_to_organisation',
    // OMITTED: region_id      = Unimportant
    // OMITTED: gender_id      = Handled in JOIN
    // OMITTED: role_id        = Handled in JOIN
    // OMITTED: remember_token = Unimportant
    // OMITTED: api_token      = Unused
    // OMITTED: status         = Unused
  },
  user_roles: {
    name: 'user_role_name',
  },
  meeting_types: {
    name: 'outreach_campaign_interaction_type',
  },
  activities: {
    name: 'volunteer_log_activity',
    // OMITTED: id         = Unimportant
    // OMITTED: created_at = Unimportant
    // OMITTED: updated_at = Unimportant
    // OMITTED: deleted_at = Unimportant
  },
  logs: {
    id: 'volunteer_log_id',
    user_id: 'fk_volunteer_log_to_user',
    organisation_id: 'fk_volunteer_log_to_organisation',
    duration: 'volunteer_log_duration',
    date_of_log: 'volunteer_log_started_at',
    created_at: 'volunteer_log_created_at',
    updated_at: 'volunteer_log_updated_at',
    // OMITTED: activity_id = Handled in JOIN
  },
  frontlinesms_api_keys: {
    id: 'frontline_account_id',
    key: 'frontline_account_api_key',
    workspace_id: 'frontline_account_workspace_id',
    organisation_id: 'fk_frontline_account_to_organisation',
  },
  outreaches: {
    id: 'outreach_campaign_id',
    date: 'outreach_campaign_scheduled_at',
    user_id: 'fk_outreach_campaign_to_user',
    organisation_id: 'fk_outreach_campaign_to_organisation',
    created_at: 'outreach_campaign_created_at',
    updated_at: 'outreach_campaign_updated_at',
    deleted_at: 'outreach_campaign_deleted_at',
    // OMITTED: outreach_child_type = Handled in JOIN
    // OMITTED: outreach_type       = Handled in JOIN
    // OMITTED: interaction_type    = Handled in JOIN
  },
  outreach_types: {
    name: 'outreach_campaign_type',
    // OMITTED: created_at = Unimportant
    // OMITTED: updated_at = Unimportant
    // OMITTED: deleted_at = Unimportant
  },
  outreach_child_types: {
    name: 'outreach_campaign_child_type',
    // OMITTED: created_at  = Unimportant
    // OMITTED: updated_at  = Unimportant
    // OMITTED: deleted_at  = Unimportant
    // OMITTED: outreach_id = Unknown meaning
  },
  admin_codes: {
    code: 'organisation_admin_code',
    // OMITTED: organisation_id = Handled in JOIN
    // OMITTED: id              = Unimportant
    // OMITTED: created_at      = Unimportant
    // OMITTED: updated_at      = Unimportant
    // OMITTED: deleted_at      = Unimportant
  },
};

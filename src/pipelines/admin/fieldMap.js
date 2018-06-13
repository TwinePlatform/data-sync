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
    name: 'region_name',
  },
  sectors: {
    name: 'sector_name',
  },
  users: {
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
  meetings: {
    partner: 'outreach_meeting_partner',
    date: 'outreach_meeting_scheduled_at',
    // OMITTED: type            = Handled in JOIN
    // OMITTED: user_id         = Handled in JOIN
    // OMITTED: organisation_id = Handled in JOIN
  },
};

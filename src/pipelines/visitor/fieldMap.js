/*
 * Field mapping for Twine Visitor App Database
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
module.exports = {
  cbusiness: {
    id: 'organisation_id',
    org_name: 'organisation_name',
    genre: 'organisation_sector',
    uploadedfilecloudinaryurl: 'organisation_logo_url',
    hash_pwd: 'organisation_password',
    email: 'organisation_email',
    date: 'organisation_created_at',
  },
  users: {
    id: 'user_id',
    fullname: 'user_name',
    sex: 'user_gender',
    yearofbirth: 'user_birth_year',
    hash: 'user_secret',
    email: 'user_email',
    phone_number: 'user_phone_number',
    date: 'user_created_at',
    is_email_contact_consent_granted: 'user_is_email_contact_consent_granted',
    is_sms_contact_consent_granted: 'user_is_sms_contact_consent_granted',
  },
  activities: {
    id: 'activity_id',
    name: 'activity_name',
    deleted: 'activity_deleted',
    monday: 'activity_monday',
    tuesday: 'activity_tuesday',
    wednesday: 'activity_wednesday',
    thursday: 'activity_thursday',
    friday: 'activity_friday',
    saturday: 'activity_saturday',
    sunday: 'activity_sunday',
    date: 'activity_created_at',
  },
  visits: {
    id: 'visit_id',
    usersid: 'visit_to_users_fk',
    activitiesid: 'visit_to_activities_fk',
    date: 'visit_created_at',
  },
  feedback: {
    id: 'feedback_id',
    feedback_date: 'feedback_created_at',
    feedback_score: 'feedback_score',
  }
};

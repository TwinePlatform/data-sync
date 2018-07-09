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
    cb_id: 'fk_user_to_organisation',
    fullname: 'user_name',
    sex: 'user_gender',
    yearofbirth: 'user_birth_year',
    hash: 'user_qr_code',
    email: 'user_email',
    phone_number: 'user_phone_number',
    date: 'user_created_at',
    is_email_contact_consent_granted: 'user_is_email_contact_consent_granted',
    is_sms_contact_consent_granted: 'user_is_sms_contact_consent_granted',
  },
  activities: {
    id: 'visit_activity_id',
    cb_id: 'fk_visit_activity_to_organisation',
    name: 'visit_activity_name',
    deleted: 'visit_activity_deleted',
    monday: 'visit_activity_monday',
    tuesday: 'visit_activity_tuesday',
    wednesday: 'visit_activity_wednesday',
    thursday: 'visit_activity_thursday',
    friday: 'visit_activity_friday',
    saturday: 'visit_activity_saturday',
    sunday: 'visit_activity_sunday',
    date: 'visit_activity_created_at',
  },
  visits: {
    id: 'visit_event_id',
    usersid: 'fk_visit_event_to_user',
    cb_id: 'fk_visit_event_to_organisation',
    activitiesid: 'fk_visit_event_to_visit_activity',
    date: 'visit_event_created_at',
  },
  feedback: {
    id: 'visit_feedback_id',
    cb_id: 'fk_visit_feedback_to_organisation',
    feedback_date: 'visit_feedback_created_at',
    feedback_score: 'visit_feedback_score',
  },
};

const knex = require('knex');
const Extract = require('./extract');
const Transform = require('./transform');
const Load = require('./load');


const createClient = (url, client = 'pg') => knex({ client, connection: url });


const migrate = async (visitorSourceUrl, adminSourceUrl, targetUrl) => { //eslint-disable-line
  const visitorSource = createClient(visitorSourceUrl);
  const adminSource = createClient(adminSourceUrl, 'mysql');
  const targetSink = createClient(targetUrl);

  targetSink
    .on('query-error', (error, obj) => console.log('error', error, obj));

  /*
   * Extract
   */
  const visitorData = await Extract.visitor(visitorSource);
  const adminData = await Extract.admin(adminSource);

  /*
   * Transform
   */
  const visitorGraph = Transform.visitor(visitorData);
  const adminGraph = Transform.admin(adminData);

  /*
   * Merge graphs
   */
  const primary = Transform.merge(adminGraph, visitorGraph);

  /*
   * Load into target db
   */
  await targetSink.transaction(async (trx) => {
    await Load.organisation(primary, trx);
    await Load.user(primary, trx);
    await Load.visit_activity(primary, trx);
    await Load.visit_event(primary, trx);
    await Load.visit_feedback(primary, trx);
    await Load.frontline_account(primary, trx);
    await Load.volunteer_log(primary, trx);
    return Load.outreach_campaign(primary, trx);
  });

  return Promise.all([visitorSource.destroy(), adminSource.destroy(), targetSink.destroy()]);
};

module.exports = migrate;

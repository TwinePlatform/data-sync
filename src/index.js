const util = require('util');
const knex = require('knex');
const Pipelines = require('./pipelines');

const createClient = (url) => knex({ client: 'pg', connection: url });

// migrate :: String -> String -> String -> Promise ()
const migrate = async (visitorSourceUrl, adminSourceUrl, targetUrl) => {
  const visitorSource = createClient(visitorSourceUrl);
  // const adminSource   = createClient(adminSourceUrl);
  // const target        = createClient(targetUrl);

  return Pipelines.visitor(visitorSource).then(((res) => {
    console.log(util.inspect(res, false, 2));
    return visitorSource.destroy()
  }));
};

module.exports = migrate;

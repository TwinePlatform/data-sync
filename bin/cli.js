#!/usr/bin/env node
require('dotenv').config();
const { mergeDeepRight } = require('ramda');
const parser = require('minimist');
const migrate = require('../src');

const main = (argv) => {
  const defaults = {
    visitorUrl: process.env.DB_URL_VISITOR,
    adminUrl: process.env.DB_URL_ADMIN,
    targetUrl: process.env.DB_URL_TARGET,
  };

  const args = parser(argv.slice(2));
  const urls = mergeDeepRight(defaults, args);

  migrate(urls.visitorUrl, urls.adminUrl, urls.targetUrl)
    .then(() => console.log('Migration successful'))
    .catch(((err) => console.error('Oops!', err)));
};


if (require.main === module) {
  main(process.argv);
}

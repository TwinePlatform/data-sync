#!/usr/bin/env node
const parser = require('minimist');
const migrate = require('../src');

const main = (argv) => {
  const { visitorSource, adminSource, target } = parser(argv.slice(2));

  migrate(visitorSource, adminSource, target)
    .then(() => console.log('Migration successful'))
    .catch(((err) => console.error('Oops!', err)));
};


if (require.main === module) {
  main(process.argv);
}

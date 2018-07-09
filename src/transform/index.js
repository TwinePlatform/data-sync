const { compose } = require('ramda');
const {
  replaceKeysWithUUIDs, removeTestData, mapConstantValues, mapToTargetSchema,
} = require('./pre_process');
const merge = require('./merge');

const commonPipeline = compose(
  mapToTargetSchema, // map entities to be consistent w/ target schema
  mapConstantValues, // map all constants to values consistent w/ target schema
  replaceKeysWithUUIDs, // replace foreign keys w/ UUIDs
);

const visitorPipeline = compose(
  commonPipeline,
  removeTestData,
);

module.exports = {
  visitor: visitorPipeline,
  admin: commonPipeline,
  merge,
};

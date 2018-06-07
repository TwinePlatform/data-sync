const { pipe, toPairs, fromPairs, filter, apply } = require('ramda');

const _ = module.exports = {}

_.isPlainObject = (o) => typeof o === 'object' && !Array.isArray(o) && o !== null;

_.flattenObject = (obj, prefix = '') =>
  Object.keys(obj).reduce((acc, k) =>
    _.isPlainObject(obj[k])
      ? { ...acc, ..._.flattenObject(obj[k], k) }
      : { ...acc, [`${[prefix, prefix ? '.' : ''].join('')}${k}`]: obj[k] }
  , {});

_.filterWithKeys = (pred) => pipe(toPairs, filter(apply(pred)), fromPairs);

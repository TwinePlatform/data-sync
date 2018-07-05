const {
  pipe, toPairs, fromPairs, filter, apply,
} = require('ramda');


// isPlainObject :: a -> Boolean
const isPlainObject = (o) => typeof o === 'object' && !Array.isArray(o) && o !== null;

// flattenObject :: Object (k: Object) -> Object (k: v)
const flattenObject = (obj, prefix = '') =>
  Object.keys(obj).reduce(
    (acc, k) =>
      isPlainObject(obj[k])
        ? { ...acc, ...flattenObject(obj[k], k) }
        : { ...acc, [`${[prefix, prefix ? '.' : ''].join('')}${k}`]: obj[k] }
    , {}
  );

// filterWithKeys :: ((String, a) -> Boolean) -> Object -> Object
const filterWithKeys = (pred) => pipe(toPairs, filter(apply(pred)), fromPairs);

// generateAliases :: Object -> String
const generateAliases = (fieldMap) => {
  const obj = flattenObject(fieldMap);
  return Object
    .keys(obj)
    .reduce((acc, k) => acc.concat(`${k} AS ${obj[k]}`), []);
};


module.exports = {
  isPlainObject,
  flattenObject,
  filterWithKeys,
  generateAliases,
};

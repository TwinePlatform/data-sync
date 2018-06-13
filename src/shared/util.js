const {
  pipe, toPairs, fromPairs, filter, apply,
} = require('ramda');


const isPlainObject = (o) => typeof o === 'object' && !Array.isArray(o) && o !== null;

const flattenObject = (obj, prefix = '') =>
  Object.keys(obj).reduce(
    (acc, k) =>
      isPlainObject(obj[k])
        ? { ...acc, ...flattenObject(obj[k], k) }
        : { ...acc, [`${[prefix, prefix ? '.' : ''].join('')}${k}`]: obj[k] }
    , {}
  );

const filterWithKeys = (pred) => pipe(toPairs, filter(apply(pred)), fromPairs);

const escapeNumericFields = (s) => s.replace(/\.(\d+\w*)$/, (match, p1) => `."${p1}"`);
const escapeUpperCaseFields = (s) => s.replace(/\.(.*[A-Z].*)$/, (match, p1) => `."${p1}"`);
const escapeFields = pipe(escapeNumericFields, escapeUpperCaseFields);

// generateAliasString :: Object -> String
const generateAliasString = (fieldMap) => {
  const obj = flattenObject(fieldMap);
  return Object
    .keys(obj)
    .reduce((acc, k) => acc.concat(`${escapeFields(k)} AS ${obj[k]}`), [])
    .join(', ');
};


module.exports = {
  isPlainObject,
  flattenObject,
  filterWithKeys,
  escapeNumericFields,
  generateAliasString,
};

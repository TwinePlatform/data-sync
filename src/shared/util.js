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

// escapeNumericFields :: String -> String
const escapeNumericFields = (s) => s.replace(/\.(\d+\w*)$/, (match, p1) => `."${p1}"`);

// escapeUpperCaseFields :: String -> String
const escapeUpperCaseFields = (s) => s.replace(/\.(.*[A-Z].*)$/, (match, p1) => `."${p1}"`);

// escapeFields :: String -> String
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

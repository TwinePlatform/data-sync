const {
  pipe, toPairs, fromPairs, filter, apply, curry, compose, assoc, trim, map,
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

// mapKeys :: (k -> a) -> { k: v } -> { a: v }
const mapKeys = curry((f, o) => Object.keys(o).reduce((acc, k) => assoc(f(k), o[k], acc), {}));

const trimFields = (s) =>
  typeof s === 'string' ? trim(s) : s;

// stripPrefix :: String -> { k: v } -> { k: v }
const stripPrefix = (pref) => mapKeys((s) => s.startsWith('fk') ? s : s.replace(`${pref}_`, ''));

// stripId :: { k: v } -> { k: v }
const stripId = filterWithKeys((s) => !s.startsWith('id'));

// sanitiseEntity :: String -> { k: v } -> { k: v }
const sanitiseEntity = (prefix) => compose(
  map(trimFields),
  stripId,
  stripPrefix(prefix),
);

// prefixColNames :: { k: v } -> { k: v }
const prefixColNames = mapKeys((k) => ({
  created_at: 'organisation.created_at',
  modified_at: 'organisation.modified_at',
  deleted_at: 'organisation.deleted_at',
}[k] || k));

const log = (...args) => {
  if (process.env.LOUD) {
    console.log(...args);
  }
};

module.exports = {
  isPlainObject,
  flattenObject,
  filterWithKeys,
  generateAliases,
  sanitiseEntity,
  mapKeys,
  prefixColNames,
  log,
};

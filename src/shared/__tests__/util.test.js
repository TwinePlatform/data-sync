const { flattenObject, generateAliases } = require('../util');

describe('Utility functions', () => {
  describe('flattenObject', () => {
    test('leaves an unnested object invariant', () => {
      expect(flattenObject({ foo: 1 })).toEqual({ foo: 1 });
    });

    test('flattens a nested object using value path as key', () => {
      expect(flattenObject({ foo: 1, bar: { baz: 2 } })).toEqual({ foo: 1, 'bar.baz': 2 });
    });
  });

  describe('generateAliases', () => {
    test('generates empty array given an empty object', () => {
      expect(generateAliases({})).toEqual([]);
    });

    test('generates aliasing select statement using given object', () => {
      expect(generateAliases({ foo: { yar: 'far' }, baz: { haz: 'lol' } })).toEqual(['foo.yar AS far', 'baz.haz AS lol']);
    });
  });
});

const { flattenObject, generateAliasString } = require('../util');

describe('Utility functions', () => {
  describe('flattenObject', () => {
    test('leaves an unnested object invariant', () => {
      expect(flattenObject({ foo: 1 })).toEqual({ foo: 1 });
    });

    test('flattens a nested object using value path as key', () => {
      expect(flattenObject({ foo: 1, bar: { baz: 2 } })).toEqual({ foo: 1, 'bar.baz': 2 });
    });
  });

  describe('generateAliasString', () => {
    test('generates empty string given an empty object', () => {
      expect(generateAliasString({})).toBe('');
    });

    test('generates aliasing select statement using given object', () => {
      expect(generateAliasString({ foo: { yar: 'far' }, baz: { haz: 'lol' } })).toBe('foo.yar AS far, baz.haz AS lol');
    });
  });
});

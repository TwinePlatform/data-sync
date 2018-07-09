const { flattenObject, generateAliases, sanitiseEntity } = require('../util');

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

  describe('sanitiseEntity', () => {
    test('strips given prefix from object keys, leaving non-prefixed keys', () => {
      const fn = sanitiseEntity('foo');

      const res = fn({
        foo_bar: 1, foo_baz: 2, lol: 3, fk_bop: 4,
      });

      expect(res).toEqual({
        bar: 1,
        baz: 2,
        lol: 3,
        fk_bop: 4,
      });
    });

    test('strips "id" key, leaving all other keys', () => {
      const fn = sanitiseEntity('foo');

      const res = fn({
        foo_id: 2, foo_bar: 1, foo_baz: 2, lol: 3,
      });

      expect(res).toEqual({
        bar: 1,
        baz: 2,
        lol: 3,
      });
    });
  });
});

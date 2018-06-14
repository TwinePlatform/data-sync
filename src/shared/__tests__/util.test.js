const { flattenObject, escapeNumericFields, generateAliasString } = require('../util');

describe('Utility functions', () => {
  describe('flattenObject', () => {
    test('leaves an unnested object invariant', () => {
      expect(flattenObject({ foo: 1 })).toEqual({ foo: 1 });
    });

    test('flattens a nested object using value path as key', () => {
      expect(flattenObject({ foo: 1, bar: { baz: 2 } })).toEqual({ foo: 1, 'bar.baz': 2 });
    });
  });

  describe('escapeNumericFields', () => {
    test('leaves non-numeric fields unchanged', () => {
      expect(escapeNumericFields('boo.bar')).toBe('boo.bar');
    });
    test('leaves fields not starting with a number unchanged', () => {
      expect(escapeNumericFields('boo.bar1')).toBe('boo.bar1');
    });
    test('escapes fields starting with numbers using double quotes', () => {
      expect(escapeNumericFields('boo.1bar')).toBe('boo."1bar"');
    });
  });

  describe('generateAliasString', () => {
    test('generates empty string given an empty object', () => {
      expect(generateAliasString({})).toBe('');
    });

    test('generates aliasing select statement using given object', () => {
      expect(generateAliasString({ foo: { yar: 'far' }, baz: { haz: 'lol' } })).toBe('foo.yar AS far, baz.haz AS lol');
    });

    test('generates aliasing select statement with escaped fields when columns start with numbers', () => {
      expect(generateAliasString({ foo: { '360_boo': 'hi' }, baz: { haz: 'lol' } })).toBe('foo."360_boo" AS hi, baz.haz AS lol');
    });

    test('generates aliasing select statement with escaped fields when columns contain capital letters', () => {
      expect(generateAliasString({ foo: { yearOfBirth: 'hi' }, baz: { haz: 'lol' } })).toBe('foo."yearOfBirth" AS hi, baz.haz AS lol');
    });
  });
});

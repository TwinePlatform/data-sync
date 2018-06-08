const { flattenObject } = require('../util');

describe('Utility functions', () => {
  describe('flattenObject', () => {
    test('leaves an unnested object invariant', () => {
      expect(flattenObject({ foo: 1 })).toEqual({ foo: 1 });
    });

    test('flattens a nested object using value path as key', () => {
      expect(flattenObject({ foo: 1, bar: { baz: 2 } })).toEqual({ foo: 1, 'bar.baz': 2 });
    });
  });
});

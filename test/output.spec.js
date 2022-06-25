'use strict';

const assert = require('assert');
const { fail } = require('../output');

describe('output', () => {
  describe('fail', () => {
    let core;
    let actualError;
    before(() => {
      core = fail.core;
      fail.core = {
        setFailed: err => actualError = err,
      };
    });
    beforeEach(() => {
      actualError = undefined;
    });
    after(() => {
      fail.core = core;
    })

    it('should call setFailed, given string', () => {
      const expected = 'test';
      fail(expected);
      assert.strictEqual(actualError, expected);
    });

    it('should call setFailed, given Error', () => {
      const expected = new Error('test');
      fail(expected);
      assert.strictEqual(actualError, expected);
    });

    it('should call setFailed with generic error message, given undefined error', () => {
      const expected = fail.genericErrorMessage;
      fail(undefined);
      assert.strictEqual(actualError, expected);
    });

    it('should call setFailed with generic error message, given null error', () => {
      const expected = fail.genericErrorMessage;
      fail(null);
      assert.strictEqual(actualError, expected);
    });

    it('should call setFailed with generic error message, given empty string error', () => {
      const expected = fail.genericErrorMessage;
      fail('');
      assert.strictEqual(actualError, expected);
    });
  })
});

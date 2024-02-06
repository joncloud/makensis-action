'use strict';

import assert from 'assert';
import { fail } from '../src/output.js';

describe('output', () => {
  describe('fail', () => {
    let setFailed;
    let actualError;
    before(() => {
      setFailed = fail.setFailed;
      fail.setFailed = err => actualError = err;
    });
    beforeEach(() => {
      actualError = undefined;
    });
    after(() => {
      fail.core = setFailed;
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

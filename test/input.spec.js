'use strict';

import assert from 'assert';
import { getInput } from '../src/input.js';

describe('input', () => {
  describe('getInput', () => {
    let coreGetInput;
    let inputs = {};
    before(() => {
      coreGetInput = getInput.coreGetInput;
      getInput.coreGetInput = key => inputs[key] ?? '';
    });
    after(() => {
      getInput.core = coreGetInput;
    })

    it('should assign customArguments, given \'arguments\'', () => {
      inputs = {
        'arguments': 'abc',
      };
      const expected = 'abc';
      const { customArguments: actual } = getInput()
      assert.strictEqual(actual, expected);
    });

    it('should assign additionalPluginPaths, given \'additional-plugin-paths\'', () => {
      inputs = {
        'additional-plugin-paths': 'abc\ndef\rghi',
      };
      const expected = ['abc', 'def', 'ghi'];
      const { additionalPluginPaths: actual } = getInput()
      assert.deepStrictEqual(actual, expected);
    });

    it('should not include additionalPluginPaths, given whitespace in \'additional-plugin-paths\'', () => {
      inputs = {
        'additional-plugin-paths': 'abc\ndef\rghi\n   \t\r\njkl',
      };
      const expected = ['abc', 'def', 'ghi', 'jkl'];
      const { additionalPluginPaths: actual } = getInput()
      assert.deepStrictEqual(actual, expected);
    });

    it('should trim additionalPluginPaths, given whitespace padding in \'additional-plugin-paths\'', () => {
      inputs = {
        'additional-plugin-paths': 'abc\n  def  \r\t\tghi\t\t\nsomething with spaces',
      };
      const expected = ['abc', 'def', 'ghi', 'something with spaces'];
      const { additionalPluginPaths: actual } = getInput()
      assert.deepStrictEqual(actual, expected);
    });

    it('should assign scriptFile, given \'script-file\'', () => {
      inputs = {
        'script-file': 'abc',
      };
      const expected = 'abc';
      const { scriptFile: actual } = getInput()
      assert.strictEqual(actual, expected);
    });
  });
});

'use strict';

const assert = require('assert');
const { exec } = require('child_process');
const { access, unlink } = require('fs/promises');
const path = require('path');

const exists = async (path) => {
  try {
    await access(path);
    return true;
  }
  catch {
    return false;
  }
};

/**
 * @param {string} path
 */
const unlinkIfExistsAsync = async (path) => {
  if (await exists(path)) {
    unlink(path);
  }
};

describe('e2e', () => {
  before(async () => {
    const promises = ['./basic.exe', './with-plugins.exe']
      .map(unlinkIfExistsAsync);

    await Promise.all(promises);
  });

  /**
   * @typedef {{
   *   customArguments?: string,
   *   additionalPluginPaths?: string[],
   *   scriptFile?: string,
   * }} RunOptions
   * @param {RunOptions} options
   */
  const run = async (options = {}) => {
    const {
      customArguments,
      additionalPluginPaths,
      scriptFile
    } = options;

    const args = [];
    const env = {
      ...process.env,
      debug: 'true',
    };
    if (customArguments) {
      args.push('INPUT_ARGUMENTS', customArguments);
    }
    if (additionalPluginPaths && additionalPluginPaths.length) {
      args.push('INPUT_ADDITIONAL-PLUGIN-PATHS', additionalPluginPaths.join('\n'));
    }
    if (scriptFile) {
      args.push('INPUT_SCRIPT-FILE', scriptFile);
    }

    // Call bootstrap.js do avoid a problem where hyphenated environment
    // variables are unable to be assigned on non-windows platforms.
    const programPath = require.resolve('./bootstrap');
    const testDir = path.dirname(programPath);
    const cwd = path.join(testDir, '../');
    const promise = new Promise((resolve, reject) => {
      exec(`node ${programPath} ${args.join(' ')}`, {
        env,
        cwd,
      }, (error, stdout, stderr) => {
        console.log('cwd', cwd);
        console.log('stdout', stdout);
        console.log('stderr', stderr);
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    await promise;
  };

  /**
   * @param {string} script
   * @param {(options: RunOptions) => void} fn
   */
  const test = (script, fn) => {
    it(`should create installer for ${script}.nsi`, async () => {
      const options = {
        scriptFile: `./test/${script}.nsi`
      };
      if (fn) {
        fn(options);
      }

      await run(options);

      const actual = await exists(`./test/${script}.exe`);

      assert(
        actual,
        `Installer \`./test/${script}.exe\` should exist`
      );
    });
  };

  test('basic');
  test('with-plugins', options => options.additionalPluginPaths = [
    './test/EnVar'
  ]);
});

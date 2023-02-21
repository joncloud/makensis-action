'use strict';

import assert from 'assert';
import { exec } from 'child_process';
import { access, unlink, readFile } from 'fs/promises';
import { dirname, join, resolve } from 'path';
import { createHash } from 'crypto';
import { platform } from 'os';

const exists = async (p) => {
  try {
    await access(p);
    return true;
  }
  catch {
    return false;
  }
};

/**
 * @param {string} p
 */
const unlinkIfExistsAsync = async (p) => {
  if (await exists(p)) {
    unlink(p);
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
   *   customArguments: string,
   *   additionalPluginPaths: string[],
   *   scriptFile: string,
   *   defines: string[],
   *   outfile: string,
   * }} RunOptions
   * @param {Partial<RunOptions>} options
   */
  const run = async (options = {}) => {
    const {
      customArguments,
      additionalPluginPaths,
      scriptFile,
      defines,
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
    if (defines) {
      args.push('INPUT_DEFINES', defines.join('\n'));
    }

    // Call bootstrap.js do avoid a problem where hyphenated environment
    // variables are unable to be assigned on non-windows platforms.
    const programPath = resolve('./test/bootstrap.js');
    const testDir = dirname(programPath);
    const cwd = join(testDir, '../');
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
   * @param {(options: Partial<RunOptions>) => void} fn
   */
  const test = (script, fn) => {
    it(`should create installer for ${script}.nsi`, async () => {
      /** @type {Partial<RunOptions>} */
      const options = {
        scriptFile: `./test/${script}.nsi`
      };
      if (fn) {
        fn(options);
      }

      await run(options);

      const outfile = options.outfile || script;

      const actual = await exists(`./test/${outfile}.exe`);

      assert(
        actual,
        `Installer \`./test/${outfile}.exe\` should exist`
      );
    });
  };

  test('basic');
  test('with-plugins', options => options.additionalPluginPaths = [
    './test/EnVar'
  ]);
  test('with-defines', options => {
    options.defines = [
      'OUT_FILE=foo',
    ];
    options.outfile = 'foo';
  });

  // Skip for windows due to inconsistency
  if (platform() !== 'win32') {
    it('should have the latest build committed', async () => {
      const hashFile = async (filename) => {
        const buffer = await readFile(filename);
        const hex = createHash('sha256')
          .update(buffer)
          .digest('hex');
        return hex;
      };

      const before = await hashFile('./dist/index.cjs');
      await new Promise((resolve, reject) => {
        exec('npm run build').on('exit', (code) => {
          if (code === 0) {
            resolve(code);
          } else {
            reject(code);
          }
        });
      });
      const after = await hashFile('./dist/index.cjs');

      assert.strictEqual(before, after);
    });
  }
});

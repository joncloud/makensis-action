'use strict';

import assert from 'assert';
import { exec, fork } from 'child_process';
import { createReadStream } from 'fs';
import { access, unlink, stat } from 'fs/promises';
import { dirname, join, resolve } from 'path';
import { createHash } from 'crypto';
import { platform } from 'os';
import { pipeline } from 'stream/promises';

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
    const programPath = resolve('./test/bootstrap.js');
    const testDir = dirname(programPath);
    const cwd = join(testDir, '../');
    const promise = new Promise((resolve, reject) => {
      const proc = fork(programPath, args, {
        env,
        cwd,
      });
      proc.on('close', (exitCode) => {
        if (exitCode !== 0) {
          reject(new Error(`Unexpected exit code: ${exitCode}`));
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

  // Skip for windows due to inconsistency
  if (platform() !== 'win32') {
    it('should have the latest build committed', async () => {
      const hashFile = async (filename) => {
        const stream = createReadStream(filename, { autoClose: true });
        const hash = createHash('sha256');
        await pipeline(stream, hash);
        const hex = hash.digest('hex');
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

  // The bundle shouldn't grow too large. This test will make
  // sure that any future changes intentionally increases the bundle size.
  it('should not have an unexpectedly large bundled file', async () => {
    const actual = await stat('./dist/index.cjs');

    assert.ok(actual.size < 45000);
  });
});

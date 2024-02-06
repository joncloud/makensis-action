'use strict';

import { access, unlink } from 'fs/promises';
import { resolve } from 'path';
import assert from 'assert';
import { Installer } from '../src/installer.js';

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

describe('Installer', () => {
  const existingScriptPath = './test/basic.nsi';
  before(async () => {
    const promises = ['./basic.exe', './with-plugins.exe']
      .map(unlinkIfExistsAsync);

    await Promise.all(promises);
  });

  describe('createInstaller', () => {
    const test = (script, fn) => {
      it(`should create installer for ${script}.nsi`, async () => {
        const debugMode = true;
        const target = new Installer(debugMode);

        if (fn) {
          fn(target);
        }

        try {
          await target.createInstallerAsync(`./test/${script}.nsi`);
        }
        catch (err) {
          console.error(err);
          throw err;
        }

        const actual = await exists(`./test/${script}.exe`);

        assert.strictEqual(
          actual,
          true,
          `Installer \`./test/${script}.exe\` should exist`
        );
      });
    };

    test('basic');
    test('with-plugins', target => target.addPluginPath('./test/EnVar'));
  });

  describe('getCustomArguments', () => {
    it('should return blank, given new instance', () => {
      const debugMode = false;
      const target = new Installer(debugMode);

      const args = target.getCustomArguments();

      assert.strictEqual(args, '');
    });

    it('should return value, given setCustomArguments call', () => {
      const debugMode = false;
      const target = new Installer(debugMode);

      const expected = Math.random().toString();
      target.setCustomArguments(expected);

      const args = target.getCustomArguments();

      assert.strictEqual(args, expected);
    });
  });

  describe('getProcessArguments', () => {
    it('should default to no warnings verbosity, given no debug mode', () => {
      const debugMode = false;
      const target = new Installer(debugMode);

      const args = target.getProcessArguments(existingScriptPath);

      assert(
        args.includes('-V1'),
        `'${args.join(',')}' should include -V1`
      );
    });

    it('should default to all verbosity, given **debug** mode', () => {
      const debugMode = true;
      const target = new Installer(debugMode);

      const args = target.getProcessArguments(existingScriptPath);

      assert(
        args.includes('-V4'),
        `'${args.join(',')}' should include -V4`
      );
    });

    it('should not add verbosity, given /V is in arguments', () => {
      const debugMode = false;
      const target = new Installer(debugMode);

      target.setCustomArguments('/V2');

      const args = target.getProcessArguments(existingScriptPath);

      assert(
        !args.includes('-V1'),
        `'${args.join(',')}' should not include -V1`
      );
      assert(
        args.includes('/V2'),
        `'${args.join(',')}' should include /V2`
      );
    });

    it('should not add verbosity, given -V is in arguments', () => {
      const debugMode = false;
      const target = new Installer(debugMode);

      target.setCustomArguments('-V2');

      const args = target.getProcessArguments(existingScriptPath);

      assert(
        !args.includes('-V1'),
        `'${args.join(',')}' should not include -V1`
      );
      assert(
        args.includes('-V2'),
        `'${args.join(',')}' should include -V2`
      );
    });

    it('should resolve and quote script path', () => {
      const debugMode = false;
      const target = new Installer(debugMode);

      target.setCustomArguments('-V2');

      const args = target.getProcessArguments(existingScriptPath);

      const actualScriptPath = args[args.length - 1];
      assert.strictEqual(
        actualScriptPath,
        `"${resolve(existingScriptPath)}"`
      );
    });
  });
});

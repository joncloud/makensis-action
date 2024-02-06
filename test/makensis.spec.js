'use strict';

import assert from 'assert';
import { access } from 'fs/promises';
import makensis from '../src/makensis.js';

describe('Makensis', () => {
  describe('execAsync', () => {
    it('should return help information', async () => {
      const output = await makensis.execAsync('-HELP');

      assert(
        output.includes('makensis'),
        `'${output}' should include makensis`
      );
      assert(
        output.includes('CMDHELP'),
        `'${output}' should include CMDHELP`
      );
      assert(
        output.includes('VERSION'),
        `'${output}' should include VERSION`
      );
    });
  });

  describe('getSymbolsAsync', () => {
    it('should include the NSISDIR', async () => {
      const symbols = await makensis.getSymbolsAsync();

      const nsisDir = symbols.NSISDIR;
      assert(nsisDir, 'NSISDIR should be defined');

      assert.doesNotThrow(
        () => access(nsisDir),
        `NSISDIR (${nsisDir}) should exist`
      );
    });

    it('should include the NSIS_VERSION', async () => {
      const symbols = await makensis.getSymbolsAsync();
      const expected = await makensis.execAsync('-VERSION');

      const nsisVersion = symbols.NSIS_VERSION;
      assert.strictEqual(nsisVersion, expected);
    });
  });
});

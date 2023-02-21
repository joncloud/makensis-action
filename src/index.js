'use strict';

import { getInput } from './input';
import { fail } from './output';
import { Installer } from './installer';

/**
 * Converts a string value into a boolean.
 * @param {string | undefined} value
 * @throws {Error} Argument value must be falsy, or one of the values 'true' or 'false'.
 */
const getBoolean = (value) => {
  if (!value) {
    return false;
  }
  if (value !== 'true' && value !== 'false') {
    throw new Error(`Input must be boolean value 'true' or 'false' but got '${value}'`);
  }
  return value === 'true';
};

/**
 * @returns {Promise<void>}
 */
const run = async () => {
  try {
    const debugMode = getBoolean(process.env.debug);
    const {
      customArguments,
      additionalPluginPaths,
      scriptFile,
      defines,
    } = getInput();
    const installer = new Installer(debugMode);
    installer.setCustomArguments(customArguments);

    additionalPluginPaths
      .forEach(pluginPath => installer.addPluginPath(pluginPath.trim()));

    for (const define of defines) {
      installer.setDefine(define);
    }

    await installer.createInstallerAsync(
      scriptFile
    );
  } catch (error) {
    fail(error.message);
  }
}

run().then(() => process.exit(0)).catch(() => process.exit(1));

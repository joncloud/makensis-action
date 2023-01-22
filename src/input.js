'use strict';

import { getInput as coreGetInput } from '@actions/core';

/**
 * @typedef {{
 *   customArguments: string,
 *   additionalPluginPaths: string[],
 *   scriptFile: string,
 * }} Input
 * @returns {Input}
 */
export const getInput = () => {
  const customArguments = getInput.coreGetInput('arguments');

  const additionalPluginPaths = getInput.coreGetInput('additional-plugin-paths')
    .split(/\n|\r/)
    .map(pluginPath => pluginPath.trim())
    .filter(pluginPath => !!pluginPath);

  const scriptFile = getInput.coreGetInput('script-file');

  return {
    customArguments,
    additionalPluginPaths,
    scriptFile,
  }
};
getInput.coreGetInput = coreGetInput;

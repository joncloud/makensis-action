'use strict';

import { getInput as coreGetInput } from '@actions/core';

/**
 * @param {string} input
 */
export const getMultilineInput = (input) => {
  return input
    .split(/\n|\r/)
    .map(x => x.trim())
    .filter(x => !!x);
};

/**
 * @typedef {{
 *   customArguments: string,
 *   additionalPluginPaths: string[],
 *   scriptFile: string,
 *   defines: string[],
 * }} Input
 * @returns {Input}
 */
export const getInput = () => {
  const customArguments = getInput.coreGetInput('arguments');

  const additionalPluginPaths = getMultilineInput(
    getInput.coreGetInput('additional-plugin-paths'),
  );

  const scriptFile = getInput.coreGetInput('script-file');

  const defines = getMultilineInput(
    getInput.coreGetInput('defines'),
  );

  return {
    customArguments,
    additionalPluginPaths,
    scriptFile,
    defines,
  }
};
getInput.coreGetInput = coreGetInput;

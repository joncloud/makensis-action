'use strict';

const core = require('@actions/core');

/**
 * @typedef {{
 *   customArguments: string,
 *   additionalPluginPaths: string[],
 *   scriptFile: string,
 * }} Input
 * @returns {Input}
 */
const getInput = () => {
  const customArguments = getInput.core.getInput('arguments');

  const additionalPluginPaths = getInput.core.getInput('additional-plugin-paths')
    .split(/\n|\r/)
    .map(pluginPath => pluginPath.trim())
    .filter(pluginPath => !!pluginPath);

  const scriptFile = getInput.core.getInput('script-file');

  return {
    customArguments,
    additionalPluginPaths,
    scriptFile,
  }
};
getInput.core = core;

module.exports = {
  getInput,
};

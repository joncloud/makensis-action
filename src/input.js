'use strict';

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
getInput.coreGetInput = function (name) {
  const val =
    process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';

  return val.trim();
};

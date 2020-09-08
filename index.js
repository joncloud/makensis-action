const core = require('@actions/core');
const Installer = require('./installer').Installer;

const getBoolean = (value) => {
    if (!value) {
        return false;
    }
    if (value !== 'true' && value !== 'false') {
        throw new Error(`Input must be boolean value 'true' or 'false' but got '${value}'`);
    }
    return value === 'true';
};

const applyIfPresent = (key, fn, valid) => {
    const value = core.getInput(key);
    if (value) {
        if (valid && valid.indexOf(key) === -1) {
            throw new Error(
                `${key} cannot be set to ${key}. Only ${valid.join(', ')} are valid.`
            );
        }
        fn(value);
    }
};

try {
    const debugMode = getBoolean(process.env.debug);
    const installer = new Installer(debugMode);
    installer.setCustomArguments(core.getInput('arguments'));

    applyIfPresent(
        'compiler-process-priority',
        val => installer.setCompilerProcessPriority(val),
        ['0', '1', '2', '3', '4', '5']
    );
    applyIfPresent(
        'verbosity',
        val => installer.setVerbosity(val),
        ['0', '1', '2', '3', '4']
    );
    applyIfPresent(
        'warnings-as-errors',
        val => installer.setWarningsAsErrors(getBoolean(val)),
        ['false', 'true']
    );
    applyIfPresent(
        'compiler-output-file-path',
        val => installer.setCompilerOutputFilePath(val)
    );
    applyIfPresent(
        'no-config',
        val => installer.setNoConfig(getBoolean(val)),
        ['false', 'true']
    );
    applyIfPresent(
        'no-cd',
        val => installer.setNoCd(getBoolean(val)),
        ['false', 'true']
    );
    applyIfPresent(
        'input-charset',
        val => installer.setInputCharset(val),
        ['ACP', 'OEM', 'CP#' /*?*/, 'UTF8', 'UTF16LE', 'UTF16BE']
    );
    applyIfPresent(
        'output-charset',
        val => installer.setInputCharset(val),
        ['ACP', 'OEM', 'CP#' /*?*/, 'UTF8', 'UTF8SIG',
         'UTF16LE', 'UTF16BE', 'UTF16LEBOM', 'UTF16BEBOM']
    );
    applyIfPresent(
        'preprocess-output',
        val => installer.setPreprocessOutput(val),
        ['false', 'true', 'safe']
    );

    core.getInput('additional-plugin-paths')
        .split(/\n?\r/)
        .map(pluginPath => pluginPath.trim())
        .filter(pluginPath => !!pluginPath)
        .forEach(pluginPath => installer.addPluginPath(pluginPath.trim()));

    installer.createInstaller(
        core.getInput('script-file')
    );
} catch (error) {
    core.setFailed(error.message);
}

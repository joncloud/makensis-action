const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const isDirectory = (item) => {
    const stats = fs.statSync(item);
    
    return stats.isDirectory();
};

const copyDirectory = (src, dest) => {
    console.log('copyDirectory', src, dest);

    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest);
    }

    const items = fs.readdirSync(src);
    items.forEach(item => {
        const name = path.basename(item);
        const srcPath = path.join(src, name);
        if (isDirectory(srcPath)) {
            copyDirectory(
                srcPath,
                path.join(dest, name)
            );
        }
        else {
            console.log(
                'copying',
                srcPath,
                path.join(dest, name)
            );
            fs.copyFileSync(
                srcPath,
                path.join(dest, name)
            );
        }
    });
};

const nsisInstallPath = path.join('C:', 'Program Files (x86)', 'NSIS');

const installerPathExists = () => {
    return fs.existsSync(nsisInstallPath);
};

class Installer {
    constructor(debugMode) {
        this.debugMode = debugMode;
        this.pluginPaths = [];
        this.customArguments = '';
        this.compilerProcessPriority = '';
        this.verbosity = '1';
        this.warningsAsErrors = false;
        this.compilerOutputFilePath = '';
        this.noConfig = false;
        this.noCd = false;
        this.inputCharset = '';
        this.outputCharset = '';
        this.preprocessOutput = 'false';
    }

    debugLog(msg) {
        if (this.debugMode) {
            console.log(msg);
        }
    }

    getCustomArguments() {
        return this.customArguments;
    }

    setCustomArguments(value) {
        this.debugLog(`Settings arguments: ${value}`);
        this.customArguments = value;
    }

    addPluginPath(pluginPath) {
        this.debugLog(`Adding plugin path: ${pluginPath}`);
        this.pluginPaths.push(pluginPath);
    }

    setCompilerProcessPriority(value) {
        this.debugLog(`Settings compiler process priority: ${value}`);
        this.compilerProcessPriority = value;
    }

    setVerbosity(value) {
        this.debugLog(`Settings verbosity: ${value}`);
        this.verbosity = value;
    }

    setWarningsAsErrors(value) {
        this.debugLog(`Settings warnings as errors: ${value}`);
        this.warningsAsErrors = value;
    }

    setCompilerOutputFilePath(value) {
        this.debugLog(`Settings compiler output file path: ${value}`);
        this.compilerOutputFilePath = value;
    }

    setNoConfig(value) {
        this.debugLog(`Settings no config: ${value}`);
        this.noConfig = value;
    }

    setNoCd(value) {
        this.debugLog(`Settings no cd: ${value}`);
        this.noCd = value;
    }

    setInputCharset(value) {
        this.debugLog(`Settings input charset: ${value}`);
        this.inputCharset = value;
    }

    setOutputCharset(value) {
        this.debugLog(`Settings output charset: ${value}`);
        this.outputCharset = value;
    }

    setPreprocessOutput(value) {
        this.debugLog(`Settings preprocess output: ${value}`);
        this.preprocessOutput = value;
    }

    getProcessArguments(scriptPath) {
        // Increase verbosity for debug
        const args = [];
        const add = (val, fn) => {
            if (!val) {
                return;
            }

            val = fn(val);
            if (!val) {
                return;
            }

            args.push(val);
        };

        add(this.compilerProcessPriority, val => `-P${val}`);
        add(this.verbosity, val => `-V${val}`);
        add(this.warningsAsErrors, _ => '-WX');
        add(this.compilerOutputFilePath, val => `-O${val}`);
        add(this.noConfig, _ => '-NOCONFIG');
        add(this.noCd, _ => '-NOCD');
        add(this.inputCharset, val => `-INPUTCHARSET ${val}`);
        add(this.outputCharset, val => `-OUTPUTCHARSET ${val}`);
        add(this.preprocessOutput, val => {
            switch (val) {
                case 'true':
                    return '-PPO';
                case 'safe':
                    return '-SAFEPPO';
                default:
                    return '';
            }
        });

        add(this.customArguments, val => val);
        add(scriptPath, val => `"${path.resolve(val)}"`);

        return args;
    }

    createInstaller(scriptPath) {
        if (!installerPathExists()) {
            const installerPathMessage = `Installer path does not exist at ${nsisInstallPath}`;
            this.debugLog(installerPathMessage);
            throw new Error(installerPathMessage);
        }

        console.log(`Creating installer for: ${scriptPath}`);

        // Include any of the plugins that may have been requested.
        const nsisPluginPath = path.join(nsisInstallPath, 'plugins');
        this.pluginPaths.forEach(pluginPath => {
            console.log('Including plugin path', pluginPath);
            copyDirectory(pluginPath, nsisPluginPath);
        });

        const args = this.getProcessArguments(scriptPath);
    
        const nsis3Exe = path.join(nsisInstallPath, 'makensis.exe');
        const makeCommand = `"${nsis3Exe}" ${args.join(' ')}`;
        this.debugLog(`Running ${makeCommand}`);
        const process = execSync(makeCommand);
    }
};

module.exports = {
    Installer
};

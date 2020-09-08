const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');
const nsisPaths = require('./nsisPaths');

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

class Installer {
    constructor(debugMode) {
        this.debugMode = debugMode;
        this.pluginPaths = [];
        this.customArguments = '';
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

    getProcessArguments(scriptPath) {
        // Increase verbosity for debug
        const args = [];
        if (this.customArguments.indexOf('/V') === -1 && this.customArguments.indexOf('-V') === -1) {
            if (this.debugMode) {
                args.push('-V4');
            }
            else {
                args.push('-V1');
            }
        }
    
        args.push(this.customArguments);
        args.push(`"${path.resolve(scriptPath)}"`);

        return args;
    }

    createInstaller(scriptPath) {
        console.log(`Creating installer for: ${scriptPath}`);

        // Include any of the plugins that may have been requested.
        if (this.pluginPaths.length) {
            const nsisPluginPath = nsisPaths.getPluginsPath();
            this.pluginPaths.forEach(pluginPath => {
                console.log('Including plugin path', pluginPath);
                copyDirectory(pluginPath, nsisPluginPath);
            });
        }

        const args = this.getProcessArguments(scriptPath);
    
        const nsis3Exe = nsisPaths.getMakensisPath();
        const makeCommand = `"${nsis3Exe}" ${args.join(' ')}`;
        this.debugLog(`Running ${makeCommand}`);
        const process = execSync(makeCommand);
    }
};

module.exports = {
    Installer
};

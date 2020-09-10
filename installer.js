const { promisify } = require('util');

const fs = require('fs');
const statAsync = promisify(fs.stat);
const existsAsync = promisify(fs.exists);
const mkdirAsync = promisify(fs.mkdir);
const readdirAsync = promisify(fs.readdir);
const copyFileAsync = promisify(fs.copyFile);

const path = require('path');
const makensis = require('./makensis');

const isDirectoryAsync = async (item) => {
    const stats = await statAsync(item);
    
    return stats.isDirectory();
};

const copyDirectoryAsync = async (src, dest) => {
    console.log('copyDirectory', src, dest);

    if (!await existsAsync(dest)) {
        await mkdirAsync(dest);
    }

    const items = await readdirAsync(src);
    const promises = items.map(async item => {
        const name = path.basename(item);
        const srcPath = path.join(src, name);
        if (await isDirectoryAsync(srcPath)) {
            await copyDirectoryAsync(
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
            await copyFileAsync(
                srcPath,
                path.join(dest, name)
            );
        }
    });
    await Promise.all(promises);
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

    async createInstallerAsync(scriptPath) {
        console.log(`Creating installer for: ${scriptPath}`);

        // Include any of the plugins that may have been requested.
        if (this.pluginPaths.length) {
            const nsisdir = (await makensis.getSymbolsAsync()).NSISDIR;
            if (!nsisdir) {
                throw new Error('Unable to determine NSISDIR. Check makensis -HDRINFO output');
            }
            const nsisPluginPath = path.join(nsisdir, 'Plugins');
            this.debugLog(`Using system Plugins path ${nsisPluginPath}`);
            
            const copies = this.pluginPaths.map(pluginPath => {
                console.log('Including plugin path', pluginPath);
                return copyDirectoryAsync(pluginPath, nsisPluginPath);
            });
            await Promise.all(copies);
        }

        const args = this.getProcessArguments(scriptPath)
            .join(' ');

        this.debugLog(`Running ${args}`);
        const _ = await makensis.execAsync(args);
    }
};

module.exports = {
    Installer
};

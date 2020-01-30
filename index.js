const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const dirTree = require('./directory-tree');

const getBoolean = (value) => 
    (value && typeof value === 'string' && value.toLowerCase() === 'yes') || 
    !!value;

const getString = (value) =>
    value && typeof value === 'string'
        ? value
        : '';

const debugMode = getBoolean(process.env.debug);

const copyDirectory = (src, dest) => {
    const items = fs.readdirSync(src);
    items.forEach(item => {
        const name = path.basename(item);
        fs.copyFileSync(
            path.resolve(src, name),
            path.resolve(dest, name)
        );
    });
};

try {
    const options = {
        // Required
        scriptFile: getString(core.getInput('script-file')),
        justInclude: getBoolean(core.getInput('just-include')),
        includeMorePlugins: getBoolean(core.getInput('include-more-plugins')),

        // Options
        arguments: getString(core.getInput('arguments')),
        includeCustomPluginsPath: getString(core.getInput('includeMorePlugins'))
    };
    
    console.log(options);

    const destination = path.resolve(__dirname, '.nsis');
    console.log(`.nsis path: ${destination}`);

    console.log('__dirname:', dirTree(__dirname, { exclude: /node_modules/ }))
    console.log('__dirname/nsis:', dirTree(path.resolve(__dirname, 'nsis'), { exclude: /node_modules/ }));
    console.log('__dirname/nsis exists:', fs.existsSync(destination));

    let nsis3Directory = '';
    if (!fs.existsSync(destination)) {

        const startTime = new Date();
        const zipPath = path.resolve(__dirname, 'nsis', 'nsis.zip');

        const d = path.resolve(__dirname, 'nsis');
        const test = fs.readdir(d);
        console.log(`path (${d}):`, test);

        const extractCommand = `7z x "-o${destination}" "${zipPath}"`;
        console.log(`Running ${extractCommand}`);
        const process = execSync(extractCommand);

        const items = fs.readdirSync(destination);
        nsis3Directory = path.resolve(destination, items[0]);

        if (options.includeMorePlugins) {
            const pluginPath = path.resolve(__dirname, 'plugins');
            const pluginOutput = path.resolve(nsis3Directory, 'plugins', 'x86-ansi');
            
            copyDirectory(pluginPath, pluginOutput);
        }

        if (!!options.includeCustomPluginsPath) {
            const pluginOutput = path.resolve(nsis3Directory, 'plugins', 'x86-ansi');

            copyDirectory(options.includeCustomPluginsPath, pluginOutput);
        }

        const endTime = new Date();
        const totalTime = endTime - startTime;
        console.log(`Time taken (Unzip): ${totalTime} second(s)`);
    }

    else {
        const items = fs.readdirSync(destination);
        nsis3Directory = path.resolve(destination, items[0]);
    }

    const nsis3Exe = path.resolve(nsis3Directory, 'makensis.exe');
    core.setOutput('nsis-path', nsis3Exe);

    if (!options.justInclude) {
        const args = [];
        if (options.arguments.indexOf('/V') === -1) {
            if (debugMode) {
                args.push('/V4');
            }
            else {
                args.push('/V1');
            }
        }

        args.push(options.arguments);
        args.push(`"${options.scriptFile}"`);

        const makeCommand = `${nsis3Exe} ${args.join(' ')}`;
        console.log(`Running ${makeCommand}`);
        const process = execSync(makeCommand);
    }
    else {
        console.log(`NSIS installed at ${nsis3Exe}`);
    }
} catch (error) {
    core.setFailed(error.message);
}

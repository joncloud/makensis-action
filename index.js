const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const dirTree = require('./directory-tree');

const getBoolean = (value) => {
    const result = (value && typeof value === 'string' && value.toLowerCase() === 'yes') || 
        !!value;

    console.log(value, '=>', result);

    return result;
}

const getString = (value) =>
    value && typeof value === 'string'
        ? value
        : '';

const debugMode = getBoolean(process.env.debug);

const copyDirectory = (src, dest) => {
    console.log('copyDirectory', src, dest);
    const items = fs.readdirSync(src);
    items.forEach(item => {
        const name = path.basename(item);
        console.log('copying', path.join(src, name),
        path.join(dest, name));
        fs.copyFileSync(
            path.join(src, name),
            path.join(dest, name)
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

    const destination = path.join(__dirname, '.nsis');

    let nsis3Directory = '';
    if (!fs.existsSync(destination)) {

        const startTime = new Date();
        const zipPath = path.join(__dirname, 'nsis', 'nsis.zip');

        const extractCommand = `7z x "-o${destination}" "${zipPath}"`;
        console.log(`Running ${extractCommand}`);
        const process = execSync(extractCommand);

        const items = fs.readdirSync(destination);
        nsis3Directory = path.join(destination, items[0]);

        if (options.includeMorePlugins) {
            console.log('includeMorePlugins');
            const pluginPath = path.join(__dirname, 'plugins');
            const pluginOutput = path.join(nsis3Directory, 'plugins', 'x86-ansi');
            
            copyDirectory(pluginPath, pluginOutput);
        }

        if (!!options.includeCustomPluginsPath) {
            console.log('includeCustomPluginsPath');
            const pluginOutput = path.join(nsis3Directory, 'plugins', 'x86-ansi');

            copyDirectory(options.includeCustomPluginsPath, pluginOutput);
        }

        const endTime = new Date();
        const totalTime = endTime - startTime;
        console.log(`Time taken (Unzip): ${totalTime} second(s)`);
    }

    else {
        const items = fs.readdirSync(destination);
        nsis3Directory = path.join(destination, items[0]);
    }

    const nsis3Exe = path.join(nsis3Directory, 'makensis.exe');
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

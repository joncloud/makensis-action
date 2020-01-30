const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

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
        const final = path.resolve(dest, name);
        fs.copyFileSync(item, final);
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

    const currentPath = __dirname;
    const output = currentPath + '\\nsis.zip';
    const destination = currentPath + '\\';

    let nsis3Directory = '';
    if (!fs.existsSync(destination)) {
        const startTime = new Date();
        const process = execSync(`7z x -o${output} ${destination}`);
        // TODO check 0 exit code

        const items = fs.readdirSync(destination);
        nsis3Directory = items[0];

        if (options.includeMorePlugins) {
            const pluginPath = currentPath + '\\plugins';
            const pluginOutput = nsis3Directory + '\\plugins\\x86-ansi';
            
            copyDirectory(pluginPath, pluginOutput);
        }

        if (!!options.includeCustomPluginsPath) {
            const pluginOutput = nsis3Directory + '\\plugins\\x86-ansi';

            copyDirectory(options.includeCustomPluginsPath, pluginOutput);
        }

        const endTime = new Date();
        const totalTime = endTime - startTime;
        console.log(`Time taken (Unzip): ${totalTime} second(s)`);
    }

    else {
        const items = fs.readdirSync(destination);
        nsis3Directory = items[0];
    }

    const nsis3Exe = nsis3Directory + '\\makensis.exe';
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

        const process = execSync(`${nsis3Exe} ${args.join(' ')}`);
        // TODO check 0 exit code
    }
    else {
        console.log(`NSIS installed at ${nsis3Exe}`);
    }
} catch (error) {
    core.setFailed(error.message);
}

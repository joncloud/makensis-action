const { promisify } = require('util');
const fs = require('fs');

const { exec } = require('child_process');
const execAsync = promisify(exec);

const path = require('path');
const { platform, env } = require('process');


const firstValidPath = (paths) => {
    const possiblePaths = paths.filter(fs.existsSync);

    return possiblePaths.length ? possiblePaths[0] : '';
};

const getWin32Path = () => {
    const evaluationPaths = env.PATH.split(';').concat([
        path.join('C:', 'Program Files (x86)', 'NSIS')
    ]).map(p => path.join(p, 'makensis.exe'));

    return firstValidPath(
        evaluationPaths
    );
};

const getLinuxPath = () => {
    const evaluationPaths = env.PATH.split(':').concat([
        '/usr/local/bin',
        '/usr/bin',
        '/opt/local/bin'
    ]).map(p => path.join(p, 'makensis'));

    return firstValidPath(evaluationPaths);
};

class Makensis {
    constructor(path) {
        if (!path || !fs.existsSync(path)) {
            throw new Error('Unable to find makensis executable');
        }
        this.path = path;
    }

    async execAsync(args) {
        const result = await execAsync(`"${this.path}" ${args}`);

        return result.stdout;
    }

    async getSymbolsAsync() {
        const buffer = await this.execAsync('-HDRINFO');
        
        // Look for the defined symbols in the output.
        const exp = /Defined symbols: (.*)/g;
        const matches = exp.exec(buffer.toString('utf-8'));
        if (!matches || !matches.length || matches.length < 2) {
            throw new Error('Unable to get symbols');
        }
        
        // Create a map of all of the symbols.
        const symbols = { };

        // Get all of the symbols, which are comma delimited
        // keys or key value pairs separated by =.
        matches[1].split(',').forEach(text => {
            const index = text.indexOf('=');
            if (index === -1) {
                symbols[text] = '';
            }
            else {
                const name = text.substr(0, index);
                const value = text.substr(index + 1);
                symbols[name] = value;
            }
        });

        return symbols;
    }
}

const makensisPath = platform === 'win32'
    ? getWin32Path()
    : getLinuxPath();

module.exports = new Makensis(makensisPath);

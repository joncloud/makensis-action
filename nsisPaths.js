const fs = require('fs');
const path = require('path');
const { platform } = require('process');

const getWin32Nsis = () => {
    const root = path.join('C:', 'Program Files (x86)', 'NSIS');

    return {
        makensis: path.join(root, 'makensis.exe'),
        plugins: path.join(root, 'plugins')
    };
};

const getLinuxNsis = () => {
    const firstValidPath = (paths) => {
        const possiblePaths = paths.filter(fs.existsSync);
    
        return possiblePaths.length ? possiblePaths[0] : '';
    };

    return {
        makensis: firstValidPath([
            '/usr/local/bin/makensis',
            '/usr/bin/makensis'
        ]),
        plugins: firstValidPath([
            '/usr/local/share/nsis'
        ])
    };
};

class NsisPaths {
    constructor(paths) {
        this.paths = paths;
    }

    validatePath(path, name) {
        if (!fs.existsSync(path)) {
            throw new Error(`${name} path does not exist at ${path}.`);
        }
        return path;
    }

    getMakensisPath() {
        return this.validatePath(
            this.paths.makensis, 
            'makensis'
        );
    }

    getPluginsPath() {
        return this.validatePath(
            this.paths.plugins, 
            'plugins'
        );
    }
}

const paths = platform === 'win32'
    ? getWin32Nsis()
    : getLinuxNsis();

module.exports = new NsisPaths(paths);

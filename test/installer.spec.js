const fs = require('fs');
const { expect } = require('chai');
const { Installer } = require('../installer');

const installerExists = () => fs.existsSync('./installsig.exe');

describe('Installer', () => {
    before(() => {
        if (installerExists()) {
            fs.unlinkSync('./installsig.exe');
        }
    });

    it('should create installer for install.nsi', () => {
        const debugMode = true;
        const target = new Installer(debugMode);

        target.createInstaller('./install.nsi');

        const actual = installerExists();

        expect(actual).to.equal(
            true, 
            'Installer `./installsig.exe` should exist'
        );
    });
});

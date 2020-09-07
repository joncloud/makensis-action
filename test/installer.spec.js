const fs = require('fs');
const path = require('path');
const { expect } = require('chai');
const { Installer } = require('../installer');

const installerExists = () => fs.existsSync('./installsig.exe');

describe('Installer', () => {
    const existingScriptPath = './install.nsi';
    before(() => {
        if (installerExists()) {
            fs.unlinkSync('./installsig.exe');
        }
    });

    describe('createInstaller', () => {
        it('should create installer for install.nsi', () => {
            const debugMode = true;
            const target = new Installer(debugMode);

            target.createInstaller(existingScriptPath);

            const actual = installerExists();

            expect(actual).to.equal(
                true, 
                'Installer `./installsig.exe` should exist'
            );
        });
    });

    describe('getProcessArguments', () => {
        it('should default to no warnings verbosity, given no debug mode', () => {
            const debugMode = false;
            const target = new Installer(debugMode);

            const args = target.getProcessArguments(existingScriptPath);

            expect(args).to.contain('/V1');
        });

        it('should default to all verbosity, given **debug** mode', () => {
            const debugMode = true;
            const target = new Installer(debugMode);

            const args = target.getProcessArguments(existingScriptPath);

            expect(args).to.contain('/V4');
        });

        it('should not add verbosity, given /V is in arguments', () => {
            const debugMode = false;
            const target = new Installer(debugMode);

            target.setCustomArguments('/V2');

            const args = target.getProcessArguments(existingScriptPath);

            expect(args).to.not.contain('/V1');
            expect(args).to.contain('/V2');
        });

        it('should not add verbosity, given -V is in arguments', () => {
            const debugMode = false;
            const target = new Installer(debugMode);

            target.setCustomArguments('-V2');

            const args = target.getProcessArguments(existingScriptPath);

            expect(args).to.not.contain('/V1');
            expect(args).to.contain('-V2');
        });

        it('should resolve and quote script path', () => {
            const debugMode = false;
            const target = new Installer(debugMode);

            target.setCustomArguments('-V2');

            const args = target.getProcessArguments(existingScriptPath);

            const actualScriptPath = args[args.length - 1];
            expect(actualScriptPath).to.equal(`"${path.resolve(existingScriptPath)}"`);
        });
    });
});

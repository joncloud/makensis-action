const { promisify } = require('util');

const { exists, unlink } = require('fs');
const existsAsync = promisify(exists);
const unlinkAsync = promisify(unlink);

const path = require('path');
const { expect } = require('chai');
const { Installer } = require('../installer');

const unlinkIfExistsAsync = async (path) => {
    if (await existsAsync(path)) {
        unlinkAsync(path);
    }
};

describe('Installer', () => {
    const existingScriptPath = './test/basic.nsi';
    before(async () => {
        const promises = ['./basic.exe', './with-plugins.exe']
            .map(unlinkIfExistsAsync);

        await Promise.all(promises);
    });

    describe('createInstaller', () => {
        const test = (script, fn) => {
            it(`should create installer for ${script}.nsi`, async () => {
                const debugMode = true;
                const target = new Installer(debugMode);
    
                if (fn) {
                    fn(target);
                }

                try {
                    await target.createInstallerAsync(`./test/${script}.nsi`);
                }
                catch (err) {
                    console.error(err);
                    throw err;
                }
    
                const actual = await existsAsync(`./test/${script}.exe`);
    
                expect(actual).to.equal(
                    true, 
                    `Installer \`./test/${script}.exe\` should exist`
                );
            });
        };

        test('basic');
        test('with-plugins', target => target.addPluginPath('./test/EnVar'));
    });

    describe('getProcessArguments', () => {
        it('should default to no warnings verbosity, given no debug mode', () => {
            const debugMode = false;
            const target = new Installer(debugMode);

            const args = target.getProcessArguments(existingScriptPath);

            expect(args).to.contain('-V1');
        });

        it('should default to all verbosity, given **debug** mode', () => {
            const debugMode = true;
            const target = new Installer(debugMode);

            const args = target.getProcessArguments(existingScriptPath);

            expect(args).to.contain('-V4');
        });

        it('should not add verbosity, given /V is in arguments', () => {
            const debugMode = false;
            const target = new Installer(debugMode);

            target.setCustomArguments('/V2');

            const args = target.getProcessArguments(existingScriptPath);

            expect(args).to.not.contain('-V1');
            expect(args).to.contain('/V2');
        });

        it('should not add verbosity, given -V is in arguments', () => {
            const debugMode = false;
            const target = new Installer(debugMode);

            target.setCustomArguments('-V2');

            const args = target.getProcessArguments(existingScriptPath);

            expect(args).to.not.contain('-V1');
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

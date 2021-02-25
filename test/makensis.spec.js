const { expect } = require('chai');
const fs = require('fs');
const makensis = require('../makensis');

describe('Makensis', () => {
    describe('execAsync', () => {
        it('should return help information', async () => {
            const output = await makensis.execAsync('-HELP');

            expect(output).to.contain('makensis');
            expect(output).to.contain('CMDHELP');
            expect(output).to.contain('VERSION');
        });
    });

    describe('getSymbolsAsync', () => {
        it('should include the NSISDIR', async () => {
            const symbols = await makensis.getSymbolsAsync();

            const nsisDir = symbols.NSISDIR;
            expect(nsisDir).to.be.ok;
            expect(fs.existsSync(nsisDir)).to.be.true;
        });

        it('should include the NSIS_VERSION', async () => {
            const symbols = await makensis.getSymbolsAsync();
            const expected = await makensis.execAsync('-VERSION');

            const nsisVersion = symbols.NSIS_VERSION;
            expect(nsisVersion).to.equal(expected);
        });
    });
});

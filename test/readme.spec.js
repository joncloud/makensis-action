const fs = require('fs');
const YAML = require('yaml');
const { expect } = require('chai');

describe('README', () => {
    let readmeLines = [];
    let action;

    before(() => {
        readmeLines = fs.readFileSync('./README.md', 'utf8')
            .toString()
            .split(/(?:\r\n|\r|\n)/g);

        action = YAML.parse(
            fs.readFileSync('./action.yml', 'utf8')
        );
    });

    it('should list all inputs', () => {
        const inputs = readmeLines.map(line => {
            const captures = /### `([^`]+)`/.exec(line);
            if (captures && captures.length) {
                return captures[1];
            }
            return null;
        }).filter(x => !!x).sort();

        expect(inputs).to.eql(
            Object.getOwnPropertyNames(action.inputs).sort()
        );
    });
});

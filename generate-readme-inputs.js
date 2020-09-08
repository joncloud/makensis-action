const fs = require('fs');
const YAML = require('yaml');

const action = YAML.parse(
    fs.readFileSync('./action.yml', 'utf8')
);

Object.getOwnPropertyNames(action.inputs).forEach(key => {
    console.log('');
    console.log(`### \`${key}\``);
    console.log('');

    const input = action.inputs[key];
    console.log(`${input.description}. Default \`"${input.default}"\``);
});

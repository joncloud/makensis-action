'use strict';

import { readFile } from 'fs/promises';
import { parse } from 'yaml';
import assert from 'assert';

describe('README', () => {
  let readmeLines = [];
  let action;

  before(async () => {
    readmeLines = (await readFile('./README.md', 'utf8'))
      .toString()
      .split(/(?:\r\n|\r|\n)/g);

    action = parse(
      await readFile('./action.yml', 'utf8')
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

    assert.deepStrictEqual(
      inputs,
      Object.getOwnPropertyNames(action.inputs).sort()
    );
  });
});

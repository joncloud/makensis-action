const { promisify } = require('util');
const fs = require('fs');

const { exec } = require('child_process');
const execAsync = promisify(exec);

const path = require('path');
const { platform, env } = require('process');

/**
 * Returns the first path that exists on disk.
 * @param {string[]} paths
 * @returns {string}
 */
const firstValidPath = (paths) => {
  const possiblePaths = paths.filter(fs.existsSync);

  return possiblePaths.length ? possiblePaths[0] : '';
};

/**
 * @returns {string}
 */
const getWin32Path = () => {
  const evaluationPaths = env.PATH.split(';').concat([
    path.join('C:', 'Program Files (x86)', 'NSIS')
  ]).map(p => path.join(p, 'makensis.exe'));

  return firstValidPath(
    evaluationPaths
  );
};

/**
 * @returns {string}
 */
const getLinuxPath = () => {
  const evaluationPaths = env.PATH.split(':').concat([
    '/usr/local/bin',
    '/usr/bin',
    '/opt/local/bin'
  ]).map(p => path.join(p, 'makensis'));

  return firstValidPath(evaluationPaths);
};

class Makensis {
  /**
   * @param {string} path
   * @throws {Error} Argument path is falsy, or the path does not exist on disk.
   */
  constructor(path) {
    if (!path || !fs.existsSync(path)) {
      throw new Error('Unable to find makensis executable');
    }
    /** @private @type {string} */
    this.path = path;
  }

  /**
   * Executes the makensis program, and returns its stdout.
   * @param {string} args The arguments passed onto the makensis program.
   * @returns {string}
   */
  async execAsync(args) {
    const result = await execAsync(`"${this.path}" ${args}`);

    return result.stdout;
  }

  /**
   * @typedef {{
   *   [name: string]: string | undefined
   * }} Symbols
   * @returns {Promise.<Symbols>}
   * @throws {Error} Given no symbols were output from the makensis -HDRINFO command.
   */
  async getSymbolsAsync() {
    const buffer = await this.execAsync('-HDRINFO');

    // Look for the defined symbols in the output.
    const exp = /Defined symbols: (.*)/g;
    const matches = exp.exec(buffer.toString('utf-8'));
    if (!matches || !matches.length || matches.length < 2) {
      throw new Error('Unable to get symbols');
    }

    // Create a map of all of the symbols.
    const symbols = {};

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

'use strict';

/**
 * @param {(string | Error)?} error
 */
export const fail = (error) => {
  fail.setFailed(error || fail.genericErrorMessage);
};

fail.setFailed = function (message) {
  if (message instanceof Error) {
    message = message.toString();
  }

  process.exitCode = 1;
  process.stdout.write(`error${escapeData(message)}${os.EOL}`);
}

function escapeData(s) {
  return toCommandValue(s)
    .replace(/%/g, '%25')
    .replace(/\r/g, '%0D')
    .replace(/\n/g, '%0A')
}

fail.genericErrorMessage = 'Unexpected error occurred';

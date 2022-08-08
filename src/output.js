'use strict';

const core = require('@actions/core');

/**
 * @param {(string | Error)?} error
 */
const fail = (error) => {
  fail.core.setFailed(error || fail.genericErrorMessage);
};

fail.core = core;
fail.genericErrorMessage = 'Unexpected error occurred';

module.exports = {
  fail,
};

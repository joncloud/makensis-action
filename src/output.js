'use strict';

import { setFailed } from '@actions/core';

/**
 * @param {(string | Error)?} error
 */
export const fail = (error) => {
  fail.setFailed(error || fail.genericErrorMessage);
};

fail.setFailed = setFailed;
fail.genericErrorMessage = 'Unexpected error occurred';

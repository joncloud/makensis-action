'use strict';

// Convert all of the arguments into environment variables to get
// around hyphenated names being problematic on non-windows platforms.
const args = process.argv.splice(2);
for (let i = 0; i < args.length; i += 2) {
  const key = args[i];
  const value = args[i + 1];
  if (!value) {
    console.warn('missing arg value for', key);
    continue;
  }

  console.log('assigning arg to env', key, value);
  process.env[key] = value;
}

require('../dist');

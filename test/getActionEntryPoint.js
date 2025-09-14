'use strict';

import { readFile } from 'fs/promises';
import { parse } from 'yaml'

export async function getActionEntryPoint() {
  const file = await readFile('action.yml', 'utf8');
  const doc = parse(file);
  const entryPoint = doc?.runs?.main;
  if (!entryPoint || typeof entryPoint !== 'string') {
    throw new Error('Action entry point not found at runs.main');
  }
  return entryPoint;
}

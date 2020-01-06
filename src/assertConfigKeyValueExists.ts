/* eslint-disable @typescript-eslint/no-explicit-any */

import Configstore from 'configstore';

import { Key } from './types/Key';

export async function assertConfigKeyValueExists(
  config: Configstore,
  key: Key,
  name?: string,
): Promise<any> {
  if (!config.get(key)) {
    Promise.reject(new Error(`${key}|${name}`));
  }

  return true;
}

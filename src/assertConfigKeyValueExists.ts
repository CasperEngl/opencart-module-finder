import signale from 'signale';
import Configstore from 'configstore';

import * as inquirer from './inquirer';
import { validatePincode } from './validatePincode';
import { validateUsername } from './validateUsername';

import { Key } from './types/Key';
import { showWelcome } from './showWelcome';

export async function assertConfigKeyValueExists(
  config: Configstore,
  key: Key,
  name?: string,
): Promise<void> {
  try {
    if (!config.get(key)) {
      throw new Error(key);
    }
  } catch (error) {
    showWelcome();

    signale.error(`${name || key} is missing from your config`);

    const { answer } = await inquirer.askForConfigKey(key, name);

    validateUsername(config, answer, key, name);
    validatePincode(config, answer, key, name);

    config.set(key, answer);

    showWelcome();
  }
}

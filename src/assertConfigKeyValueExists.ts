import clear from 'clear';
import signale from 'signale';

import { Config, ConfigKey } from './types/Config';
import { configPath } from './configPath';

export function assertConfigKeyValueExists(config: Config, key: ConfigKey, name?: string): void {
  try {
    if (config) {
      if (!config[key]) {
        throw new Error(`Update your ${name || key} in your config at ${configPath} and run the program again.`);
      }
    } else {
      throw new Error('Config does not exist');
    }
  } catch (error) {
    clear();
    signale.error(error.message);
    process.exit(9);
  }
}

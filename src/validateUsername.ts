import Configstore from 'configstore';
import validator from 'validator';
import { titleCase } from 'change-case';

export function validateUsername(
  config: Configstore,
  answer: string,
  key: string,
  name: string | undefined,
): void {
  if (key === 'username' && !validator.isEmail(answer)) {
    throw new Error(`${(name && titleCase(name)) || titleCase(key)} is not a valid email address, please correct this error in your config ${config.path}`);
  }
}

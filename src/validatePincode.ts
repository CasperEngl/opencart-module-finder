import Configstore from 'configstore';
import validator from 'validator';
import { titleCase } from 'change-case';

import { Key } from './types/Key';

export function validatePincode(
  config: Configstore,
  answer: string,
  key: Key,
  name: string | undefined,
): void {
  const numeric = validator.isNumeric(answer);
  const exactlyFour = validator.isLength(answer, {
    min: 4,
    max: 4,
  });

  if (key === 'pinCode' && (!numeric || !exactlyFour)) {
    throw new Error(`${(name && titleCase(name)) || titleCase(key)} must have a length of 4 and be a number. Please correct this error in your config ${config.path}`);
  }
}

/* eslint-disable no-undef */

import os from 'os';

import { configPath } from './configPath';

describe('Config Path', () => {
  it('Should return the path in users home directory to json config', () => {
    expect(configPath).toEqual(`${os.homedir()}/.opencart.json`);
  });
});

export type Config = {
  username: string;
  password: string;
  pinCode: string;
} | null;

export type ConfigKey = 'username' | 'password' | 'pinCode';

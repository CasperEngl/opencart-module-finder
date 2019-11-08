export type Config = {
  username: string;
  password: string;
  pinCode: string;
  headless?: boolean;
} | null;

export type ConfigKey = 'username' | 'password' | 'pinCode';

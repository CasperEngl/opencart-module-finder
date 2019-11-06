import inquirer from 'inquirer';

type OpencartCredentials = {
  username: string;
  password: string;
  pinCode: string;
}

export const askForOpencartCredentials = (): Promise<OpencartCredentials> => {
  const questions = [
    {
      name: 'username',
      type: 'input',
      message: 'Enter your Opencart e-mail address:',
      validate: (value: string): boolean | string => Boolean(value.length) || 'Please enter your e-mail address.',
    },
    {
      name: 'password',
      type: 'password',
      message: 'Enter your password:',
      validate: (value: string): boolean | string => Boolean(value.length) || 'Please enter your password.',
    },
    {
      name: 'pinCode',
      type: 'input',
      message: 'Enter your pincode:',
      validate: (value: string): boolean | string => Boolean(value.length) || 'Please enter your pincode.',
    },
  ];

  return inquirer.prompt(questions);
};

type ModuleName = {
  moduleName: string;
}

export const askForModuleName = (): Promise<ModuleName> => {
  const questions = [
    {
      name: 'moduleName',
      type: 'input',
      message: 'Module name:',
      validate: (value: string): boolean | string => Boolean(value.length) || 'Please enter module name:',
    },
  ];

  return inquirer.prompt(questions);
};

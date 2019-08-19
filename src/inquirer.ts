import inquirer from 'inquirer';

export const askForOpencartCredentials = () => {
  const questions = [
    {
      name: 'username',
      type: 'input',
      message: 'Enter your Opencart e-mail address:',
      validate: (value: any) => Boolean(value.length) || 'Please enter your e-mail address.',
    },
    {
      name: 'password',
      type: 'password',
      message: 'Enter your password:',
      validate: (value: any) => Boolean(value.length) || 'Please enter your password.',
    },
    {
      name: 'pinCode',
      type: 'input',
      message: 'Enter your pincode:',
      validate: (value: any) => Boolean(value.length) || 'Please enter your pincode.',
    },
  ];

  return inquirer.prompt(questions);
};

export const askForModuleName = () => {
  const questions = [
    {
      name: 'moduleName',
      type: 'input',
      message: 'Module name:',
      validate: (value: any) => Boolean(value.length) || 'Please enter module name:',
    },
  ];

  return inquirer.prompt(questions);
};

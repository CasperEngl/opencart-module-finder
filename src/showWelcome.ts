import chalk from 'chalk';
import clear from 'clear';
import figlet from 'figlet';
import signale from 'signale';
import Configstore from 'configstore';

const config = new Configstore('opencart-find-module');

export function showWelcome(): void {
  clear();

  signale.log(chalk.yellow(figlet.textSync('Opencart\nModule\nFinder', {
    font: 'Doom',
    horizontalLayout: 'full',
  })));

  signale.log('Edit your config');
  signale.log(`${config.path}\n`);
}

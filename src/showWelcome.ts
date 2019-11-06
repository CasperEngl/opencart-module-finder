import chalk from 'chalk';
import clear from 'clear';
import figlet from 'figlet';
import signale from 'signale';

export function showWelcome(): void {
  clear();

  signale.log(chalk.yellow(figlet.textSync('Opencart\nModule\nFinder', {
    font: 'Doom',
    horizontalLayout: 'full',
  })));
}

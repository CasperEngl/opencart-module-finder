import chalk from 'chalk';
import clear from 'clear';
import figlet from 'figlet';

export function showWelcome() {
  clear();
  console.log(chalk.yellow(figlet.textSync('Opencart\nModule\nFinder', {
    font: 'Doom',
    horizontalLayout: 'full',
  })));
}

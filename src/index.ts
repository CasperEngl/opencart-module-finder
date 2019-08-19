import path from 'path';
import chalk from 'chalk';
import clear from 'clear';
import figlet from 'figlet';
import puppeteer from 'puppeteer';

import * as inquirer from './inquirer';

clear();

console.log(
  chalk.yellow(
    figlet.textSync('Opencart\nModule\nFinder', {
      horizontalLayout: 'full',
    }),
  ),
);

async function run() {
  const { username, password, pinCode }: any = await inquirer.askForOpencartCredentials();
  const { moduleName }: any = await inquirer.askForModuleName();

  const browser = await puppeteer.launch({
    headless: false,
  });

  const page = await browser.newPage();

  await page.goto('https://www.opencart.com/index.php?route=account/login');

  await page.type('#input-email', username);
  await page.type('#input-password', password);

  await page.screenshot({
    path: path.join(__dirname, '../screenshots/login-page.png'),
    fullPage: true,
  });

  await page.click('#account-login .col-sm-6.col-md-6 > form button.btn.btn-primary.btn-lg.hidden-xs[type="submit"]');

  await page.waitFor('#input-pin');

  await page.type('#input-pin', pinCode);

  await page.waitFor('#account-security .col-md-8 > form button.btn.btn-primary.btn-lg[type="submit"]');

  await page.click('#account-security .col-md-8 > form button.btn.btn-primary.btn-lg[type="submit"]');
  
  await page.waitFor('#account-account');

  await page.screenshot({
    path: path.join(__dirname, '../screenshots/logged-in.png'),
    fullPage: true,
  });

  await browser.close();

  console.log({
    username,
    password,
    moduleName,
  });
}

run();

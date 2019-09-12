import path from 'path';
import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import ProgressBar from 'progress';
import signale from 'signale';

import * as inquirer from './inquirer';
import { assertConfigKeyValueExists } from './assertConfigKeyValueExists';
import { configPath } from './configPath';
import { doTick } from './doTick';
import { getLastPageNumber } from './getLastPageNumber';
import { getPageNumber } from './getPageNumber';
import { filterItemsFromPageObject } from './filterItemsFromPageObject';
import { showWelcome } from './showWelcome';
import { wait } from './wait';

import { Config } from './types/Config';
import { Page } from './types/Page';

const PAGES: Page[] = [];

async function loopPagination(page: puppeteer.Page, progress: ProgressBar) {
  try {
    const titles = await page.$$eval('#downloads-list h3', (titles) => titles.map((title) => title.textContent && title.textContent.toLowerCase()));

    PAGES.push({
      pageNumber: getPageNumber(page),
      items: titles,
    });

    await page.waitForSelector('ul.pagination li:last-of-type a', {
      timeout: 5000,
    });

    const lastButton = await page.$eval('ul.pagination li:last-of-type a', (link) => link.textContent);

    if (lastButton == '>|') {
      await page.click('ul.pagination li:nth-last-of-type(2) a');

      await loopPagination(page, progress);
    }

    doTick(progress);
  } finally {
    progress.update(1);

    return PAGES;
  }
}

async function run() {
  showWelcome();

  const config: Config = {
    username: '',
    password: '',
    pinCode: '',
  };

  fs.exists(configPath, async (exists) => {
    if (exists) {
      const config: Config = JSON.parse((await fs.readFile(configPath)).toString());

      assertConfigKeyValueExists(config, 'username');
      assertConfigKeyValueExists(config, 'password');
      assertConfigKeyValueExists(config, 'pinCode', 'pin code');

      const browserProgress = new ProgressBar('Starting scraper [:bar] :percent', {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: 9,
      });

      const browser = await puppeteer.launch({
        headless: true,
      });

      browserProgress.tick();

      const page = await browser.newPage();

      browserProgress.tick();

      await page.goto('https://www.opencart.com/index.php?route=account/login');

      browserProgress.tick();

      await page.type('#input-email', 'opencart@designheroes.net');

      browserProgress.tick();
      await page.type('#input-password', 'DHNPass2015');

      browserProgress.tick();

      await page.screenshot({
        path: path.join(__dirname, '../screenshots/login-page.png'),
        fullPage: true,
      });

      await page.click('#account-login .col-sm-6.col-md-6 > form button.btn.btn-primary.btn-lg.hidden-xs[type="submit"]');

      browserProgress.tick();

      await page.waitFor('#input-pin');

      await page.type('#input-pin', '0365');

      browserProgress.tick();

      await page.waitFor('#account-security .col-md-8 > form button.btn.btn-primary.btn-lg[type="submit"]');

      await page.click('#account-security .col-md-8 > form button.btn.btn-primary.btn-lg[type="submit"]');

      browserProgress.tick();

      await page.waitFor('#account-account');

      await page.screenshot({
        path: path.join(__dirname, '../screenshots/logged-in.png'),
        fullPage: true,
      });

      await page.click('#short-cut .row:nth-of-type(4) .col-md-6:nth-of-type(2) h4.media-heading a');

      browserProgress.tick();

      browserProgress.terminate();

      await page.screenshot({
        path: path.join(__dirname, '../screenshots/downloads-page.png'),
        fullPage: true,
      });

      signale.info('Scraper successfully started! 🎉');

      await wait(2000);

      showWelcome();

      const { moduleName }: any = await inquirer.askForModuleName();

      const lastPage: string = await page.$eval('ul.pagination li:last-of-type a', (link: any) => link.href);
      const progress = new ProgressBar('Starting scraper [:bar] :percent', {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: getLastPageNumber(lastPage),
      });

      const items = await loopPagination(page, progress);
      const matches = items
        .filter((item) => filterItemsFromPageObject(item, moduleName).length)
        .map((item) => ({
          pageNumber: item.pageNumber,
          items: filterItemsFromPageObject(item, moduleName),
        }));

      await fs.writeFile(path.join(__dirname, '../output/items.json'), JSON.stringify(items, null, 2));
      await fs.writeFile(path.join(__dirname, '../output/matches.json'), JSON.stringify(matches, null, 2));

      matches.forEach((match) => {
        signale.info(`${moduleName} found on ${match.pageNumber}`);
      });

      await browser.close();

      // console.log({
      //   username,
      //   password,
      //   pinCode,
      //   moduleName,
      // });
    } else {
      await fs.writeFile(configPath, JSON.stringify(config, null, 2));

      throw new Error(`Update your config at ${configPath} and run the program again.`);
    }
  });
}

run();

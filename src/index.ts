#! /usr/bin/env node

import path from 'path';
import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import ProgressBar from 'progress';
import signale from 'signale';

import * as inquirer from './inquirer';
import { assertConfigKeyValueExists } from './assertConfigKeyValueExists';
import { configPath } from './configPath';
import { getLastPageNumber } from './getLastPageNumber';
import { getPageNumber } from './getPageNumber';
import { filterItemsFromPageObject } from './filterItemsFromPageObject';
import { showWelcome } from './showWelcome';
import { wait } from './wait';

import { Config } from './types/Config';
import { Page } from './types/Page';

type ScannedPage = false | {
  pageNumber: number;
  items: (string | null)[];
}

async function scanPage(page: puppeteer.Page): Promise<ScannedPage> {
  try {
    const titles = await page.$$eval('#downloads-list h3', (titles) => titles.map((title) => title.textContent && title.textContent.toLowerCase()));

    await page.waitForSelector('ul.pagination li:last-of-type a', {
      timeout: 3000,
    });

    const lastButton = await page.$eval('ul.pagination li:last-of-type a', (link) => link.textContent);

    if (lastButton === '>|') {
      await page.click('ul.pagination li:nth-last-of-type(2) a');
    }

    return {
      pageNumber: getPageNumber(page),
      items: titles,
    };
  } catch (e) {
    // console.error(e);

    return false;
  }
}

((): void => {
  showWelcome();

  const config: Config = {
    username: '',
    password: '',
    pinCode: '',
  };

  fs.exists(configPath, async (exists) => {
    if (exists) {
      const config: Config = JSON.parse((await fs.readFile(configPath)).toString());

      if (!config) {
        return;
      }

      try {
        assertConfigKeyValueExists(config, 'username');
        assertConfigKeyValueExists(config, 'password');
        assertConfigKeyValueExists(config, 'pinCode', 'pin code');
      } catch (error) {
        signale.error(error.message);

        return;
      }

      const browserProgress = new ProgressBar('Starting scraper [:bar] :percent', {
        complete: '=',
        incomplete: ' ',
        width: 30,
        total: 9,
      });

      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      browserProgress.tick();

      const page = await browser.newPage();

      browserProgress.tick();

      await page.goto('https://www.opencart.com/index.php?route=account/login');

      browserProgress.tick();

      await page.type('#input-email', config.username);

      browserProgress.tick();

      await page.type('#input-password', config.password);

      browserProgress.tick();

      await page.screenshot({
        path: path.join(__dirname, '../screenshots/login-page.png'),
        fullPage: true,
      });

      await page.click('#account-login .col-sm-6.col-md-6 > form button.btn.btn-primary.btn-lg.hidden-xs[type="submit"]');

      browserProgress.tick();

      await page.waitFor('#input-pin');

      await page.type('#input-pin', config.pinCode);

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

      signale.success('Scraper started! 🎉');

      await wait(2000);

      showWelcome();

      const { moduleName } = await inquirer.askForModuleName();

      const lastPage = await page.$eval('ul.pagination li:last-of-type a', (link) => link.getAttribute('href'));

      const pages: Page[] = [];

      const paginationProgress = new ProgressBar(`Scanning ${getLastPageNumber(lastPage)} pages [:bar] :percent`, {
        complete: '=',
        incomplete: ' ',
        width: 30,
        total: getLastPageNumber(lastPage),
      });

      /* eslint-disable no-plusplus, no-await-in-loop */
      for (let i = 1; i <= getLastPageNumber(lastPage); i++) {
        try {
          const scanned = await scanPage(page);

          // signale.success(`Scanned page ${i}`);

          if (scanned) {
            pages.push(scanned);
          }
        } catch {
          // signale.error(`Scanned page ${i}`);
        } finally {
          paginationProgress.update((1 / getLastPageNumber(lastPage)) * i);
        }
      }
      /* eslint-enable no-plusplus, no-await-in-loop */

      paginationProgress.terminate();

      const matches = pages
        .filter((item) => filterItemsFromPageObject(item, moduleName).length)
        .map((item) => ({
          pageNumber: item.pageNumber,
          items: filterItemsFromPageObject(item, moduleName),
        }));

      await fs.writeFile(path.join(__dirname, '../output/items.json'), JSON.stringify(pages, null, 2));
      await fs.writeFile(path.join(__dirname, '../output/matches.json'), JSON.stringify(matches, null, 2));

      matches.forEach((match) => {
        signale.note(`${match.items.length} ${match.items.length === 1 ? 'item' : 'items'} found on page ${match.pageNumber}`);

        match.items.forEach((item) => {
          signale.log(`- ${item}`);
        });

        signale.log('');
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
})();

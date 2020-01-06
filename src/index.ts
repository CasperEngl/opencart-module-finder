#! /usr/bin/env node

import puppeteer from 'puppeteer';
import ProgressBar from 'progress';
import signale from 'signale';
import Configstore from 'configstore';

import * as inquirer from './inquirer';
import { assertConfigKeyValueExists } from './assertConfigKeyValueExists';
import { getLastPageNumber } from './getLastPageNumber';
import { getPageNumber } from './getPageNumber';
import { filterItemsFromPageObject } from './filterItemsFromPageObject';
import { showWelcome } from './showWelcome';
import { wait } from './wait';

import { Page } from './types/Page';
import { validateUsername } from './validateUsername';
import { validatePincode } from './validatePincode';

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

(async (): Promise<void> => {
  try {
    showWelcome();

    await wait(1000);

    const config = new Configstore('opencart-find-module', {
      username: null,
      password: null,
      pinCode: null,
      headless: true,
    });

    try {
      try {
        await assertConfigKeyValueExists(config, 'username', 'Username');
        await assertConfigKeyValueExists(config, 'password', 'Password');
        await assertConfigKeyValueExists(config, 'pinCode', 'Pincode');
      } catch (error) {
        showWelcome();

        const [key, name] = error.message.split('|');

        signale.error(`${name || key} is missing from your config`);

        const { answer } = await inquirer.askForConfigKey(key, name);

        validateUsername(config, answer, key, name);
        validatePincode(config, answer, key, name);

        config.set(key, answer);

        showWelcome();
      }
    } catch (error) {
      signale.error(error.message);

      process.exit(9);
    }

    const browserProgress = new ProgressBar('Starting scraper [:bar] :percent', {
      complete: '=',
      incomplete: ' ',
      width: 30,
      total: 9,
    });

    const browser = await puppeteer.launch({
      headless: config.get('headless') === true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    browserProgress.tick();

    const page = await browser.newPage();

    await page.setViewport({ width: 1920, height: 1080 });

    browserProgress.tick();

    await page.goto('https://www.opencart.com/index.php?route=account/login');

    browserProgress.tick();

    await page.type('#input-email', config.get('username'));

    browserProgress.tick();

    await page.type('#input-password', config.get('password'));

    browserProgress.tick();

    await page.click('#account-login .col-sm-6.col-md-6 > form button.btn.btn-primary.btn-lg.hidden-xs[type="submit"]');

    browserProgress.tick();

    await page.waitFor('#input-pin');

    await page.type('#input-pin', config.get('pinCode'));

    browserProgress.tick();

    await page.waitFor('#account-security .col-md-8 > form button.btn.btn-primary.btn-lg[type="submit"]');

    await page.click('#account-security .col-md-8 > form button.btn.btn-primary.btn-lg[type="submit"]');

    browserProgress.tick();

    await page.waitFor('#short-cut .row:nth-of-type(4) .col-md-6:nth-of-type(2) h4.media-heading a');

    await page.click('#short-cut .row:nth-of-type(4) .col-md-6:nth-of-type(2) h4.media-heading a');

    browserProgress.tick();

    browserProgress.terminate();

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

    signale.log(`Total matches ${matches.length}\n`);

    matches.forEach((match) => {
      signale.note(`${match.items.length} ${match.items.length === 1 ? 'item' : 'items'} found on page ${match.pageNumber}`);

      match.items.forEach((item) => {
        signale.log(`- ${item}`);
      });

      signale.log('');
    });

    await browser.close();
  } catch (error) {
    showWelcome();

    signale.error(error.message);
  }
})();

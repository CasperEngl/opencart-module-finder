import puppeteer from 'puppeteer';
import qs from 'query-string';

export function getPageNumber(page: puppeteer.Page) {
  return Number(qs.parseUrl(page.url()).query.page) || 1;
}

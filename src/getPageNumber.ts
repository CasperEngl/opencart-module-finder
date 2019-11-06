import { Page } from 'puppeteer';
import qs from 'query-string';

export function getPageNumber(page: Page): number {
  return Number(qs.parseUrl(page.url()).query.page) || 1;
}

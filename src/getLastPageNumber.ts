import qs from 'query-string';

export function getLastPageNumber(url: string) {
  return Number(qs.parseUrl(url).query.page) || 1;
}

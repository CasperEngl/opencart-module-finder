import qs from 'query-string';

export function getLastPageNumber(url: string | null): number {
  if (url) {
    return Number(qs.parseUrl(url).query.page) || 1;
  }

  return 1;
}

import { Page } from './types/Page';

export function filterItemsFromPageObject(item: Page, filterWord: string): (string | null)[] {
  return item.items.filter((subItem) => subItem && subItem.includes(filterWord.toLowerCase()));
}

import { Page } from "./types/Page";
export function filterItemsFromPageObject(item: Page, filterWord: string) {
  return item.items.filter(subItem => subItem && subItem.includes(filterWord.toLowerCase()));
}

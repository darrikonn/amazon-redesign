// The shop's own writes to the address. Each hands the framework only the shop's keys: it
// adds its own, and when handed those it skips keeping usePathname and useSearchParams in
// step with the new address, which left sign-in links pointing at an older search.

export function pushProductEntry(url: string) {
  window.history.pushState({ [OPENED_PRODUCT]: true }, "", url);
}

export function isProductEntry(): boolean {
  return window.history.state?.[OPENED_PRODUCT] === true;
}

export function replaceAddress(url: string) {
  window.history.replaceState(isProductEntry() ? { [OPENED_PRODUCT]: true } : {}, "", url);
}

// Marks a history entry that opening a product pushed, so closing steps back to the entry
// before it instead of piling up entries. It stays in history.state, so it survives a reload.
const OPENED_PRODUCT = "openedProduct";

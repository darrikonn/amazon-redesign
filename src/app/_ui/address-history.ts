// The browser history, as the shop uses it. Each write hands the framework only the shop's
// keys: it adds its own, and when handed those it skips keeping usePathname and
// useSearchParams in step with the new address, which left sign-in links pointing at an
// older search.
export type AddressHistory = {
  currentUrl: () => string;
  isProductEntry: () => boolean;
  pushProductEntry: (url: string) => void;
  replaceAddress: (url: string) => void;
  back: () => void;
};

export const BROWSER_HISTORY: AddressHistory = {
  currentUrl: () => window.location.href,
  isProductEntry,
  pushProductEntry: (url) => window.history.pushState({ [OPENED_PRODUCT]: true }, "", url),
  replaceAddress,
  back: () => window.history.back(),
};

// An address that is already showing is not written again: on a page's first render the
// framework has not yet stored its own state, and a write then would leave the entry
// without it, so stepping Back onto it would reload the page.
export function replaceAddress(url: string) {
  if (url === `${window.location.pathname}${window.location.search}`) return;
  window.history.replaceState(isProductEntry() ? { [OPENED_PRODUCT]: true } : {}, "", url);
}

function isProductEntry(): boolean {
  return window.history.state?.[OPENED_PRODUCT] === true;
}

// Marks a history entry that opening a product pushed, so closing steps back to the entry
// before it instead of piling up entries. It stays in history.state, so it survives a reload.
const OPENED_PRODUCT = "openedProduct";

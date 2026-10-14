export type TimerHandle = number;

export type Timer = {
  schedule: (callback: () => void, delayInMilliseconds: number) => TimerHandle;
  cancel: (handle: TimerHandle) => void;
};

export const BROWSER_TIMER: Timer = {
  schedule: (callback, delayInMilliseconds) => window.setTimeout(callback, delayInMilliseconds),
  cancel: (handle) => window.clearTimeout(handle),
};

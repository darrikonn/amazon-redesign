import type { Timer, TimerHandle } from "./timer";

export const SEARCH_PAUSE_IN_MILLISECONDS = 250;

// Decides when typed text becomes the searched text. Typing, including backspacing the
// bar empty, waits for a pause, so the search does not rerun on every keystroke and the
// page does not fold home while the shopper deletes a query to write a new one. Applying
// a chip, a suggestion, Enter, or the clear button searches at once.
export class SearchTextScheduler {
  private pending: TimerHandle | null = null;

  constructor(
    private readonly timer: Timer,
    private readonly commit: (text: string) => void,
  ) {}

  type(text: string): void {
    this.cancelPending();
    this.pending = this.timer.schedule(() => {
      this.pending = null;
      this.commit(text);
    }, SEARCH_PAUSE_IN_MILLISECONDS);
  }

  apply(text: string): void {
    this.cancelPending();
    this.commit(text);
  }

  dispose(): void {
    this.cancelPending();
  }

  private cancelPending(): void {
    if (this.pending === null) return;
    this.timer.cancel(this.pending);
    this.pending = null;
  }
}

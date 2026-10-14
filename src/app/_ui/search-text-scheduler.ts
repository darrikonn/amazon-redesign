import type { Timer, TimerHandle } from "./timer";

export const SEARCH_PAUSE_IN_MILLISECONDS = 250;

// Decides when typed text becomes the searched text. Typing waits for a pause so the
// search does not rerun on every keystroke; emptying the bar, or applying a chip,
// suggestion, or Enter, searches at once.
export class SearchTextScheduler {
  private pending: TimerHandle | null = null;

  constructor(
    private readonly timer: Timer,
    private readonly commit: (text: string) => void,
  ) {}

  type(text: string): void {
    this.cancelPending();
    if (text.trim() === "") {
      this.commit(text);
      return;
    }
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

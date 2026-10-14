import type { Timer, TimerHandle } from "./timer";

// Reports idle once no activity has been seen for the delay, and busy again on the next
// activity. Busy is reported only when the state actually changes.
export class IdleTracker {
  private pending: TimerHandle;
  private isIdle = false;

  constructor(
    private readonly timer: Timer,
    private readonly delayInMilliseconds: number,
    private readonly onChange: (isIdle: boolean) => void,
  ) {
    this.pending = this.startCountdown();
  }

  activity(): void {
    this.timer.cancel(this.pending);
    if (this.isIdle) this.report(false);
    this.pending = this.startCountdown();
  }

  dispose(): void {
    this.timer.cancel(this.pending);
  }

  private startCountdown(): TimerHandle {
    return this.timer.schedule(() => this.report(true), this.delayInMilliseconds);
  }

  private report(isIdle: boolean): void {
    this.isIdle = isIdle;
    this.onChange(isIdle);
  }
}

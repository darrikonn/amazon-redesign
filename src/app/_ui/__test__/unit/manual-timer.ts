import type { Timer, TimerHandle } from "@/app/_ui/timer";

// A timer the test advances by hand, so timing rules can be checked without waiting.
export class ManualTimer implements Timer {
  private now = 0;
  private nextHandle = 1;
  private readonly scheduled = new Map<TimerHandle, { at: number; callback: () => void }>();

  schedule(callback: () => void, delayInMilliseconds: number): TimerHandle {
    const handle = this.nextHandle;
    this.nextHandle += 1;
    this.scheduled.set(handle, { at: this.now + delayInMilliseconds, callback });
    return handle;
  }

  cancel(handle: TimerHandle): void {
    this.scheduled.delete(handle);
  }

  advance(milliseconds: number): void {
    this.now += milliseconds;
    for (const [handle, entry] of [...this.scheduled.entries()].sort(
      ([, first], [, second]) => first.at - second.at,
    )) {
      if (entry.at > this.now || !this.scheduled.has(handle)) continue;
      this.scheduled.delete(handle);
      entry.callback();
    }
  }

  get pendingCount(): number {
    return this.scheduled.size;
  }
}

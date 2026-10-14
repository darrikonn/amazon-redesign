import type { Clock } from "@/core";

const DEFAULT_NOW = "2026-10-14T12:00:00.000Z";

export class FixedClock implements Clock {
  readonly calls: "now"[] = [];
  private current = new Date(DEFAULT_NOW);

  setNow(date: Date): void {
    this.current = new Date(date.getTime());
  }

  advanceBy(milliseconds: number): void {
    this.current = new Date(this.current.getTime() + milliseconds);
  }

  now(): Date {
    this.calls.push("now");
    return new Date(this.current.getTime());
  }

  reset(): void {
    this.calls.length = 0;
    this.current = new Date(DEFAULT_NOW);
  }
}

import type { Clock } from "@/core";

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}

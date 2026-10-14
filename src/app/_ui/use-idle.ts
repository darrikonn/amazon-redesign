import { useEffect, useState } from "react";
import { IdleTracker } from "./idle-tracker";
import { BROWSER_TIMER } from "./timer";

export function useIdle(delayInMilliseconds: number): boolean {
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    const tracker = new IdleTracker(BROWSER_TIMER, delayInMilliseconds, setIsIdle);
    const onActivity = () => tracker.activity();
    for (const event of ACTIVITY_EVENTS)
      window.addEventListener(event, onActivity, { passive: true });
    return () => {
      tracker.dispose();
      for (const event of ACTIVITY_EVENTS) window.removeEventListener(event, onActivity);
    };
  }, [delayInMilliseconds]);

  return isIdle;
}

const ACTIVITY_EVENTS = [
  "pointermove",
  "pointerdown",
  "keydown",
  "wheel",
  "scroll",
  "touchstart",
] as const;

import { useEffect, useState } from "react";

// True once the shopper has not moved the pointer, scrolled, touched, or typed for
// `delayInMilliseconds`; any of those makes it false again.
export function useIdle(delayInMilliseconds: number): boolean {
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    let timer = window.setTimeout(() => setIsIdle(true), delayInMilliseconds);
    function onActivity() {
      setIsIdle(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIsIdle(true), delayInMilliseconds);
    }
    for (const event of ACTIVITY_EVENTS)
      window.addEventListener(event, onActivity, { passive: true });
    return () => {
      window.clearTimeout(timer);
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

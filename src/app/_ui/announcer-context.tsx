"use client";

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";

type Announce = (message: string) => void;

const AnnouncerContext = createContext<Announce | null>(null);

type Announcement = {
  message: string;
  count: number;
};

// One polite status region for the whole shop, so a change that leaves no visible trace
// where the shopper is (a line deleted, an item added from an order) is still heard. Each
// announcement is a new element, so the same words said twice are read twice.
export function AnnouncerProvider({ children }: { children: ReactNode }) {
  const [announcement, setAnnouncement] = useState<Announcement>({ message: "", count: 0 });
  const announce = useCallback((message: string) => {
    setAnnouncement((current) => ({ message, count: current.count + 1 }));
  }, []);
  const value = useMemo(() => announce, [announce]);
  return (
    <AnnouncerContext value={value}>
      {children}
      <p role="status" className="visually-hidden">
        <span key={announcement.count}>{announcement.message}</span>
      </p>
    </AnnouncerContext>
  );
}

export function useAnnounce(): Announce {
  const announce = useContext(AnnouncerContext);
  if (announce === null) throw new Error("useAnnounce is used outside the ShopProvider");
  return announce;
}

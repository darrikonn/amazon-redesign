import { useState } from "react";

// Keeps the last value that was present, so its content can fold away instead of vanishing.
export function useRetained<T>(value: T | null): T | null {
  const [retained, setRetained] = useState(value);
  if (value !== null && value !== retained) setRetained(value);
  return value ?? retained;
}

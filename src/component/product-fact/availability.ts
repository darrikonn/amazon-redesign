import type { Availability } from "@/core";
import { isAvailability } from "@/core";

// The source writes "In Stock", "Low Stock", and "Out of Stock".
export function availabilityFrom(status: string | null): Availability | null {
  const slug = (status ?? "").trim().toLowerCase().replaceAll(/\s+/g, "-");
  return isAvailability(slug) ? slug : null;
}

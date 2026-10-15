import { describe, expect, it } from "vitest";
import { DEFAULT_POSTAL_CODE, deliveryCityFor, normalisePostalCode } from "@/component";

describe("delivery areas", () => {
  it("accepts five-digit ZIP codes and names the cities it knows", () => {
    expect(normalisePostalCode(" 10001 ")).toBe("10001");
    expect(normalisePostalCode("1000")).toBeNull();
    expect(normalisePostalCode("10001-1234")).toBeNull();
    expect(deliveryCityFor("10001")).toBe("New York");
    expect(deliveryCityFor("12345")).toBeNull();
    expect(deliveryCityFor(DEFAULT_POSTAL_CODE)).toBe("Minneapolis");
  });
});

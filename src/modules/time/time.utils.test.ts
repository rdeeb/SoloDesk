import { describe, expect, it } from "vitest";
import { parseDurationToMinutes } from "@/modules/time/time.utils";

describe("parseDurationToMinutes", () => {
  it("converts decimal hours to minutes", () => {
    expect(parseDurationToMinutes({ mode: "decimal", decimalHours: 1.5 })).toBe(90);
    expect(parseDurationToMinutes({ mode: "decimal", decimalHours: 0.25 })).toBe(15);
  });

  it("converts hours and minutes to minutes", () => {
    expect(parseDurationToMinutes({ mode: "hoursMinutes", hours: 2, minutes: 30 })).toBe(150);
    expect(parseDurationToMinutes({ mode: "hoursMinutes", hours: 0, minutes: 45 })).toBe(45);
  });
});

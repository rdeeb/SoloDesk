export type DurationInput =
  | {
      mode: "decimal";
      decimalHours: number;
    }
  | {
      mode: "hoursMinutes";
      hours: number;
      minutes: number;
    };

export function parseDurationToMinutes(input: DurationInput) {
  if (input.mode === "decimal") {
    return Math.max(0, Math.round(input.decimalHours * 60));
  }

  return Math.max(0, input.hours * 60 + input.minutes);
}

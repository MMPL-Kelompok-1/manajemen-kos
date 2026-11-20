export const EMAIL_RE = /^[a-z0-9._%+-]+@gmail\.com$/;
export const PHONE_RE = /^(08\d{8,11}|628\d{8,11})$/;
export const MIN_PASSWORD = 8;

export function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

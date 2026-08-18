/** Capitalizes the first letter of each whitespace-separated word. */
export const toTitleCase = (value: string): string =>
  value
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

/** Normalizes an email for lookup: trimmed and lowercased. */
export const normalizeEmail = (value: string): string =>
  value.trim().toLowerCase();

/** Loose email shape check — matches the registry's expectations. */
export const isValidEmail = (value: string): boolean =>
  value.includes("@") && value.includes(".");

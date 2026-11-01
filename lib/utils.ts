// 1299 -> "1,299"
export const fmt = (n: number) => n.toLocaleString("en-US");

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

// Accepts Bangla digits, spaces, dashes and a +88 prefix → "01XXXXXXXXX"
export function normalizePhone(raw: string) {
  const ascii = raw.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
  return ascii.replace(/\D/g, "").replace(/^88(?=01)/, "");
}

// Bangladeshi mobile number: 11 digits, operator prefix 013–019
export const isValidPhone = (raw: string) => /^01[3-9]\d{8}$/.test(normalizePhone(raw));

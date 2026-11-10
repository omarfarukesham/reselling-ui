import type { CSSProperties } from "react";

// Colour palettes for landing pages, as "R G B" channels.
// Applied as CSS variables on the page wrapper; tailwind's brand-*, cream and ink read them.
export type Theme = {
  brand: Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800, string>;
  cream: string;
  ink: string; // footer background
};

// Soft rose / berry: feminine but calm. 600 on white passes WCAG AA for button text.
export const roseTheme: Theme = {
  brand: {
    50: "253 242 246", // #fdf2f6
    100: "251 227 236", // #fbe3ec
    200: "245 192 211", // #f5c0d3
    300: "236 150 182",
    400: "224 110 152",
    500: "209 74 124", // #d14a7c
    600: "176 48 95", // #b0305f
    700: "142 33 73", // #8e2149
    800: "116 28 62",
  },
  cream: "255 247 250", // #fff7fa
  ink: "42 15 29", // #2a0f1d deep plum
};

export function themeStyle(theme?: Theme): CSSProperties | undefined {
  if (!theme) return undefined;
  const vars: Record<string, string> = { "--cream": theme.cream, "--ink": theme.ink };
  for (const [shade, rgb] of Object.entries(theme.brand)) vars[`--brand-${shade}`] = rgb;
  return vars as CSSProperties;
}

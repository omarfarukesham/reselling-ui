export const FB_PIXEL_ID =
  process.env.NEXT_PUBLIC_FB_PIXEL_ID || "2903726283332598";

export const pageview = () => {
  if (typeof window !== "undefined" && typeof (window as any).fbq === "function") {
    (window as any).fbq("track", "PageView");
  }
};

export const fbEvent = (name: string, options: Record<string, unknown> = {}) => {
  if (typeof window !== "undefined" && typeof (window as any).fbq === "function") {
    (window as any).fbq("track", name, options);
  }
};


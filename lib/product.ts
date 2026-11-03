// ─────────────────────────────────────────────────────────────
// Single-product landing data. Edit all page content here in one place.
// Price, sizes and contact info are placeholders — confirm before going live.
// ─────────────────────────────────────────────────────────────

export type ColorId = "red" | "blue" | "brown";
export type ProductView = "baby" | "back";

export type Combo = {
  qty: number;
  price: number; // total product price for this many pieces (delivery not included)
  freeDelivery: boolean;
  title: string;
  tag?: string;
};

export const product = {
  brand: "E Buy",
  name: "Teddy Bear Baby Wrap",
  nameBn: "টেডি বিয়ার বেবি হুডি র‍্যাপ",
  tagline: "শীতের রাতে বাবু থাকবে উষ্ণ, আপনি থাকবেন নিশ্চিন্ত",
  subtitle:
    "বাইরে তুলতুলে টেডি ফ্লিস, ভেতরে নরম কুইল্টেড লাইনিং। মাথা থেকে পা পর্যন্ত ঢাকা থাকে, তাই ঘুমের মধ্যে হাত-পা ছুড়লেও ঠান্ডা লাগে না।",
  badge: "এই শীতে সবচেয়ে বেশি চলছে",

  price: 390,
  oldPrice: 550,
  currency: "৳",

  // Combo pricing. The order form only offers these quantities.
  combos: [
    { qty: 1, price: 390, freeDelivery: false, title: "১টা" },
    { qty: 2, price: 780, freeDelivery: true, title: "২টা" },
    { qty: 3, price: 990, freeDelivery: true, title: "৩টা", tag: "সবচেয়ে বেশি সাশ্রয়" },
  ] as Combo[],

  // Each colour has 2 photos in /public/assets/products: <id>-baby.webp and <id>-back.webp
  // Colour names are shown in English on purpose.
  colors: [
    { id: "blue", name: "Blue", hex: "#1f2d6e", file: "navy" },
    { id: "red", name: "Red", hex: "#b3141c", file: "red" },
    { id: "brown", name: "Brown", hex: "#8f4a1c", file: "brown" },
  ] as { id: ColorId; name: string; hex: string; file: string }[],

  views: [
    { id: "baby", label: "বাবুর গায়ে" },
    { id: "back", label: "পেছন থেকে" },
  ] as { id: ProductView; label: string }[],

  heroBullets: [
    "কানওয়ালা হুড, মাথা আর কান দুটোই ঢাকা থাকে",
    "পা দুটো আলাদা পকেটে, লাথি দিলেও খুলে যায় না",
    "সামনে স্ন্যাপ বাটন, ঘুম না ভাঙিয়েই ডায়াপার বদলানো যায়",
  ],

  // Short trust strip under the hero CTA (icons are mapped in Hero.tsx)
  trust: ["হাতে পেয়ে টাকা", "সারা দেশে ডেলিভারি", "সহজে এক্সচেঞ্জ"],

  rating: { value: "4.10", count: "200+" },

  stats: [
    { value: "200+", label: "হ্যাপি প্যারেন্টস" },
    { value: "4.10★", label: "গড় রেটিং" },
    { value: "64", label: "জেলায় ডেলিভারি" },
  ],

  video: {
    src: "/assets/video/product-demo.mp4",
    poster: "/assets/video/product-demo-poster.jpg",
    title: "ভিডিওতে দেখে নিন",
    caption: "কাপড় কেমন আর কীভাবে পরাবেন",
    duration: "0:45",
  },

  // Feature cards in Product Details (icons are mapped in ProductDetails.tsx)
  features: [
    { icon: "hood", title: "কানওয়ালা হুড", desc: "মাথা আর কান ঢাকা থাকে, দেখতেও ভারি মিষ্টি লাগে।" },
    { icon: "fleece", title: "নরম টেডি ফ্লিস", desc: "বাইরের কাপড়টা তুলতুলে আর গরম, শীতের জন্য একদম ঠিক।" },
    { icon: "lining", title: "কুইল্টেড লাইনিং", desc: "ভেতরটা নরম, বাবুর গায়ে ঘষা লাগে না।" },
    { icon: "wrap", title: "র‍্যাপ ডিজাইন", desc: "দুই পাশের ডানা দিয়ে সহজে মুড়িয়ে নেওয়া যায়।" },
    { icon: "feet", title: "পায়ের পকেট", desc: "দুই পা আলাদা পকেটে থাকে, ছুড়াছুড়ি করলেও খোলে না।" },
    { icon: "snap", title: "স্ন্যাপ বাটন", desc: "সামনে বাটন, তাই পরানো আর ডায়াপার বদলানো সহজ।" },
  ],

  // TODO: confirm the real size range with the supplier
  sizes: [
    { label: "0-3M", age: "০-৩ মাস", weight: "৩-৬ কেজি" },
    { label: "3-6M", age: "৩-৬ মাস", weight: "৬-৮ কেজি" },
  ],

  whyUs: [
    { icon: "quality", title: "কাপড় ভালো", desc: "ঘন নরম ফ্লিস, সেলাইও মজবুত।" },
    { icon: "cod", title: "আগে টাকা লাগবে না", desc: "পণ্য হাতে পেয়ে তারপর টাকা দিবেন।" },
    { icon: "delivery", title: "দ্রুত ডেলিভারি", desc: "ঢাকায় ১-২ দিন, ঢাকার বাইরে ২-৪ দিন।" },
    { icon: "exchange", title: "সহজে এক্সচেঞ্জ", desc: "সাইজ না মিললে ঝামেলা ছাড়াই বদলে নিন।" },
  ],

  // TODO: replace with real customer reviews (e.g. from Facebook comments/messages)
  reviews: [
    {
      name: "সুমাইয়া আক্তার",
      location: "ঢাকা",
      rating: 5,
      text: "কাপড়টা অনেক নরম আর মোটা। বাবুকে মুড়িয়ে রাখলে একদম উষ্ণ থাকে, কান দুটো খুব কিউট!",
    },
    {
      name: "নুসরাত জাহান",
      location: "চট্টগ্রাম",
      rating: 5,
      text: "স্ন্যাপ বাটন থাকায় পরানো খুব সহজ। ছবিতে যেমন দেখেছি ঠিক তেমনই পেয়েছি।",
    },
    {
      name: "ফারহানা ইসলাম",
      location: "সিলেট",
      rating: 5,
      text: "ভাতিজার জন্য গিফট করেছি, সবাই প্রশংসা করেছে। দাম অনুযায়ী কোয়ালিটি দারুণ।",
    },
  ],

  delivery: {
    inside: { label: "ঢাকার ভিতরে", charge: 80 },
    outside: { label: "ঢাকার বাইরে", charge: 120 },
  },

  contact: {
    phone: "+8801722434764",
    whatsapp: "+8801722434764",
    email: "support@ebuy.com",
    facebook: "https://www.facebook.com/profile.php?id=61568012606229",
  },
};

// File prefix comes from colors[].file (e.g. Blue -> navy-baby.webp).
// Use a new file name whenever a photo is replaced, so browsers don't show a cached old one.
export const productImage = (color: ColorId, view: ProductView) =>
  `/assets/products/${colorById(color).file}-${view}.webp`;

export const colorById = (id: ColorId) => product.colors.find((c) => c.id === id) ?? product.colors[0];

export const MAX_QTY = Math.max(...product.combos.map((c) => c.qty));

export const comboFor = (qty: number): Combo =>
  product.combos.find((c) => c.qty === qty) ?? product.combos[0];

// What the customer would pay without the combo (for the "you save" line)
export const regularPrice = (qty: number) => product.price * qty;

export type Product = typeof product;

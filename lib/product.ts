// ─────────────────────────────────────────────────────────────
// Single-product landing data. Edit all page content here in one place.
// Price, sizes and contact info are placeholders — confirm before going live.
// ─────────────────────────────────────────────────────────────

export type ColorId = "red" | "grey" | "brown";
export type ProductView = "baby" | "front" | "back";

export const product = {
  brand: "E Buy",
  name: "Teddy Bear Baby Wrap",
  nameBn: "টেডি বিয়ার বেবি হুডি র‍্যাপ",
  tagline: "নবজাতকের জন্য নরম টেডি বিয়ার হুডি র‍্যাপ",
  subtitle: "বাইরে তুলতুলে টেডি ফ্লিস, ভেতরে নরম কুইল্টেড লাইনিং — শীতে বাবুকে মাথা থেকে পা পর্যন্ত উষ্ণ রাখে।",
  badge: "শীতের বেস্ট সেলার",

  price: 390,
  oldPrice: 550,
  currency: "৳",

  // Each colour has 3 photos in /public/assets/products: <id>-baby / -front / -back.webp
  colors: [
    { id: "red", name: "Red", nameBn: "লাল", hex: "#b3141c" },
    { id: "grey", name: "Grey", nameBn: "ছাই", hex: "#9e9e9e" },
    { id: "brown", name: "Brown", nameBn: "বাদামি", hex: "#8f4a1c" },
  ] as { id: ColorId; name: string; nameBn: string; hex: string }[],

  views: [
    { id: "baby", label: "বাবুর গায়ে" },
    { id: "front", label: "সামনে" },
    { id: "back", label: "পেছনে" },
  ] as { id: ProductView; label: string }[],

  heroBullets: [
    "বিয়ার কান হুড — মাথা ও কান উষ্ণ রাখে",
    "পায়ের পকেট — লাথি দিলেও খুলে যায় না",
    "সামনে স্ন্যাপ বাটন — সহজে পরানো যায়",
  ],

  // Short trust strip under the hero CTA (icons are mapped in Hero.tsx)
  trust: ["ক্যাশ অন ডেলিভারি", "সারা দেশে ডেলিভারি", "সহজ এক্সচেঞ্জ"],

  rating: { value: "4.9", count: "1000+" },

  stats: [
    { value: "1000+", label: "হ্যাপি প্যারেন্টস" },
    { value: "4.9★", label: "গড় রেটিং" },
    { value: "64", label: "জেলায় ডেলিভারি" },
  ],

  video: {
    src: "/assets/video/product-demo.mp4",
    poster: "/assets/video/product-demo-poster.jpg",
    title: "ভিডিওতে দেখে নিন",
    caption: "কাপড়ের কোয়ালিটি ও ব্যবহারের নিয়ম",
    duration: "0:45",
  },

  // Feature cards in Product Details (icons are mapped in ProductDetails.tsx)
  features: [
    { icon: "hood", title: "বিয়ার কান হুড", desc: "মাথা ও কান ঢেকে রাখে, দেখতেও দারুণ কিউট।" },
    { icon: "fleece", title: "নরম টেডি ফ্লিস", desc: "বাইরে তুলতুলে শেরপা ফ্লিস — শীতে উষ্ণ রাখে।" },
    { icon: "lining", title: "কুইল্টেড লাইনিং", desc: "ভেতরে নরম কুইল্টেড কাপড় — ত্বকে আরামদায়ক।" },
    { icon: "wrap", title: "র‍্যাপ ডিজাইন", desc: "দুই পাশের ডানা দিয়ে সহজে মুড়িয়ে নিন।" },
    { icon: "feet", title: "পায়ের পকেট", desc: "দুই পা আলাদা পকেটে — হাত-পা ছুড়লেও খোলে না।" },
    { icon: "snap", title: "স্ন্যাপ বাটন", desc: "সামনে বাটন — পরানো ও ডায়াপার বদলানো সহজ।" },
  ],

  // TODO: confirm the real size range with the supplier
  sizes: [
    { label: "0-3M", age: "০-৩ মাস", weight: "৩-৬ কেজি" },
    { label: "3-6M", age: "৩-৬ মাস", weight: "৬-৮ কেজি" },
  ],

  whyUs: [
    { icon: "quality", title: "প্রিমিয়াম কোয়ালিটি", desc: "ঘন নরম ফ্লিস ও মজবুত সেলাই।" },
    { icon: "cod", title: "ক্যাশ অন ডেলিভারি", desc: "পণ্য হাতে পেয়ে টাকা পরিশোধ করুন।" },
    { icon: "delivery", title: "দ্রুত ডেলিভারি", desc: "ঢাকায় ১-২ দিন, বাইরে ২-৪ দিন।" },
    { icon: "exchange", title: "সহজ এক্সচেঞ্জ", desc: "সাইজ না মিললে সহজেই বদলে নিন।" },
  ],

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

export const productImage = (color: ColorId, view: ProductView) => `/assets/products/${color}-${view}.webp`;

export const colorById = (id: ColorId) => product.colors.find((c) => c.id === id) ?? product.colors[0];

export type Product = typeof product;

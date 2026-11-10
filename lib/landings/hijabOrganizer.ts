import type { SingleProduct } from "./types";
import { roseTheme } from "./theme";
import { product as mainProduct } from "@/lib/product";

// /products/hijab-organizer — Premium 20 Grids Organizer With Transparent Zipper Cover
// Tone: casual, warm Bangla with everyday English words, written for hijabi sisters.
export const hijabOrganizer: SingleProduct = {
  slug: "hijab-organizer",
  brand: mainProduct.brand,
  name: "Premium 20 Grids Organizer With Transparent Zipper Cover",
  shortName: "হিজাব অর্গানাইজার",
  featuresTitle: "আপনার ওয়ার্ডরোবে কেন এটা চাই?",
  badge: "হিজাবি আপুদের জন্য ✨",
  headline: "হিজাব খুঁজতে খুঁজতে আর দেরি নয়, সবগুলো থাকবে গুছানো, এক নজরে",
  subtitle:
    "২০টা আলাদা খোপে প্রিয় হিজাব, স্কার্ফ আর ওড়না রোল করে রাখুন। Transparent zipper cover দিয়ে উপর থেকেই দেখে নিন আজ কোনটা পরবেন।",

  price: 450,
  // No regular price given, so no crossed-out price is shown.
  currency: "৳",
  freeDelivery: false,
  maxQty: 5,

  // TODO: confirm the second photo's colour is what you call "Red Print"
  colors: [
    { id: "blue-print", name: "Blue Print", hex: "#2340b0", image: "/assets/hijab/blue-print.webp" },
    { id: "red-print", name: "Red Print", hex: "#e55a2b", image: "/assets/hijab/red-print.webp" },
  ],
  images: [
    { src: "/assets/hijab/blue-print.webp", alt: "Blue Print হিজাব অর্গানাইজারে ২০টা রঙিন হিজাব রোল করে রাখা" },
    { src: "/assets/hijab/red-print.webp", alt: "ওয়ার্ডরোবে রাখা Red Print হিজাব অর্গানাইজার, Transparent zipper cover সহ" },
  ],

  heroBullets: [
    "২০টা আলাদা খোপ, প্রতিটা হিজাবের নিজের জায়গা",
    "Transparent cover, না খুলেই দেখা যায় ভেতরে কী আছে",
    "Wardrobe, closet বা bedside, যেখানে খুশি রাখুন",
  ],
  trust: ["হাতে পেয়ে টাকা", "সারা দেশে ডেলিভারি", "অরিজিনাল পণ্য"],
  guarantee: "১০০% অরিজিনাল পণ্য ও প্রিমিয়াম কোয়ালিটির গ্যারান্টি",

  features: [
    { icon: "grid", title: "২০টা আলাদা খোপ", desc: "প্রতিটা হিজাব আলাদা খোপে, একটার সাথে আরেকটা জড়িয়ে যাবে না।" },
    { icon: "view", title: "Transparent Cover", desc: "উপর থেকেই সব দেখা যায়, পছন্দেরটা বের করতে সময় লাগে না।" },
    { icon: "layers", title: "রোল করে রাখুন", desc: "হিজাব, স্কার্ফ, ওড়না রোল করে রাখলে দেখতেও সুন্দর, জায়গাও কম লাগে।" },
    { icon: "frame", title: "ধুলাবালি থেকে সুরক্ষা", desc: "Zipper বন্ধ রাখলে ধুলা-ময়লা থেকে বাঁচাতে সাহায্য করে।" },
    { icon: "premium", title: "Premium ও Stylish", desc: "সুন্দর print করা কাভার, ঘরের সাথে মানিয়ে যায়।" },
    { icon: "home", title: "যেখানে খুশি রাখুন", desc: "সাইজ 18 × 15 × 7.5 ইঞ্চি, wardrobe, closet বা খাটের পাশে সহজেই জায়গা হয়ে যায়।" },
  ],

  story: {
    eyebrow: "No more messy hijabs",
    title: "অগোছালো হিজাবের দিন শেষ! 💕",
    body: "সকালে বের হওয়ার তাড়া, আর পছন্দের হিজাবটা খুঁজতে পুরো আলমারি উলটপালট? এখন আপনার পুরো হিজাব কালেকশন থাকবে এক জায়গায়, সুন্দরভাবে আর হাতের নাগালে।",
    points: [
      "এক নজরেই দেখে নিন আজ কোনটা পরবেন",
      "আলমারিতে আর হিজাবের স্তূপ নয়",
      "মা, বোন বা বান্ধবীর জন্য সুন্দর একটা গিফট",
    ],
    image: "/assets/hijab/red-print.webp",
    imageAlt: "ওয়ার্ডরোবে গুছিয়ে রাখা হিজাব অর্গানাইজার",
  },

  delivery: mainProduct.delivery,
  contact: {
    phone: mainProduct.contact.phone,
    whatsapp: mainProduct.contact.whatsapp,
    email: mainProduct.contact.email,
    facebook: mainProduct.contact.facebook,
  },

  theme: roseTheme,
};

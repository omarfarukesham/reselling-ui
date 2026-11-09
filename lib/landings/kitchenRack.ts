import type { SingleProduct } from "./types";
import { product as mainProduct } from "@/lib/product";

// /another1 — 2 Layer Kitchen Organizer Metal Framed Storage Rack
export const kitchenRack: SingleProduct = {
  brand: mainProduct.brand,
  name: "2 Layer Kitchen Organizer Metal Framed Storage Rack",
  shortName: "কিচেন র‍্যাক",
  featuresTitle: "কেন এই র‍্যাকটা নিবেন?",
  badge: "রান্নাঘর গোছানোর সহজ উপায়",
  headline: "মসলার পট থেকে তেলের বোতল, সব থাকবে পরিপাটি গুছানো এক জায়গায়",
  subtitle:
    "মজবুত মেটাল ফ্রেমের ২ তাকের র‍্যাক। কিচেনের এলোমেলো জিনিসগুলো স্মার্টলী সাজিয়ে রাখুন, জায়গা বাঁচবে, সময় বাঁচবে এবং দেখতেও সুন্দর লাগবে।",

  price: 1150,
  oldPrice: 1500,
  currency: "৳",
  freeDelivery: true,
  maxQty: 5,

  // First colour is selected by default; its photo is also the first gallery photo.
  colors: [
    { id: "golden-brown", name: "Golden Brown", hex: "#c07a2c", image: "/assets/kitchen/golden-brown.webp" },
    { id: "dark-chocolate", name: "Dark Chocolate", hex: "#3b2620", image: "/assets/kitchen/dark-chocolate.webp" },
  ],
  images: [
    { src: "/assets/kitchen/golden-brown.webp", alt: "কিচেনে মসলার পট রাখা ২ লেয়ার র‍্যাক, Golden Brown" },
    { src: "/assets/kitchen/kitchen-shelf.webp", alt: "কিচেন কাউন্টারে মসলা ও তেলের বোতল রাখা ২ লেয়ার র‍্যাক" },
    { src: "/assets/kitchen/dark-chocolate.webp", alt: "২ লেয়ার র‍্যাক, Dark Chocolate, মাপ সহ" },
  ],

  heroBullets: [
    "মজবুত মেটাল ফ্রেম, উন্নতমানের পাউডার হিট-প্রেস কালার",
    "টেকসই, অনেক দিন ব্যবহার করতে পারবেন",
    "কিচেন, বেডরুম, লিভিং রুম, যেখানে দরকার রাখুন",
  ],
  trust: ["হাতে পেয়ে টাকা", "ডেলিভারি ফ্রি", "অরিজিনাল পণ্য"],
  guarantee: "১০০% অরিজিনাল পণ্য ও প্রিমিয়াম কোয়ালিটির গ্যারান্টি",

  features: [
    { icon: "frame", title: "মজবুত মেটাল ফ্রেম", desc: "শক্ত মেটালের তৈরি, অনেক দিন টিকবে।" },
    { icon: "finish", title: "প্রিমিয়াম ফিনিশ", desc: "উন্নতমানের পাউডার হিট-প্রেস কালার ফিনিশিং।" },
    { icon: "design", title: "সুন্দর ডিজাইন", desc: "চকলেট উড আর কালো মেটালের কম্বিনেশন, ঘরের সাথে মানিয়ে যায়।" },
    { icon: "layers", title: "২ তাকে জায়গা", desc: "দুই তাকে ভাগ করে রাখুন, দরকারি জিনিস খুঁজতে হবে না।" },
    { icon: "home", title: "সব ঘরে চলে", desc: "কিচেন, বেডরুম বা লিভিং রুম, যেখানে খুশি ব্যবহার করুন।" },
    { icon: "space", title: "জায়গা বাঁচায়", desc: "কমপ্যাক্ট সাইজ, কাউন্টারের এক কোণায় সহজে বসে যায়।" },
  ],
  specs: {
    image: "/assets/kitchen/size-guide.webp",
    rows: [
      { label: "উচ্চতা", value: "১৭ ইঞ্চি" },
      { label: "দৈর্ঘ্য", value: "১৭ ইঞ্চি" },
      { label: "উপরের তাক (চওড়া)", value: "৫ ইঞ্চি" },
      { label: "নিচের তাক (চওড়া)", value: "৮ ইঞ্চি" },
      { label: "ওজন", value: "৩ কেজি" },
      { label: "রং", value: "Golden Brown, Dark Chocolate" },
      { label: "ফ্রেম", value: "মেটাল, পাউডার হিট-প্রেস কালার" },
    ],
  },

  delivery: mainProduct.delivery,
  contact: {
    phone: mainProduct.contact.phone,
    whatsapp: mainProduct.contact.whatsapp,
    email: mainProduct.contact.email,
    facebook: mainProduct.contact.facebook,
  },
};

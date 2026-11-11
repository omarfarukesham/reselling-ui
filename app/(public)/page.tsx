import Hero from "@/components/landing/sections/Hero";
import ProductDetails from "@/components/landing/sections/ProductDetails";
import ComboOffer from "@/components/landing/sections/ComboOffer";
import WhyUs from "@/components/landing/sections/WhyUs";
import Reviews from "@/components/landing/sections/Reviews";
import OrderForm from "@/components/landing/sections/OrderForm";
import { OrderSelectionProvider } from "@/components/landing/OrderSelection";

export default function HomePage() {
  return (
    <OrderSelectionProvider>
      <Hero />
      {/* <ProductDetails /> */}
      <ComboOffer />
      <WhyUs />
      <OrderForm />
      {/* Main page keeps its built-in sample reviews until real ones are published */}
      <Reviews showSamples />
    </OrderSelectionProvider>
  );
}

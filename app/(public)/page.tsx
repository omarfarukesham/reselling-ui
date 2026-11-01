import Hero from "@/components/landing/sections/Hero";
import Stats from "@/components/landing/sections/Stats";
import ProductDetails from "@/components/landing/sections/ProductDetails";
import WhyUs from "@/components/landing/sections/WhyUs";
import Reviews from "@/components/landing/sections/Reviews";
import OrderForm from "@/components/landing/sections/OrderForm";
import { OrderSelectionProvider } from "@/components/landing/OrderSelection";

export default function HomePage() {
  return (
    <OrderSelectionProvider>
      <Hero />
      <Stats />
      <ProductDetails />
      <WhyUs />
      <Reviews />
      <OrderForm />
    </OrderSelectionProvider>
  );
}

import CustomerHero from "../components/CustomerHero";
import AboutUsSection from "../components/AboutUsSection";
import ProductShowcase from "../components/ProductShowcase";
import WhyChooseUs from "../components/WhyChooseUs";
import BlogInspiration from "../components/BlogInspiration";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";

export default function CustomerHomePage() {
  return (
    <div className="bg-cream min-h-screen">
      <CustomerHero />
      <ProductShowcase />
      <WhyChooseUs />
      <BlogInspiration />
      <AboutUsSection />
      <FAQ />
      <Footer />
    </div>
  );
}

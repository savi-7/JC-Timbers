import Hero from "../components/Hero";
import AboutUsSection from "../components/AboutUsSection";
import ProductShowcase from "../components/ProductShowcase";
import WhyChooseUs from "../components/WhyChooseUs";
import Testimonials from "../components/Testimonials";
import BlogInspiration from "../components/BlogInspiration";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";

export default function HomePage() {
  return (
    <div className="bg-cream min-h-screen">
      <Hero />
      <ProductShowcase />
      <WhyChooseUs />
      <Testimonials />
      <BlogInspiration />
      <AboutUsSection />
      <FAQ />
      <Footer />
    </div>
  );
}

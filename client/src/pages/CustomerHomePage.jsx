import CustomerHero from "../components/CustomerHero";
import AboutUsSection from "../components/AboutUsSection";
import ProductShowcase from "../components/ProductShowcase";
import WhyChooseUs from "../components/WhyChooseUs";
import BlogInspiration from "../components/BlogInspiration";
import FAQ from "../components/FAQ";
import ContactForm from "../components/ContactForm";
import Footer from "../components/Footer";
import Header from "../components/Header";

export default function CustomerHomePage() {
  return (
    <div className="bg-cream min-h-screen">
      <Header />
      <CustomerHero />
      <ProductShowcase />
      <WhyChooseUs />
      <BlogInspiration />
      <AboutUsSection />
      <FAQ />
      <ContactForm />
      <Footer />
    </div>
  );
}

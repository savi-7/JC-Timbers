import Header from "../components/Header";
import Hero from "../components/Hero";
import AboutUsSection from "../components/AboutUsSection";
import ProductShowcase from "../components/ProductShowcase";
import WhyChooseUs from "../components/WhyChooseUs";
import Testimonials from "../components/Testimonials";
import BlogInspiration from "../components/BlogInspiration";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";

export default function HomePage() {
const { role } = useAuth();

if (role === 'admin') {
  return <Navigate to="/admin/dashboard" />;
}

if (role === 'customer') {
  return <Navigate to="/customer-home" />;
}
  return (
    <div className="bg-cream min-h-screen">
      <Header />
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

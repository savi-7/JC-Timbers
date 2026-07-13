import React, { useState } from 'react';
import Header from "../components/Header";
import Hero from "../components/Hero";
import AboutUsSection from "../components/AboutUsSection";
import ProductShowcase from "../components/ProductShowcase";
import WhyChooseUs from "../components/WhyChooseUs";
import Testimonials from "../components/Testimonials";
import BlogInspiration from "../components/BlogInspiration";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";
import EntranceLoader from "../components/EntranceLoader";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";

export default function HomePage() {
  const { role } = useAuth();
  const [loadingComplete, setLoadingComplete] = useState(false);

  if (role === 'admin') {
    return <Navigate to="/admin/dashboard" />;
  }

  if (role === 'customer') {
    return <Navigate to="/customer-home" />;
  }

  return (
    <>
      <EntranceLoader onLoadingComplete={() => setLoadingComplete(true)} />
      
      <div className={`bg-cream min-h-screen overflow-x-clip transition-opacity duration-1000 ${loadingComplete ? 'opacity-100' : 'opacity-0 h-screen overflow-hidden'}`}>
        <Header />
        <Hero />
        <ProductShowcase />
        <AboutUsSection />
        <WhyChooseUs />
        <Testimonials />
        <BlogInspiration />
        <FAQ />
        <Footer />
      </div>
    </>
  );
}

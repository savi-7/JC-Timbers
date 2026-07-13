import React, { useState } from 'react';
import CustomerHero from "../components/CustomerHero";
import AboutUsSection from "../components/AboutUsSection";
import ProductShowcase from "../components/ProductShowcase";
import WhyChooseUs from "../components/WhyChooseUs";
import BlogInspiration from "../components/BlogInspiration";
import FAQ from "../components/FAQ";
import ContactForm from "../components/ContactForm";
import Footer from "../components/Footer";
import Header from "../components/Header";
import EntranceLoader from "../components/EntranceLoader";

export default function CustomerHomePage() {
  const [loadingComplete, setLoadingComplete] = useState(false);

  return (
    <>
      <EntranceLoader onLoadingComplete={() => setLoadingComplete(true)} />
      
      <div className={`bg-cream min-h-screen overflow-x-clip transition-opacity duration-1000 ${loadingComplete ? 'opacity-100' : 'opacity-0 h-screen overflow-hidden'}`}>
        <Header />
        <CustomerHero />
        <ProductShowcase />
        <AboutUsSection />
        <WhyChooseUs />
        <BlogInspiration />
        <FAQ />
        <ContactForm />
        <Footer />
      </div>
    </>
  );
}

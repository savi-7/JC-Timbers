import { useState, useEffect } from 'react';
import { API_BASE } from '../config';
import { motion, AnimatePresence } from 'framer-motion';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const [faqData, setFaqData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFAQs();  
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await fetch(API_BASE + '/faqs');
      if (response.ok) {
        const data = await response.json();
        setFaqData(data.faqs || []);
      } else {
        console.error('Failed to fetch FAQs');
        // Fallback to static data if API fails
        setFaqData(getStaticFAQs());
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      // Fallback to static data if API fails
      setFaqData(getStaticFAQs());
    } finally {
      setLoading(false);
    }
  };

  const getStaticFAQs = () => [
    {
      category: "Shipping & Delivery",
      questions: [
        {
          question: "How long does shipping take?",
          answer: "Standard shipping takes 3-5 business days for metro cities and 5-7 business days for other locations. Express shipping is available for 1-2 day delivery in select cities."
        },
        {
          question: "What are the delivery charges?",
          answer: "Free delivery on orders above ₹5,000. For orders below ₹5,000, delivery charges are ₹200 for metro cities and ₹300 for other locations."
        },
        {
          question: "Do you deliver to all locations?",
          answer: "We deliver to most major cities in India. You can check delivery availability by entering your pincode on our website."
        }
      ]
    },
    {
      category: "Returns & Exchanges",
      questions: [
        {
          question: "What is your return policy?",
          answer: "We offer a 7-day return policy for unused items in original packaging. Custom-made furniture cannot be returned unless there's a manufacturing defect."
        },
        {
          question: "How can I initiate a return?",
          answer: "Contact our customer service team at support@jctimbers.com or call us at +91-9876543210. We'll guide you through the return process."
        },
        {
          question: "Are there any return charges?",
          answer: "Return shipping is free for defective items. For other returns, return shipping charges will be deducted from your refund amount."
        }
      ]
    },
    {
      category: "Product Information",
      questions: [
        {
          question: "What types of wood do you use?",
          answer: "We use premium hardwoods including Teak, Rosewood, Oak, and Mahogany. All our wood is sustainably sourced and certified."
        },
        {
          question: "How do I care for my furniture?",
          answer: "Regular dusting with a soft cloth and occasional polishing with wood-specific products will keep your furniture looking new. Avoid direct sunlight and excessive moisture."
        },
        {
          question: "Do you offer warranties?",
          answer: "Yes, we offer a 2-year warranty against manufacturing defects and a 1-year warranty on hardware and finishes."
        }
      ]
    }
  ];

  const toggleItem = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (loading) {
    return (
      <section className="py-24 bg-cream">
        <div className="max-w-5xl mx-auto px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-brown mx-auto"></div>
            <p className="mt-4 text-dark-brown">Loading FAQs...</p>
          </div>
        </div>
      </section>
    );
  }

  // Flatten FAQs for minimalist list (ignore categories for V2 design)
  const allFaqs = faqData.flatMap(category => category.questions);

  return (
    <section className="py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="mb-24 text-center">
          <h1 className="text-7xl md:text-8xl font-heading text-dark-brown mb-4" style={{ fontWeight: 100 }}>
            FAQs
          </h1>
          <h2 className="text-lg font-paragraph text-dark-brown mb-6" style={{ fontWeight: 300 }}>
            Common Questions
          </h2>
          <p className="text-sm font-paragraph text-dark-brown leading-loose max-w-4xl mx-auto" style={{ fontWeight: 300 }}>
            Have a question? Check out our FAQs to find answers to commonly asked questions about our products and services.
          </p>
        </div>

        {/* Ultra Minimalist FAQ List */}
        <div className="border-t border-dark-brown/20 cursor-default">
          {allFaqs.slice(0, 4).map((item, index) => {
            const isOpen = openIndex === index;
            
            return (
              <div key={index} className="border-b border-dark-brown/20">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full text-left py-10 flex items-center justify-between group focus:outline-none"
                >
                  <span className={`text-3xl md:text-4xl font-heading pr-8 flex-1 transition-colors duration-500 ${isOpen ? 'text-accent-red' : 'text-dark-brown group-hover:text-dark-brown/70'}`}>
                    {item.question}
                  </span>
                  <div className="relative w-8 h-8 flex-shrink-0 flex items-center justify-center">
                    <motion.div 
                      animate={{ rotate: isOpen ? 180 : 0, opacity: isOpen ? 0 : 1 }}
                      transition={{ duration: 0.4 }}
                      className="absolute w-full h-[2px] bg-dark-brown"
                    />
                    <motion.div 
                      animate={{ rotate: isOpen ? 0 : 90 }}
                      transition={{ duration: 0.4 }}
                      className="absolute w-full h-[2px] bg-dark-brown"
                    />
                  </div>
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pb-12 pt-2 md:w-2/3">
                        <p className="text-dark-brown/80 font-paragraph text-xl md:text-2xl leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

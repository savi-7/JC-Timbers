import { useState, useEffect } from 'react';
import { API_BASE } from '../config';

export default function FAQ() {
  const [openItems, setOpenItems] = useState(new Set());
  const [openCategories, setOpenCategories] = useState(new Set());
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
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const toggleCategory = (categoryIndex) => {
    const newOpenCategories = new Set(openCategories);
    if (newOpenCategories.has(categoryIndex)) {
      newOpenCategories.delete(categoryIndex);
    } else {
      newOpenCategories.add(categoryIndex);
    }
    setOpenCategories(newOpenCategories);
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

  return (
    <section className="py-24 bg-cream">
      <div className="max-w-5xl mx-auto px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
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

        {/* FAQ Accordion */}
        <div className="space-y-6">
          {faqData.map((category, categoryIndex) => {
            const isCategoryOpen = openCategories.has(categoryIndex);
            
            return (
              <div key={categoryIndex} className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Category Header - Clickable */}
                <button
                  onClick={() => toggleCategory(categoryIndex)}
                  className="w-full text-left p-6 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-heading text-dark-brown">{category.category}</h3>
                    <svg
                      className={`w-6 h-6 text-dark-brown transition-transform duration-200 flex-shrink-0 ${
                        isCategoryOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                
                {/* Questions - Only visible when category is open */}
                {isCategoryOpen && (
                  <div className="px-6 pb-6">
                    <div className="space-y-4">
                      {category.questions.map((item, itemIndex) => {
                        const globalIndex = `${categoryIndex}-${itemIndex}`;
                        const isOpen = openItems.has(globalIndex);
                        
                        return (
                          <div key={itemIndex} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                            <button
                              onClick={() => toggleItem(globalIndex)}
                              className="w-full text-left flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors duration-200"
                            >
                              <span className="font-paragraph text-dark-brown font-medium pr-4">
                                {item.question}
                              </span>
                              <svg
                                className={`w-5 h-5 text-dark-brown transition-transform duration-200 flex-shrink-0 ${
                                  isOpen ? 'rotate-180' : ''
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            {isOpen && (
                              <div className="px-2 -mx-2 pb-3">
                                <p className="text-dark-brown/80 font-paragraph leading-relaxed">
                                  {item.answer}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

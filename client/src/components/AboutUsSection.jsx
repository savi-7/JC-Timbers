import { useNavigate } from "react-router-dom";

export default function AboutUsSection() {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        {/* About Us Layout */}
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left Column - Living Room Image and CTA */}
          <div className="space-y-6">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Cozy living room with rustic furniture"
                className="w-full h-[400px] object-cover rounded-lg shadow-lg"
              />
            </div>
            <div className="space-y-4">
              <p className="text-dark-brown text-lg leading-relaxed font-paragraph">
  
              </p>
              
            </div>
          </div>

          {/* Right Column - About Us Text */}
          <div className="space-y-8 flex flex-col justify-center">
            {/* About Us Header */}
            <div className="text-center md:text-left">
              <h2 className="text-6xl md:text-7xl font-heading text-dark-brown leading-tight mb-4">
                <span className="text-7xl md:text-8xl">A</span>bout <span className="text-7xl md:text-8xl">U</span>s
              </h2>
              <p className="text-dark-brown text-xl font-paragraph mb-6">Our Story</p>
              <p className="text-dark-brown text-lg leading-relaxed font-paragraph mb-8">
                JC Timbers is a family-owned business dedicated to delivering the finest timber and furniture products in India. With over 20 years of experience, we blend traditional craftsmanship with modern design, ensuring every piece is both beautiful and durable. Our commitment to sustainability means we source our materials responsibly, supporting local communities and the environment. From custom furniture to construction timber, we take pride in our attention to detail and customer satisfaction. Join us on our journey to create spaces that inspire and endure.
              </p>
              <div className="flex justify-center md:justify-start">
                <button
                  className="bg-accent-red hover:bg-dark-brown text-white px-6 py-3 rounded-lg font-paragraph transition-colors duration-200"
                  onClick={() => navigate('/about')}
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

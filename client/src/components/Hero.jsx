import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import dashboardImg from "../assets/dashboard.png"; // Corrected import name

export default function Hero() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="relative">
      {/* Main Hero Content */}
      <div className="bg-cream py-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Main Title */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-heading text-dark-brown mb-8 leading-tight">
              JC Timbers
            </h1>
          </div>

          {/* Hero Image */}
          <div className="mb-12">
            <div className="relative bg-white rounded-lg shadow-lg overflow-hidden w-full">
              <img
                src={dashboardImg}
                alt="Living room"
                className="w-full h-[426px] object-cover"
                style={{ minWidth: 0, maxWidth: "100%" }}
                fetchPriority="high"
              />
            </div>
          </div>

          {/* Description and CTA */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <p className="text-dark-brown text-lg leading-relaxed max-w-2xl font-paragraph">
                {t('hero.subtitle')}
              </p>
            </div>
            <div className="flex-shrink-0">
              <button className="bg-accent-red hover:bg-dark-brown text-white px-8 py-3 rounded-lg font-paragraph transition-colors duration-200">
                {t('hero.cta')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

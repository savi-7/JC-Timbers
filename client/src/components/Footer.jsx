import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export default function Footer() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { t } = useTranslation();

  return (
    <footer className="bg-dark-brown text-white w-full overflow-hidden flex flex-col pt-16 md:pt-20 pb-8 relative">
      <div className="max-w-7xl mx-auto px-6 w-full relative z-10 flex flex-col">
        
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between w-full pb-10">
              <div className="md:w-1/2 mb-10 md:mb-0">
                <p className="text-light-pink/70 text-lg md:text-xl font-paragraph max-w-sm leading-relaxed">
                  {t('footer.companyDescription')}
                </p>
                <div className="flex space-x-6 mt-8">
                  <a href="#" className="text-light-pink/70 hover:text-accent-red hover:-translate-y-1 transition-all duration-300">
                    <span className="uppercase tracking-widest text-sm font-semibold">Instagram</span>
                  </a>
                  <a href="#" className="text-light-pink/70 hover:text-accent-red hover:-translate-y-1 transition-all duration-300">
                    <span className="uppercase tracking-widest text-sm font-semibold">Twitter</span>
                  </a>
                  <a href="#" className="text-light-pink/70 hover:text-accent-red hover:-translate-y-1 transition-all duration-300">
                    <span className="uppercase tracking-widest text-sm font-semibold">LinkedIn</span>
                  </a>
                </div>
              </div>

              <div className="md:w-1/2 flex flex-col md:flex-row gap-12 md:justify-end">
                <div>
                  <h4 className="font-heading text-light-pink/50 mb-6 text-sm uppercase tracking-[0.2em]">{t('footer.quickLinks')}</h4>
                  <ul className="space-y-4">
                    <li><button onClick={() => navigate('/customer-home')} className="hover:text-accent-red transition-colors duration-200 text-left font-paragraph text-xl">{t('nav.home')}</button></li>
                    <li><button onClick={() => navigate('/timber-products')} className="hover:text-accent-red transition-colors duration-200 text-left font-paragraph text-xl">{t('nav.timber')}</button></li>
                    <li><button onClick={() => navigate('/furniture')} className="hover:text-accent-red transition-colors duration-200 text-left font-paragraph text-xl">{t('nav.furniture')}</button></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-heading text-light-pink/50 mb-6 text-sm uppercase tracking-[0.2em]">{t('footer.ourServices')}</h4>
                  <ul className="space-y-4">
                    <li><button onClick={() => navigate('/about-us')} className="hover:text-accent-red transition-colors duration-200 text-left font-paragraph text-xl">{t('footer.aboutUs')}</button></li>
                    <li><button onClick={() => navigate('/contact-us')} className="hover:text-accent-red transition-colors duration-200 text-left font-paragraph text-xl">{t('footer.contactUs')}</button></li>
                    <li><button onClick={() => navigate('/blog')} className="hover:text-accent-red transition-colors duration-200 text-left font-paragraph text-xl">{t('footer.ourBlog')}</button></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Bottom Typography */}
            <div className="mt-10 pt-10 border-t border-light-pink/10 relative">
              <h1 className="text-4xl md:text-7xl leading-none text-center font-heading text-light-pink/10 select-none pointer-events-none mb-6 tracking-widest">
                JC TIMBERS
              </h1>
              
              <div className="w-full flex flex-col md:flex-row justify-between items-center text-light-pink/50 font-paragraph text-[10px] md:text-xs uppercase tracking-widest mt-2">
                <span>© {new Date().getFullYear()} JC Timbers. {t('footer.allRightsReserved')}</span>
                <span className="mt-3 md:mt-0">{t('footer.madeInIndia')} • {t('footer.securePayment')}</span>
              </div>
            </div>
          </div>
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-accent-red/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        </footer>
  );
  }

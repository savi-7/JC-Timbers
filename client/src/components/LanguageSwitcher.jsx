import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ml' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 transition-colors duration-200 shadow-sm min-w-[80px] justify-center"
      title={i18n.language === 'en' ? 'Switch to Malayalam' : 'Switch to English'}
    >
      <Globe className="w-4 h-4 text-gray-600 flex-shrink-0" />
      <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
        {i18n.language === 'en' ? 'EN' : 'ML'}
      </span>
    </button>
  );
};

export default LanguageSwitcher;

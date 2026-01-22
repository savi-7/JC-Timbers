# 🌐 Multi-Language Support - Quick Start

## ✅ What's Been Set Up

Your e-commerce site now supports **English** and **Malayalam** languages!

### Files Created:
1. `src/i18n.js` - i18n configuration
2. `src/locales/en/translation.json` - English translations
3. `src/locales/ml/translation.json` - Malayalam translations
4. `src/components/LanguageSwitcher.jsx` - Language toggle button

### Files Updated:
1. `src/main.jsx` - Added i18n initialization
2. `src/components/Header.jsx` - Added translations and language switcher
3. `src/components/Hero.jsx` - Added translations (example)

## 🚀 How to Test

1. Start your dev server:
```bash
npm run dev
```

2. Open your browser and look for the **globe icon** in the header (top right)

3. Click it to switch between English and Malayalam

4. Watch the navigation menu and hero section change languages!

## 📝 How to Add Translations to Your Components

### Step 1: Import the hook
```javascript
import { useTranslation } from 'react-i18next';
```

### Step 2: Use it in your component
```javascript
function MyComponent() {
  const { t } = useTranslation();
  
  return <button>{t('products.addToCart')}</button>;
}
```

### Step 3: Add your translations
Edit both `locales/en/translation.json` and `locales/ml/translation.json`

## 📚 Available Translation Keys

Check `MULTILANGUAGE_GUIDE.md` for the complete list of available keys.

### Quick Examples:
- `{t('nav.home')}` → "Home" / "ഹോം"
- `{t('products.addToCart')}` → "Add to Cart" / "കാർട്ടിലേക്ക് ചേർക്കുക"
- `{t('common.loading')}` → "Loading..." / "ലോഡ് ചെയ്യുന്നു..."
- `{t('admin.dashboard')}` → "Dashboard" / "ഡാഷ്ബോർഡ്"

## 🎯 Next Steps

To fully translate your app, update these components:

### High Priority:
- [ ] Footer
- [ ] Product cards
- [ ] Cart page
- [ ] Login/Register forms
- [ ] Admin dashboard

### Medium Priority:
- [ ] Product detail pages
- [ ] Checkout flow
- [ ] User profile
- [ ] Order history

### Low Priority:
- [ ] About Us page
- [ ] Contact form
- [ ] FAQ section

## 💡 Tips

1. **Test in both languages** - Make sure Malayalam displays correctly
2. **Keep keys organized** - Use nested objects (nav.home, products.title, etc.)
3. **Consider text length** - Malayalam text may be longer than English
4. **Use meaningful names** - Make translation keys easy to find

## 🔧 Troubleshooting

**Language not switching?**
- Clear browser localStorage
- Hard refresh (Ctrl+Shift+R)

**Translations not showing?**
- Check that the key exists in both language files
- Verify you imported `useTranslation` correctly

**Malayalam text looks broken?**
- Ensure your font supports Malayalam Unicode
- Check that JSON files are UTF-8 encoded

## 📖 Full Documentation

See `MULTILANGUAGE_GUIDE.md` for detailed documentation and examples.

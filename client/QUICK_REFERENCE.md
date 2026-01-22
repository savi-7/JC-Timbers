# 🚀 Multi-Language Quick Reference Card

## Import & Setup
```javascript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();
  // Now you can use t() and i18n
}
```

## Basic Usage
```javascript
// Simple translation
{t('nav.home')}

// With variables (if needed later)
{t('welcome', { name: 'John' })}

// Check current language
{i18n.language} // 'en' or 'ml'

// Change language
i18n.changeLanguage('ml');
```

## Common Translation Keys

### Navigation
```javascript
{t('nav.home')}          // Home / ഹോം
{t('nav.products')}      // Products / ഉൽപ്പന്നങ്ങൾ
{t('nav.cart')}          // Cart / കാർട്ട്
{t('nav.wishlist')}      // Wishlist / വിഷ്‌ലിസ്റ്റ്
```

### Products
```javascript
{t('products.addToCart')}      // Add to Cart
{t('products.addToWishlist')}  // Add to Wishlist
{t('products.inStock')}        // In Stock
{t('products.outOfStock')}     // Out of Stock
{t('products.price')}          // Price
```

### Cart
```javascript
{t('cart.title')}        // Shopping Cart
{t('cart.empty')}        // Your cart is empty
{t('cart.checkout')}     // Proceed to Checkout
{t('cart.total')}        // Total
```

### Common
```javascript
{t('common.save')}       // Save / സംരക്ഷിക്കുക
{t('common.cancel')}     // Cancel / റദ്ദാക്കുക
{t('common.delete')}     // Delete / ഇല്ലാതാക്കുക
{t('common.edit')}       // Edit / എഡിറ്റ് ചെയ്യുക
{t('common.loading')}    // Loading...
{t('common.search')}     // Search / തിരയുക
```

### Admin
```javascript
{t('admin.dashboard')}      // Dashboard
{t('admin.products')}       // Products
{t('admin.orders')}         // Orders
{t('admin.totalRevenue')}   // Total Revenue
```

### Auth
```javascript
{t('auth.email')}           // Email
{t('auth.password')}        // Password
{t('auth.signIn')}          // Sign In
{t('auth.signUp')}          // Sign Up
```

## Adding New Translations

### 1. English (`locales/en/translation.json`)
```json
{
  "mySection": {
    "myKey": "My Text"
  }
}
```

### 2. Malayalam (`locales/ml/translation.json`)
```json
{
  "mySection": {
    "myKey": "എന്റെ ടെക്സ്റ്റ്"
  }
}
```

### 3. Use in Component
```javascript
{t('mySection.myKey')}
```

## Language Switcher Component
```javascript
import LanguageSwitcher from './components/LanguageSwitcher';

// In your component
<LanguageSwitcher />
```

## File Locations
- **Config:** `src/i18n.js`
- **English:** `src/locales/en/translation.json`
- **Malayalam:** `src/locales/ml/translation.json`
- **Switcher:** `src/components/LanguageSwitcher.jsx`

## Testing
```bash
# Start dev server
npm run dev

# Look for globe icon in header
# Click to switch languages
```

## Troubleshooting

### Not working?
1. Check i18n imported in `main.jsx`
2. Verify translation keys exist in both files
3. Clear localStorage: `localStorage.clear()`
4. Hard refresh: Ctrl+Shift+R

### Malayalam not showing?
1. Check UTF-8 encoding
2. Verify font supports Malayalam
3. Check JSON syntax

## Documentation Files
- 📘 `LANGUAGE_SETUP.md` - Quick start
- 📗 `MULTILANGUAGE_GUIDE.md` - Complete guide
- 📙 `TRANSLATION_EXAMPLES.md` - Code examples
- 📕 `TRANSLATION_CHECKLIST.md` - Progress tracker
- 📔 `MULTILANGUAGE_SUMMARY.md` - Implementation summary

---

**Keep this card handy while translating your app!** 🎯

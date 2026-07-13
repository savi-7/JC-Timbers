# How to Translate Your Website Components

## ✅ Already Translated Components
- Header (Navigation)
- Hero Section
- Footer
- LanguageSwitcher

## 🔄 Components That Need Translation

To translate the entire website, you need to add translations to each component. Here's how:

---

## Step-by-Step Process

### 1. Import the Translation Hook

At the top of your component file:

```javascript
import { useTranslation } from 'react-i18next';
```

### 2. Use the Hook in Your Component

Inside your component function:

```javascript
function MyComponent() {
  const { t } = useTranslation();
  
  // ... rest of your component
}
```

### 3. Replace Hardcoded Text

**Before:**
```javascript
<h1>Welcome to Our Store</h1>
<button>Add to Cart</button>
```

**After:**
```javascript
<h1>{t('welcome.title')}</h1>
<button>{t('products.addToCart')}</button>
```

### 4. Add Translation Keys

Add the keys to both language files:

**`locales/en/translation.json`:**
```json
{
  "welcome": {
    "title": "Welcome to Our Store"
  }
}
```

**`locales/ml/translation.json`:**
```json
{
  "welcome": {
    "title": "ഞങ്ങളുടെ സ്റ്റോറിലേക്ക് സ്വാഗതം"
  }
}
```

---

## Priority Components to Translate

### HIGH PRIORITY (User-Facing)

#### 1. CustomerHero Component
**File:** `client/src/components/CustomerHero.jsx`

**Text to translate:**
- "Welcome back"
- "Valued Customer"
- "Discover premium timber products..."
- "Start Shopping"
- "View Cart"
- "Products"
- "Happy Customers"
- "Support"

**Add to translation files:**
```json
// English
"customerHero": {
  "welcomeBack": "Welcome back",
  "valuedCustomer": "Valued Customer",
  "description": "Discover premium timber products, custom furniture, and construction materials tailored to your needs. Your personalized shopping experience awaits.",
  "startShopping": "Start Shopping",
  "viewCart": "View Cart",
  "products": "Products",
  "happyCustomers": "Happy Customers",
  "support": "Support"
}

// Malayalam
"customerHero": {
  "welcomeBack": "തിരികെ സ്വാഗതം",
  "valuedCustomer": "വിലപ്പെട്ട ഉപഭോക്താവ്",
  "description": "നിങ്ങളുടെ ആവശ്യങ്ങൾക്ക് അനുയോജ്യമായ പ്രീമിയം തടി ഉൽപ്പന്നങ്ങൾ, കസ്റ്റം ഫർണിച്ചർ, നിർമ്മാണ സാമഗ്രികൾ എന്നിവ കണ്ടെത്തുക. നിങ്ങളുടെ വ്യക്തിഗത ഷോപ്പിംഗ് അനുഭവം കാത്തിരിക്കുന്നു.",
  "startShopping": "ഷോപ്പിംഗ് ആരംഭിക്കുക",
  "viewCart": "കാർട്ട് കാണുക",
  "products": "ഉൽപ്പന്നങ്ങൾ",
  "happyCustomers": "സന്തുഷ്ട ഉപഭോക്താക്കൾ",
  "support": "പിന്തുണ"
}
```

#### 2. ProductCard Component
**File:** `client/src/components/ProductCard.jsx`

**Common text:**
- "Add to Cart"
- "Add to Wishlist"
- "Out of Stock"
- "In Stock"
- "View Details"

**Already available in translation files!** Just use:
```javascript
{t('products.addToCart')}
{t('products.addToWishlist')}
{t('products.outOfStock')}
{t('products.inStock')}
```

#### 3. ProductShowcase Component
**File:** `client/src/components/ProductShowcase.jsx`

Add section titles and descriptions.

#### 4. WhyChooseUs Component
**File:** `client/src/components/WhyChooseUs.jsx`

Translate all benefit descriptions.

#### 5. FAQ Component
**File:** `client/src/components/FAQ.jsx`

Translate questions and answers.

#### 6. ContactForm Component
**File:** `client/src/components/ContactForm.jsx`

**Text to translate:**
- Form labels (Name, Email, Message)
- Placeholder text
- Submit button
- Success/Error messages

---

## Example: Translating ProductCard

### Before:
```javascript
export default function ProductCard({ product }) {
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>₹{product.price}</p>
      <button>Add to Cart</button>
      <button>Add to Wishlist</button>
      {product.stock === 0 ? <span>Out of Stock</span> : <span>In Stock</span>}
    </div>
  );
}
```

### After:
```javascript
import { useTranslation } from 'react-i18next';

export default function ProductCard({ product }) {
  const { t } = useTranslation();
  
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>₹{product.price}</p>
      <button>{t('products.addToCart')}</button>
      <button>{t('products.addToWishlist')}</button>
      {product.stock === 0 ? 
        <span>{t('products.outOfStock')}</span> : 
        <span>{t('products.inStock')}</span>
      }
    </div>
  );
}
```

---

## Quick Translation Reference

### Already Available Keys:

**Navigation:**
- `t('nav.home')` - Home / ഹോം
- `t('nav.products')` - Products / ഉൽപ്പന്നങ്ങൾ
- `t('nav.cart')` - Cart / കാർട്ട്
- `t('nav.wishlist')` - Wishlist / വിഷ്‌ലിസ്റ്റ്

**Products:**
- `t('products.addToCart')` - Add to Cart
- `t('products.addToWishlist')` - Add to Wishlist
- `t('products.inStock')` - In Stock
- `t('products.outOfStock')` - Out of Stock
- `t('products.price')` - Price

**Common:**
- `t('common.save')` - Save
- `t('common.cancel')` - Cancel
- `t('common.delete')` - Delete
- `t('common.edit')` - Edit
- `t('common.loading')` - Loading...
- `t('common.search')` - Search

**Cart:**
- `t('cart.title')` - Shopping Cart
- `t('cart.empty')` - Your cart is empty
- `t('cart.checkout')` - Proceed to Checkout
- `t('cart.total')` - Total

---

## Components List with Priority

### 🔴 HIGH PRIORITY (Do First)
1. ✅ Header - DONE
2. ✅ Footer - DONE
3. ✅ Hero - DONE
4. ⏳ CustomerHero
5. ⏳ ProductCard
6. ⏳ ProductShowcase
7. ⏳ Cart Page
8. ⏳ Checkout Page

### 🟡 MEDIUM PRIORITY
9. ⏳ WhyChooseUs
10. ⏳ FAQ
11. ⏳ ContactForm
12. ⏳ AboutUsSection
13. ⏳ BlogInspiration
14. ⏳ ProductDetail Page
15. ⏳ Login/Register Pages

### 🟢 LOW PRIORITY
16. ⏳ Admin Dashboard
17. ⏳ User Profile
18. ⏳ Order History
19. ⏳ Testimonials

---

## Testing Your Translations

1. Start your dev server: `npm run dev`
2. Click the language switcher (globe icon)
3. Check if the text changes
4. Look for any text that doesn't change - that needs translation!

---

## Common Mistakes to Avoid

❌ **DON'T:**
```javascript
<button>Add to Cart</button>  // Hardcoded text
```

✅ **DO:**
```javascript
<button>{t('products.addToCart')}</button>  // Translated
```

❌ **DON'T:**
```javascript
const title = "Welcome";  // Hardcoded
return <h1>{title}</h1>;
```

✅ **DO:**
```javascript
const { t } = useTranslation();
return <h1>{t('welcome.title')}</h1>;
```

---

## Need Help?

1. Check existing translation keys in `locales/en/translation.json`
2. Look at translated components (Header, Footer, Hero) for examples
3. Follow the pattern: `{t('section.key')}`
4. Always add to BOTH English and Malayalam files

---

## Quick Start Command

To translate a component:

1. Add import: `import { useTranslation } from 'react-i18next';`
2. Add hook: `const { t } = useTranslation();`
3. Replace text: `"Text"` → `{t('section.key')}`
4. Add keys to both `en/translation.json` and `ml/translation.json`
5. Test by switching languages!

---

**Remember:** The more components you translate, the more of your website will switch languages! Start with the high-priority components that users see most often.

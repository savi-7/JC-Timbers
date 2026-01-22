# Multi-Language Support Guide

## Overview
This application now supports English and Malayalam languages using `react-i18next`.

## Setup Complete ✅
- ✅ Installed i18next, react-i18next, and i18next-browser-languagedetector
- ✅ Created translation files for English and Malayalam
- ✅ Configured i18n with language detection
- ✅ Created LanguageSwitcher component
- ✅ Updated Header component with translations and language switcher
- ✅ Initialized i18n in main.jsx

## How to Use Translations in Components

### 1. Import the useTranslation hook
```javascript
import { useTranslation } from 'react-i18next';
```

### 2. Use the hook in your component
```javascript
function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('nav.home')}</h1>
      <p>{t('products.title')}</p>
    </div>
  );
}
```

### 3. Access nested translations
```javascript
// For "nav.home" in translation.json
{t('nav.home')}

// For "products.addToCart"
{t('products.addToCart')}

// For "admin.dashboard"
{t('admin.dashboard')}
```

## Translation Keys Available

### Navigation (nav)
- `nav.home` - Home
- `nav.products` - Products
- `nav.timber` - Timber Products
- `nav.furniture` - Furniture
- `nav.construction` - Construction Materials
- `nav.marketplace` - Marketplace
- `nav.about` - About Us
- `nav.contact` - Contact
- `nav.cart` - Cart
- `nav.wishlist` - Wishlist
- `nav.profile` - Profile
- `nav.login` - Login
- `nav.register` - Register
- `nav.logout` - Logout

### Products (products)
- `products.title` - Our Products
- `products.viewAll` - View All
- `products.addToCart` - Add to Cart
- `products.addToWishlist` - Add to Wishlist
- `products.outOfStock` - Out of Stock
- `products.inStock` - In Stock
- `products.price` - Price
- `products.description` - Description
- `products.specifications` - Specifications
- `products.reviews` - Reviews
- `products.relatedProducts` - Related Products

### Cart (cart)
- `cart.title` - Shopping Cart
- `cart.empty` - Your cart is empty
- `cart.subtotal` - Subtotal
- `cart.total` - Total
- `cart.checkout` - Proceed to Checkout
- `cart.continueShopping` - Continue Shopping
- `cart.remove` - Remove
- `cart.quantity` - Quantity

### Admin (admin)
- `admin.dashboard` - Dashboard
- `admin.products` - Products
- `admin.orders` - Orders
- `admin.users` - Users
- `admin.vendors` - Vendors
- `admin.reviews` - Reviews
- `admin.stock` - Stock Management
- `admin.support` - Support
- `admin.settings` - Settings
- `admin.totalRevenue` - Total Revenue
- `admin.totalOrders` - Total Orders
- `admin.totalProducts` - Total Products
- `admin.totalUsers` - Total Users

### Common (common)
- `common.search` - Search
- `common.filter` - Filter
- `common.sort` - Sort
- `common.save` - Save
- `common.cancel` - Cancel
- `common.delete` - Delete
- `common.edit` - Edit
- `common.view` - View
- `common.submit` - Submit
- `common.loading` - Loading...
- `common.error` - Error
- `common.success` - Success

### Authentication (auth)
- `auth.email` - Email
- `auth.password` - Password
- `auth.confirmPassword` - Confirm Password
- `auth.forgotPassword` - Forgot Password?
- `auth.signIn` - Sign In
- `auth.signUp` - Sign Up

## Adding New Translations

### 1. Add to English translation file
Edit `client/src/locales/en/translation.json`:
```json
{
  "mySection": {
    "myKey": "My English Text"
  }
}
```

### 2. Add to Malayalam translation file
Edit `client/src/locales/ml/translation.json`:
```json
{
  "mySection": {
    "myKey": "എന്റെ മലയാളം ടെക്സ്റ്റ്"
  }
}
```

### 3. Use in component
```javascript
{t('mySection.myKey')}
```

## Language Switcher

The language switcher is now available in the Header component. Users can:
- Click the globe icon to toggle between English and Malayalam
- The selected language is saved in localStorage
- The page content updates immediately without refresh

## Testing

1. Start your development server:
```bash
cd client
npm run dev
```

2. Open the application in your browser
3. Click the language switcher in the header (globe icon)
4. Verify that navigation items change between English and Malayalam

## Next Steps

To fully translate your application:

1. **Identify all hardcoded text** in your components
2. **Add translation keys** to both translation files
3. **Replace hardcoded text** with `{t('key.name')}`
4. **Test thoroughly** in both languages

### Priority Components to Translate:
- [ ] Hero section
- [ ] Product cards
- [ ] Footer
- [ ] Forms (Login, Register, Contact)
- [ ] Admin Dashboard
- [ ] Cart and Checkout pages
- [ ] Product detail pages
- [ ] Error messages and notifications

## Example: Translating a Component

### Before:
```javascript
function ProductCard({ product }) {
  return (
    <div>
      <h3>{product.name}</h3>
      <button>Add to Cart</button>
      <button>Add to Wishlist</button>
    </div>
  );
}
```

### After:
```javascript
import { useTranslation } from 'react-i18next';

function ProductCard({ product }) {
  const { t } = useTranslation();
  
  return (
    <div>
      <h3>{product.name}</h3>
      <button>{t('products.addToCart')}</button>
      <button>{t('products.addToWishlist')}</button>
    </div>
  );
}
```

## Tips

1. **Keep keys organized** - Use nested objects for related translations
2. **Be consistent** - Use the same naming convention throughout
3. **Test both languages** - Make sure Malayalam text displays correctly
4. **Consider text length** - Malayalam text may be longer/shorter than English
5. **Use meaningful key names** - Make them easy to understand and find

## Troubleshooting

### Translations not showing?
- Check that i18n is imported in main.jsx
- Verify translation keys exist in both language files
- Check browser console for errors

### Language not switching?
- Clear localStorage and try again
- Check that LanguageSwitcher is imported correctly
- Verify i18next-browser-languagedetector is installed

### Malayalam text not displaying?
- Ensure your font supports Malayalam characters
- Check that the JSON file is saved with UTF-8 encoding

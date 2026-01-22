# Translation Examples - Before & After

## Example 1: Simple Button

### ❌ Before (Hardcoded)
```javascript
<button>Add to Cart</button>
```

### ✅ After (Translated)
```javascript
import { useTranslation } from 'react-i18next';

function ProductCard() {
  const { t } = useTranslation();
  return <button>{t('products.addToCart')}</button>;
}
```

**Result:**
- English: "Add to Cart"
- Malayalam: "കാർട്ടിലേക്ക് ചേർക്കുക"

---

## Example 2: Navigation Menu

### ❌ Before
```javascript
<nav>
  <a href="/">Home</a>
  <a href="/products">Products</a>
  <a href="/cart">Cart</a>
</nav>
```

### ✅ After
```javascript
import { useTranslation } from 'react-i18next';

function Navigation() {
  const { t } = useTranslation();
  
  return (
    <nav>
      <a href="/">{t('nav.home')}</a>
      <a href="/products">{t('nav.products')}</a>
      <a href="/cart">{t('nav.cart')}</a>
    </nav>
  );
}
```

---

## Example 3: Form Labels

### ❌ Before
```javascript
<form>
  <label>Email</label>
  <input type="email" />
  
  <label>Password</label>
  <input type="password" />
  
  <button>Sign In</button>
</form>
```

### ✅ After
```javascript
import { useTranslation } from 'react-i18next';

function LoginForm() {
  const { t } = useTranslation();
  
  return (
    <form>
      <label>{t('auth.email')}</label>
      <input type="email" placeholder={t('auth.email')} />
      
      <label>{t('auth.password')}</label>
      <input type="password" placeholder={t('auth.password')} />
      
      <button>{t('auth.signIn')}</button>
    </form>
  );
}
```

---

## Example 4: Product Card

### ❌ Before
```javascript
function ProductCard({ product }) {
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>Price: ₹{product.price}</p>
      <div className="actions">
        <button>Add to Cart</button>
        <button>Add to Wishlist</button>
      </div>
      {product.stock === 0 && <span>Out of Stock</span>}
      {product.stock > 0 && <span>In Stock</span>}
    </div>
  );
}
```

### ✅ After
```javascript
import { useTranslation } from 'react-i18next';

function ProductCard({ product }) {
  const { t } = useTranslation();
  
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{t('products.price')}: ₹{product.price}</p>
      <div className="actions">
        <button>{t('products.addToCart')}</button>
        <button>{t('products.addToWishlist')}</button>
      </div>
      {product.stock === 0 && <span>{t('products.outOfStock')}</span>}
      {product.stock > 0 && <span>{t('products.inStock')}</span>}
    </div>
  );
}
```

---

## Example 5: Admin Dashboard Stats

### ❌ Before
```javascript
<div className="stats">
  <div className="stat-card">
    <h3>Total Revenue</h3>
    <p>₹{revenue}</p>
  </div>
  <div className="stat-card">
    <h3>Total Orders</h3>
    <p>{orders}</p>
  </div>
  <div className="stat-card">
    <h3>Total Products</h3>
    <p>{products}</p>
  </div>
</div>
```

### ✅ After
```javascript
import { useTranslation } from 'react-i18next';

function DashboardStats({ revenue, orders, products }) {
  const { t } = useTranslation();
  
  return (
    <div className="stats">
      <div className="stat-card">
        <h3>{t('admin.totalRevenue')}</h3>
        <p>₹{revenue}</p>
      </div>
      <div className="stat-card">
        <h3>{t('admin.totalOrders')}</h3>
        <p>{orders}</p>
      </div>
      <div className="stat-card">
        <h3>{t('admin.totalProducts')}</h3>
        <p>{products}</p>
      </div>
    </div>
  );
}
```

---

## Example 6: Cart Page

### ❌ Before
```javascript
function Cart({ items }) {
  if (items.length === 0) {
    return <p>Your cart is empty</p>;
  }
  
  return (
    <div>
      <h1>Shopping Cart</h1>
      <div className="cart-items">
        {items.map(item => (
          <div key={item.id}>
            <span>Quantity: {item.quantity}</span>
            <button>Remove</button>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <p>Subtotal: ₹{subtotal}</p>
        <p>Total: ₹{total}</p>
        <button>Proceed to Checkout</button>
      </div>
    </div>
  );
}
```

### ✅ After
```javascript
import { useTranslation } from 'react-i18next';

function Cart({ items, subtotal, total }) {
  const { t } = useTranslation();
  
  if (items.length === 0) {
    return <p>{t('cart.empty')}</p>;
  }
  
  return (
    <div>
      <h1>{t('cart.title')}</h1>
      <div className="cart-items">
        {items.map(item => (
          <div key={item.id}>
            <span>{t('cart.quantity')}: {item.quantity}</span>
            <button>{t('cart.remove')}</button>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <p>{t('cart.subtotal')}: ₹{subtotal}</p>
        <p>{t('cart.total')}: ₹{total}</p>
        <button>{t('cart.checkout')}</button>
      </div>
    </div>
  );
}
```

---

## Example 7: Loading & Error States

### ❌ Before
```javascript
if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;
```

### ✅ After
```javascript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  if (loading) return <div>{t('common.loading')}</div>;
  if (error) return <div>{t('common.error')}: {error.message}</div>;
  
  // ... rest of component
}
```

---

## Example 8: Confirmation Dialog

### ❌ Before
```javascript
<div className="modal">
  <h2>Confirm Delete</h2>
  <p>Are you sure you want to delete this item?</p>
  <button>Yes</button>
  <button>No</button>
</div>
```

### ✅ After
```javascript
import { useTranslation } from 'react-i18next';

function ConfirmDialog() {
  const { t } = useTranslation();
  
  return (
    <div className="modal">
      <h2>{t('common.confirm')}</h2>
      <p>Are you sure you want to delete this item?</p>
      <button>{t('common.yes')}</button>
      <button>{t('common.no')}</button>
    </div>
  );
}
```

---

## Adding New Translation Keys

When you need a new translation that doesn't exist:

### 1. Add to English file (`locales/en/translation.json`)
```json
{
  "checkout": {
    "shippingAddress": "Shipping Address",
    "paymentMethod": "Payment Method",
    "placeOrder": "Place Order"
  }
}
```

### 2. Add to Malayalam file (`locales/ml/translation.json`)
```json
{
  "checkout": {
    "shippingAddress": "ഷിപ്പിംഗ് വിലാസം",
    "paymentMethod": "പേയ്മെന്റ് രീതി",
    "placeOrder": "ഓർഡർ നൽകുക"
  }
}
```

### 3. Use in component
```javascript
const { t } = useTranslation();

<h2>{t('checkout.shippingAddress')}</h2>
<h2>{t('checkout.paymentMethod')}</h2>
<button>{t('checkout.placeOrder')}</button>
```

---

## Tips for Good Translation Keys

✅ **Good:**
- `products.addToCart`
- `nav.home`
- `admin.totalRevenue`

❌ **Bad:**
- `button1`
- `text`
- `label`

**Why?** Good keys are:
- Descriptive
- Organized by section
- Easy to find and maintain

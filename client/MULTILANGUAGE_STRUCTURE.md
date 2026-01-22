# 📂 Multi-Language File Structure

## Project Structure

```
client/
├── src/
│   ├── main.jsx                          ✅ Updated (imports i18n)
│   ├── i18n.js                           ✅ NEW (i18n configuration)
│   │
│   ├── locales/                          ✅ NEW (translation files)
│   │   ├── en/
│   │   │   └── translation.json          ✅ English translations
│   │   └── ml/
│   │       └── translation.json          ✅ Malayalam translations
│   │
│   ├── components/
│   │   ├── Header.jsx                    ✅ Updated (uses translations)
│   │   ├── Hero.jsx                      ✅ Updated (uses translations)
│   │   ├── LanguageSwitcher.jsx          ✅ NEW (language toggle)
│   │   └── LanguageDemo.jsx              ✅ NEW (demo component)
│   │
│   └── pages/
│       └── ... (to be updated)
│
├── LANGUAGE_SETUP.md                     📘 Quick start guide
├── MULTILANGUAGE_GUIDE.md                📗 Complete guide
├── TRANSLATION_EXAMPLES.md               📙 Code examples
├── TRANSLATION_CHECKLIST.md              📕 Progress tracker
├── MULTILANGUAGE_SUMMARY.md              📔 Implementation summary
├── MULTILANGUAGE_STRUCTURE.md            📂 This file
└── QUICK_REFERENCE.md                    🚀 Quick reference
```

## File Descriptions

### Core Files

#### `src/i18n.js`
**Purpose:** Configures i18next with language detection and resources
```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// ... configuration
```

#### `src/main.jsx`
**Purpose:** Entry point - initializes i18n before React renders
```javascript
import "./i18n"; // ← Added this line
```

### Translation Files

#### `src/locales/en/translation.json`
**Purpose:** All English translations
```json
{
  "nav": { "home": "Home", ... },
  "products": { "addToCart": "Add to Cart", ... },
  ...
}
```

#### `src/locales/ml/translation.json`
**Purpose:** All Malayalam translations
```json
{
  "nav": { "home": "ഹോം", ... },
  "products": { "addToCart": "കാർട്ടിലേക്ക് ചേർക്കുക", ... },
  ...
}
```

### Components

#### `src/components/LanguageSwitcher.jsx`
**Purpose:** Globe icon button to toggle languages
- Shows current language (EN / മലയാളം)
- Toggles between English and Malayalam
- Saves preference to localStorage

#### `src/components/Header.jsx`
**Purpose:** Main navigation - now with translations
- Uses `useTranslation()` hook
- Displays translated navigation items
- Includes LanguageSwitcher component

#### `src/components/Hero.jsx`
**Purpose:** Homepage hero section - example implementation
- Demonstrates translation usage
- Shows how to translate static content

#### `src/components/LanguageDemo.jsx`
**Purpose:** Demo component showing all translations
- Useful for testing
- Shows all available translation keys
- Visual preview of both languages

### Documentation Files

#### `LANGUAGE_SETUP.md` 📘
Quick start guide for getting started

#### `MULTILANGUAGE_GUIDE.md` 📗
Complete implementation guide with detailed instructions

#### `TRANSLATION_EXAMPLES.md` 📙
Before/after code examples for common scenarios

#### `TRANSLATION_CHECKLIST.md` 📕
Track translation progress across all components

#### `MULTILANGUAGE_SUMMARY.md` 📔
Overview of what was implemented

#### `QUICK_REFERENCE.md` 🚀
Quick reference card for daily use

#### `MULTILANGUAGE_STRUCTURE.md` 📂
This file - shows file structure

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                      User Action                         │
│              (Clicks Language Switcher)                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  LanguageSwitcher.jsx                    │
│              i18n.changeLanguage('ml')                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                      i18n.js                             │
│         (Updates current language state)                 │
│         (Saves to localStorage)                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Load Translation File                       │
│    locales/ml/translation.json (Malayalam)               │
│         or locales/en/translation.json (English)         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              All Components Re-render                    │
│         Using t('key') from useTranslation()             │
│         Display text in selected language                │
└─────────────────────────────────────────────────────────┘
```

## Component Usage Pattern

```
┌──────────────────────────────────────────────────────────┐
│                    Any Component                          │
│                                                           │
│  import { useTranslation } from 'react-i18next';         │
│                                                           │
│  function MyComponent() {                                │
│    const { t } = useTranslation();                       │
│                                                           │
│    return (                                              │
│      <div>                                               │
│        <h1>{t('nav.home')}</h1>                         │
│        <button>{t('products.addToCart')}</button>       │
│      </div>                                              │
│    );                                                    │
│  }                                                       │
└──────────────────────────────────────────────────────────┘
                     │
                     │ Looks up translation key
                     ▼
┌──────────────────────────────────────────────────────────┐
│              i18n (Current Language: 'ml')                │
└──────────────────────────────────────────────────────────┘
                     │
                     │ Fetches from
                     ▼
┌──────────────────────────────────────────────────────────┐
│         locales/ml/translation.json                       │
│         {                                                 │
│           "nav": { "home": "ഹോം" },                      │
│           "products": {                                   │
│             "addToCart": "കാർട്ടിലേക്ക് ചേർക്കുക"      │
│           }                                               │
│         }                                                 │
└──────────────────────────────────────────────────────────┘
                     │
                     │ Returns translated text
                     ▼
┌──────────────────────────────────────────────────────────┐
│                  Rendered Output                          │
│                                                           │
│  <div>                                                   │
│    <h1>ഹോം</h1>                                          │
│    <button>കാർട്ടിലേക്ക് ചേർക്കുക</button>             │
│  </div>                                                  │
└──────────────────────────────────────────────────────────┘
```

## Translation Key Organization

```
translation.json
├── nav (Navigation)
│   ├── home
│   ├── products
│   ├── cart
│   └── ...
│
├── products (Product related)
│   ├── addToCart
│   ├── addToWishlist
│   ├── price
│   └── ...
│
├── cart (Shopping cart)
│   ├── title
│   ├── empty
│   ├── checkout
│   └── ...
│
├── admin (Admin panel)
│   ├── dashboard
│   ├── products
│   ├── totalRevenue
│   └── ...
│
├── common (Reusable)
│   ├── save
│   ├── cancel
│   ├── loading
│   └── ...
│
├── auth (Authentication)
│   ├── email
│   ├── password
│   ├── signIn
│   └── ...
│
├── hero (Homepage hero)
│   ├── title
│   ├── subtitle
│   └── cta
│
└── footer (Footer section)
    ├── aboutUs
    ├── contactUs
    └── ...
```

## Adding New Sections

When adding a new feature, follow this pattern:

1. **Create translation keys** in both language files:
```json
// en/translation.json
{
  "newFeature": {
    "title": "New Feature",
    "description": "Feature description",
    "action": "Do Something"
  }
}

// ml/translation.json
{
  "newFeature": {
    "title": "പുതിയ സവിശേഷത",
    "description": "സവിശേഷതയുടെ വിവരണം",
    "action": "എന്തെങ്കിലും ചെയ്യുക"
  }
}
```

2. **Use in component:**
```javascript
const { t } = useTranslation();

<div>
  <h2>{t('newFeature.title')}</h2>
  <p>{t('newFeature.description')}</p>
  <button>{t('newFeature.action')}</button>
</div>
```

## Best Practices

✅ **DO:**
- Keep translation files in sync
- Use descriptive key names
- Group related translations
- Test in both languages
- Document custom keys

❌ **DON'T:**
- Hardcode text in components
- Use generic key names (button1, text1)
- Mix languages in same file
- Forget to add to both language files
- Skip testing Malayalam display

---

**This structure provides a solid foundation for a fully bilingual application!** 🌐

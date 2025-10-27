# Playwright Tests - Quick Start ⚡

**Much simpler than Selenium - no driver issues!**

## 🚀 Installation (One-Time Setup)

### Step 1: Install Playwright
```powershell
npm install
```

### Step 2: Install Browsers (One-Time)
```powershell
npx playwright install
```

This will download Chromium, Firefox, and WebKit browsers (~400MB)

---

## ▶️ Running Tests

### Make sure your app is running first!
In another terminal:
```powershell
cd ..\..\..
cd client
npm run dev
```

### Run all 4 tests
```powershell
npm test
```

### Run with UI mode (see tests visually)
```powershell
npm run test:ui
```

### Run with browser visible
```powershell
npm run test:headed
```

---

## ✅ The 4 Tests

1. **Homepage Test** - Checks if homepage loads
2. **Products Test** - Checks products page
3. **Navigation Test** - Tests navigation links
4. **Contact Test** - Tests contact form

---

## 📸 Screenshots

Screenshots are automatically saved to `screenshots/` folder

---

## 💡 Why Playwright is Better

✅ **No driver issues** - Works out of the box
✅ **Faster** - Tests run quicker
✅ **More reliable** - Better auto-waiting
✅ **Built-in screenshots** - Automatic on failures
✅ **Modern** - Latest technology

---

## 🎯 Quick Commands

```powershell
# Install everything
npm install
npx playwright install

# Run tests
npm test

# Run tests with UI
npm run test:ui
```

---

**That's it! Much simpler than Selenium!** 🎉


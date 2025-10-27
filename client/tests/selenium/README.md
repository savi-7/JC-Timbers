# JC-Timbers Selenium Tests

## Overview
This directory contains 4 simple Selenium WebDriver tests for the JC-Timbers e-commerce application.

---

## 📋 Test Suite

### Test 1: Homepage Test (`01-homepage.test.js`)
- ✅ Opens the homepage
- ✅ Checks if page title loads
- ✅ Verifies logo exists
- ✅ Checks main content
- ✅ Takes screenshot

### Test 2: Products Test (`02-products.test.js`)
- ✅ Opens the products page
- ✅ Checks for product cards
- ✅ Verifies navigation exists
- ✅ Looks for product categories (Timber, Furniture, Construction)
- ✅ Takes screenshot

### Test 3: Navigation Test (`03-navigation.test.js`)
- ✅ Tests navigation menu
- ✅ Clicks on different links (Products, About, Contact)
- ✅ Verifies page navigation works
- ✅ Tests Home link
- ✅ Takes screenshot

### Test 4: Contact Form Test (`04-contact.test.js`)
- ✅ Opens contact page
- ✅ Finds form and input fields
- ✅ Fills in name, email, and message
- ✅ Checks for submit button
- ✅ Verifies contact information display
- ✅ Takes screenshot

---

## 🚀 Installation

### Prerequisites
- Node.js installed (v14 or higher)
- Chrome browser installed
- Your JC-Timbers app running on `http://localhost:5173`

### Step 1: Navigate to the selenium directory
```bash
cd client/tests/selenium
```

### Step 2: Install dependencies
```bash
npm install
```

This will install:
- `selenium-webdriver` - Selenium WebDriver for Node.js
- `chromedriver` - Chrome driver for Selenium

---

## ▶️ Running Tests

### Run All Tests
```bash
npm test
```

This will run all 4 tests sequentially and show a summary.

### Run Individual Tests

**Test 1 - Homepage:**
```bash
npm run test:homepage
```

**Test 2 - Products:**
```bash
npm run test:products
```

**Test 3 - Navigation:**
```bash
npm run test:navigation
```

**Test 4 - Contact:**
```bash
npm run test:contact
```

### Alternative: Run tests directly with Node
```bash
node tests/01-homepage.test.js
node tests/02-products.test.js
node tests/03-navigation.test.js
node tests/04-contact.test.js
```

---

## 📸 Screenshots

All tests automatically take screenshots and save them to the `screenshots/` directory:

- `01-homepage.png` - Homepage screenshot
- `02-products.png` - Products page screenshot
- `03-navigation.png` - Navigation test screenshot
- `04-contact.png` - Contact page screenshot
- `*-error.png` - Error screenshots if tests fail

---

## 🔧 Configuration

### Change Test URL
Edit the URL in each test file:
```javascript
await driver.get('http://localhost:5173');
```

Change `http://localhost:5173` to your app's URL.

### Headless Mode
To run tests without opening a browser window, uncomment this line in each test:
```javascript
options.addArguments('--headless');
```

### Increase Wait Time
If your app loads slowly, increase the sleep time:
```javascript
await driver.sleep(2000); // Change to 3000 or 5000
```

---

## 📊 Test Output Example

```
==============================================================
🚀 JC-TIMBERS SELENIUM TEST SUITE
==============================================================
📅 Test Run: 10/27/2025, 10:30:45 AM
==============================================================

🧪 TEST 1: Homepage Test
==================================================
✓ Browser opened
✓ Navigated to homepage
✓ Page title loaded
✓ Page Title: "JC-Timbers"
✓ Logo found on page
✓ Main content found
✓ Screenshot saved: screenshots/01-homepage.png

✅ TEST 1 PASSED: Homepage loaded successfully!

🧪 TEST 2: Products Page Test
==================================================
✓ Browser opened
✓ Navigated to products page
✓ Page Title: "Products - JC-Timbers"
✓ Found 12 product cards
✓ Navigation found
✓ "Timber" category found on page
✓ "Furniture" category found on page
✓ Screenshot saved: screenshots/02-products.png

✅ TEST 2 PASSED: Products page loaded successfully!

🧪 TEST 3: Navigation Test
==================================================
✓ Browser opened
✓ Navigated to homepage
✓ Found 5 navigation links
✓ Clicked "Products" link
✓ Current URL: http://localhost:5173/products
✓ Clicked "About" link
✓ Current URL: http://localhost:5173/about
✓ Screenshot saved: screenshots/03-navigation.png

✅ TEST 3 PASSED: Navigation tested (2 pages)!

🧪 TEST 4: Contact Form Test
==================================================
✓ Browser opened
✓ Navigated to contact page
✓ Page Title: "Contact - JC-Timbers"
✓ Found 1 form(s) on page
✓ Found 3 input field(s)
✓ Filled first input field with "Test User"
✓ Filled email field with "testuser@example.com"
✓ Filled textarea with test message
✓ Submit button found (not clicking in test)
✓ Screenshot saved: screenshots/04-contact.png

✅ TEST 4 PASSED: Contact form tested successfully!

==============================================================
📊 TEST SUMMARY
==============================================================
Total Tests: 4
✅ Passed: 4
❌ Failed: 0
⏱️  Duration: 18.42s
==============================================================

📋 INDIVIDUAL TEST RESULTS:
  1. Test 1: Homepage: ✅ PASSED
  2. Test 2: Products: ✅ PASSED
  3. Test 3: Navigation: ✅ PASSED
  4. Test 4: Contact: ✅ PASSED

==============================================================
🎉 ALL TESTS PASSED! 🎉
==============================================================
```

---

## 🛠️ Troubleshooting

### Error: ChromeDriver version mismatch
**Problem:** Your Chrome browser version doesn't match the ChromeDriver version.

**Solution:**
```bash
npm install chromedriver@latest
```

### Error: Cannot find Chrome binary
**Problem:** Chrome browser is not installed or not in PATH.

**Solution:**
- Install Chrome browser
- Or specify Chrome path:
```javascript
options.setChromeBinaryPath('/path/to/chrome');
```

### Error: Connection refused to localhost:5173
**Problem:** Your app is not running.

**Solution:**
```bash
# Start your app first
cd ../../..  # Go to project root
npm run dev  # Start the dev server
```

### Tests are too fast/slow
**Problem:** Tests run too quickly or slowly.

**Solution:** Adjust sleep times in test files:
```javascript
await driver.sleep(2000); // Increase or decrease milliseconds
```

### Screenshots not saving
**Problem:** Screenshots directory doesn't exist.

**Solution:** The test runner creates it automatically, but you can manually create it:
```bash
mkdir screenshots
```

---

## 📁 File Structure

```
client/tests/selenium/
├── package.json              # Dependencies and scripts
├── test-runner.js            # Main test runner (runs all tests)
├── README.md                 # This file
├── screenshots/              # Screenshots from tests
│   ├── 01-homepage.png
│   ├── 02-products.png
│   ├── 03-navigation.png
│   └── 04-contact.png
└── tests/
    ├── 01-homepage.test.js   # Test 1: Homepage
    ├── 02-products.test.js   # Test 2: Products
    ├── 03-navigation.test.js # Test 3: Navigation
    └── 04-contact.test.js    # Test 4: Contact
```

---

## 🔍 What Each Test Does

### Test 1: Homepage Test
```javascript
// Opens homepage
await driver.get('http://localhost:5173');

// Checks title
const title = await driver.getTitle();

// Finds logo
const logo = await driver.findElement(By.css('img'));

// Takes screenshot
await driver.takeScreenshot();
```

### Test 2: Products Test
```javascript
// Opens products page
await driver.get('http://localhost:5173/products');

// Finds product cards
const products = await driver.findElements(By.css('.product'));

// Checks for categories in page
const pageSource = await driver.getPageSource();
if (pageSource.includes('Timber')) { ... }
```

### Test 3: Navigation Test
```javascript
// Finds navigation links
const navLinks = await driver.findElements(By.css('nav a'));

// Clicks each link
const link = await driver.findElement(By.linkText('Products'));
await link.click();

// Checks URL changed
const currentUrl = await driver.getCurrentUrl();
```

### Test 4: Contact Form Test
```javascript
// Finds and fills form fields
const nameInput = await driver.findElement(By.css('input[type="text"]'));
await nameInput.sendKeys('Test User');

const emailInput = await driver.findElement(By.css('input[type="email"]'));
await emailInput.sendKeys('test@example.com');

const textarea = await driver.findElement(By.css('textarea'));
await textarea.sendKeys('Test message');
```

---

## 📚 Learn More

- [Selenium WebDriver Documentation](https://www.selenium.dev/documentation/webdriver/)
- [Selenium WebDriver for Node.js](https://www.npmjs.com/package/selenium-webdriver)
- [ChromeDriver](https://chromedriver.chromium.org/)

---

## ✅ Checklist Before Running

- [ ] Node.js installed
- [ ] Chrome browser installed
- [ ] Dependencies installed (`npm install`)
- [ ] Your app is running on `http://localhost:5173`
- [ ] No other tests are running

---

## 🎯 Quick Start

```bash
# 1. Navigate to selenium directory
cd client/tests/selenium

# 2. Install dependencies
npm install

# 3. Make sure your app is running on localhost:5173

# 4. Run all tests
npm test
```

---

**Created**: October 27, 2025
**Version**: 1.0.0


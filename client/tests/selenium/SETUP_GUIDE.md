# Selenium Tests - Quick Setup Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install Dependencies
```bash
cd client/tests/selenium
npm install
```

### Step 2: Make Sure App is Running
Open a new terminal and start your app:
```bash
# From project root
cd client
npm run dev
```

Your app should be running on `http://localhost:5173`

### Step 3: Run Tests
```bash
# Run all 4 tests
npm test
```

---

## ✅ That's It!

The tests will:
1. Open Chrome browser (you'll see it)
2. Test your homepage
3. Test products page
4. Test navigation
5. Test contact form
6. Save screenshots to `screenshots/` folder
7. Show you results in the terminal

---

## 📸 View Results

After running tests, check:
- **Terminal output** - See pass/fail status
- **screenshots/ folder** - See visual proof of tests

---

## 🔧 Common Issues

### Issue 1: "Cannot find module 'selenium-webdriver'"
**Solution:** Run `npm install` in the selenium directory

### Issue 2: "Connection refused to localhost:5173"
**Solution:** Make sure your app is running with `npm run dev`

### Issue 3: "ChromeDriver version mismatch"
**Solution:** Run `npm install chromedriver@latest`

---

## 🎯 What You'll See

When tests run, you'll see Chrome browser open and:
1. ✅ Homepage loads
2. ✅ Products page loads
3. ✅ Navigation clicks different links
4. ✅ Contact form gets filled

Then browser closes and you see:
```
📊 TEST SUMMARY
Total Tests: 4
✅ Passed: 4
❌ Failed: 0
🎉 ALL TESTS PASSED! 🎉
```

---

## 📚 Next Steps

- **Run individual tests:** `npm run test:homepage`
- **Enable headless mode:** Uncomment headless option in test files
- **Customize tests:** Edit files in `tests/` folder
- **Add more tests:** Copy a test file and modify it

---

## 💡 Tips

- Tests run faster in headless mode (browser window doesn't open)
- Screenshots are saved automatically (check `screenshots/` folder)
- You can run tests as many times as you want
- Tests don't modify your database - they just read pages

---

**Need Help?** Check the main README.md for detailed documentation!


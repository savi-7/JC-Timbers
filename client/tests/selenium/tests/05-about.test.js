const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

(async function aboutPageTest() {
	const screenshotsDir = path.join(__dirname, '..', 'screenshots');
	if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

	const options = new chrome.Options();
	// options.addArguments('--headless=new');
	options.addArguments('--start-maximized');

	let driver;
	try {
		driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
		console.log('==================================================');
		console.log('🧪 TEST 5: About Page Test');
		console.log('==================================================');

		await driver.get('http://localhost:5173/about');
		await driver.sleep(1500);

		const title = await driver.getTitle();
		console.log('✓ Page Title:', JSON.stringify(title));

		// Check some common elements exist
		const body = await driver.findElement(By.css('body'));
		if (body) console.log('✓ Body found');

		// Look for heading that might include About
		const pageSource = await driver.getPageSource();
		if (pageSource.toLowerCase().includes('about')) {
			console.log('✓ "About" text found');
		}

		const screenshot = await driver.takeScreenshot();
		fs.writeFileSync(path.join(screenshotsDir, '05-about.png'), screenshot, 'base64');
		console.log('✓ Screenshot saved: screenshots/05-about.png');

		console.log('✅ TEST 5 PASSED: About page loaded successfully!');
	} catch (err) {
		console.error('❌ TEST 5 FAILED:', err.message);
		if (driver) {
			try {
				const screenshot = await driver.takeScreenshot();
				fs.writeFileSync(path.join(screenshotsDir, '05-about-error.png'), screenshot, 'base64');
				console.log('📸 Error screenshot saved: screenshots/05-about-error.png');
			} catch {}
		}
		process.exitCode = 1;
	} finally {
		if (driver) await driver.quit();
	}
})();




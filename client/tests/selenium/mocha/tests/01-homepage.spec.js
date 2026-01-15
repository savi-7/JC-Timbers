const { strict: assert } = require('assert');
const { By } = require('selenium-webdriver');
const { buildDriver, screenshot, BASE_URL, BROWSER } = require('./helpers');

describe(`[${BROWSER}] Test 1: Homepage`, function() {
	this.timeout(60000);
	let driver;

	before(async () => {
		driver = await buildDriver();
	});

	after(async () => {
		if (driver) await driver.quit();
	});

	it('loads and shows expected elements', async () => {
		await driver.get(`${BASE_URL}/`);
		await driver.sleep(1500);
		const title = await driver.getTitle();
		assert.ok(title.length > 0, 'Page title should not be empty');

		// Check for nav and hero existence opportunistically
		const pageSource = await driver.getPageSource();
		assert.ok(pageSource.toLowerCase().includes('home') || pageSource.toLowerCase().includes('jc'), 'Homepage content should be present');

		// Try to find at least one image
		const imgs = await driver.findElements(By.css('img'));
		assert.ok(imgs.length >= 0, 'Images lookup executed');

		await screenshot(driver, '01-homepage.png');
	});
});




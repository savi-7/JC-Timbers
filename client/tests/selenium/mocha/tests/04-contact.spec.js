const { strict: assert } = require('assert');
const { By } = require('selenium-webdriver');
const { buildDriver, screenshot, BASE_URL, BROWSER } = require('./helpers');

describe(`[${BROWSER}] Test 4: Contact`, function() {
	this.timeout(60000);
	let driver;

	before(async () => { driver = await buildDriver(); });
	after(async () => { if (driver) await driver.quit(); });

	it('loads contact page and attempts to locate form elements', async () => {
		await driver.get(`${BASE_URL}/contact`);
		await driver.sleep(1500);
		const src = await driver.getPageSource();
		assert.ok(src.toLowerCase().includes('contact') || src.toLowerCase().includes('email'), 'Contact markers should appear');

		// Attempt to find fields if present
		const inputs = await driver.findElements(By.css('input'));
		if (inputs.length) await inputs[0].sendKeys('Test User');
		const textareas = await driver.findElements(By.css('textarea'));
		if (textareas.length) await textareas[0].sendKeys('Testing contact form');
		await screenshot(driver, '04-contact.png');
	});
});




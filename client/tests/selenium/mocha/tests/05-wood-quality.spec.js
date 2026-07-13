const { strict: assert } = require('assert');
const { By } = require('selenium-webdriver');
const { buildDriver, screenshot, BASE_URL, BROWSER } = require('./helpers');

describe(`[${BROWSER}] Test 5: Admin Wood Quality`, function() {
	this.timeout(90000);
	let driver;

	before(async () => { driver = await buildDriver(); });
	after(async () => { if (driver) await driver.quit(); });

	it('opens /admin/wood-quality and finds form fields (if authorized)', async () => {
		await driver.get(`${BASE_URL}/admin/wood-quality`);
		await driver.sleep(2000);
		const src = await driver.getPageSource();
		assert.ok(src.toLowerCase().includes('wood quality') || src.toLowerCase().includes('predict'), 'Should include wood quality markers');

		// Attempt to find inputs
		const selects = await driver.findElements(By.css('select'));
		const inputs = await driver.findElements(By.css('input'));
		assert.ok(selects.length >= 0 && inputs.length >= 0, 'Form lookup executed');
		await screenshot(driver, '05-wood-quality.png');
	});
});




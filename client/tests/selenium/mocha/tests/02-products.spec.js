const { strict: assert } = require('assert');
const { By } = require('selenium-webdriver');
const { buildDriver, screenshot, BASE_URL, BROWSER } = require('./helpers');

describe(`[${BROWSER}] Test 2: Products`, function() {
	this.timeout(60000);
	let driver;

	before(async () => { driver = await buildDriver(); });
	after(async () => { if (driver) await driver.quit(); });

	it('opens products page and finds category markers', async () => {
		await driver.get(`${BASE_URL}/timber-products`);
		await driver.sleep(1500);
		const src = await driver.getPageSource();
		assert.ok(src.toLowerCase().includes('timber') || src.toLowerCase().includes('products'), 'Should include product markers');

		const navLinks = await driver.findElements(By.css('a'));
		assert.ok(navLinks.length > 0, 'Some links should be present');
		await screenshot(driver, '02-products.png');
	});
});




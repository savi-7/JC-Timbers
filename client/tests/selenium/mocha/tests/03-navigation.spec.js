const { strict: assert } = require('assert');
const { By, until } = require('selenium-webdriver');
const { buildDriver, screenshot, BASE_URL, BROWSER } = require('./helpers');

describe(`[${BROWSER}] Test 3: Navigation`, function() {
	this.timeout(60000);
	let driver;

	before(async () => { driver = await buildDriver(); });
	after(async () => { if (driver) await driver.quit(); });

	it('navigates through key pages', async () => {
		await driver.get(`${BASE_URL}/`);
		await driver.sleep(1000);

		// Try common links
		const tryClick = async (text, path) => {
			const links = await driver.findElements(By.linkText(text));
			if (links.length) {
				await links[0].click();
				await driver.wait(until.urlContains(path), 5000);
			}
		};

		await tryClick('Timber', '/timber-products');
		await tryClick('About', '/about');
		await tryClick('Contact', '/contact');

		const url = await driver.getCurrentUrl();
		assert.ok(url.startsWith(BASE_URL), 'URL should remain on the same origin');
		await screenshot(driver, '03-navigation.png');
	});
});




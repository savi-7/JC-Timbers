const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const edge = require('selenium-webdriver/edge');
const fs = require('fs');
const path = require('path');

const BROWSER = (process.env.BROWSER || 'chrome').toLowerCase();
const BASE_URL = process.env.APP_URL || 'http://localhost:5173';

function ensureDir(p) {
	if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

async function buildDriver() {
	let builder = new Builder();
	if (BROWSER === 'firefox') {
		builder = builder.forBrowser('firefox').setFirefoxOptions(new firefox.Options());
	} else if (BROWSER === 'edge') {
		builder = builder.forBrowser('MicrosoftEdge').setEdgeOptions(new edge.Options());
	} else {
		const options = new chrome.Options();
		// options.addArguments('--headless=new');
		options.addArguments('--start-maximized');
		builder = builder.forBrowser('chrome').setChromeOptions(options);
	}
	return builder.build();
}

async function screenshot(driver, name) {
	try {
		const dir = path.join(__dirname, '..', 'screenshots');
		ensureDir(dir);
		const data = await driver.takeScreenshot();
		fs.writeFileSync(path.join(dir, name), data, 'base64');
	} catch {}
}

module.exports = { buildDriver, screenshot, BASE_URL, BROWSER };




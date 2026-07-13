import { Builder, logging } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import chromedriver from 'chromedriver';

export async function buildDriver() {
  const options = new chrome.Options();
  if (!process.env.HEADED) {
    options.addArguments('--headless=new');
  }
  options.addArguments('--window-size=1366,768', '--disable-dev-shm-usage', '--no-sandbox');

  const service = new chrome.ServiceBuilder(chromedriver.path);

  const prefs = new logging.Preferences();
  prefs.setLevel(logging.Type.BROWSER, logging.Level.ALL);

  return new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .setChromeService(service)
    .setLoggingPrefs(prefs)
    .build();
}


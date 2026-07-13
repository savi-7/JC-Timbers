import { By, until } from 'selenium-webdriver';
import assert from 'assert';
import { buildDriver } from '../helpers/browser.js';
import { API_BASE_URL, BASE_URL, createTestUser } from '../config.js';

const user = createTestUser();
let sampleProductId = null;

describe('JC Timbers - Selenium smoke suite', function () {
  this.timeout(90000);
  let driver;
  let loggedIn = false;

  before(async () => {
    driver = await buildDriver();
    await driver.manage().setTimeouts({ implicit: 2000 });
    sampleProductId = await fetchSampleProductId();
    if (!sampleProductId) {
      throw new Error('No products available via API. Seed at least one product before running Selenium tests.');
    }
  });

  after(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  async function waitAndType(selector, value) {
    const el = await driver.wait(until.elementLocated(selector), 15000);
    await driver.wait(until.elementIsVisible(el), 5000);
    await el.clear();
    await el.sendKeys(value);
    return el;
  }

  async function ensureLoggedIn() {
    if (loggedIn) return;
    await loginUser();
  }

  async function loginUser() {
    await driver.get(`${BASE_URL}/login`);
    await waitAndType(By.css('input[name="email"]'), user.email);
    await waitAndType(By.css('input[name="password"]'), user.password);
    const submit = await driver.findElement(By.css('button[type="submit"]'));
    await submit.click();
    await driver.wait(until.urlContains('/customer-home'), 20000);
    loggedIn = true;
  }

  it('registers a new customer', async () => {
    await driver.get(`${BASE_URL}/register`);
    await waitAndType(By.css('input[name="firstName"]'), user.firstName);
    await waitAndType(By.css('input[name="lastName"]'), user.lastName);
    await waitAndType(By.css('input[name="email"]'), user.email);
    await waitAndType(By.css('input[name="phone"]'), user.phone);
    await waitAndType(By.css('input[name="password"]'), user.password);
    await waitAndType(By.css('input[name="confirmPassword"]'), user.password);
    const checkbox = await driver.findElement(By.css('input[name="agreeToTerms"]'));
    await driver.executeScript('arguments[0].scrollIntoView({block:"center"});', checkbox);
    if (!(await checkbox.isSelected())) {
      await checkbox.click();
    }
    const submit = await driver.findElement(By.css('button[type="submit"]'));
    await submit.click();
    await driver.wait(until.urlContains('/login'), 20000);
  });

  it('logs in with the registered account', async () => {
    await loginUser();
    const currentUrl = await driver.getCurrentUrl();
    assert.ok(currentUrl.includes('/customer-home'), 'Should land on customer home');
  });

  it('adds a product to the cart', async () => {
    await ensureLoggedIn();
    await driver.get(`${BASE_URL}/product/${sampleProductId}`);
    await driver.sleep(2000);
    const addToCartBtn = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(., 'Add to Cart')]")),
      20000
    );
    await driver.executeScript('arguments[0].scrollIntoView({block:"center"});', addToCartBtn);
    await driver.wait(until.elementIsVisible(addToCartBtn), 5000);
    await addToCartBtn.click();
    await driver.sleep(2000);
    await driver.get(`${BASE_URL}/cart`);
    const selectAll = await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(),'Select All')]")),
      20000
    );
    assert.ok(selectAll, 'Cart should display items and selection controls');
    const removeButtons = await driver.findElements(By.xpath("//button[contains(., 'Remove')]"));
    for (const btn of removeButtons) {
      const label = (await btn.getText()).trim().toLowerCase();
      if (label === 'remove') {
        await btn.click();
        await driver.sleep(1000);
        break;
      }
    }
  });

  it('adds a product to the wishlist', async () => {
    await ensureLoggedIn();
    await driver.get(`${BASE_URL}/product/${sampleProductId}`);
    await driver.sleep(2000);
    const wishlistBtn = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(., 'Add to Wishlist')]")),
      20000
    );
    await driver.executeScript('arguments[0].scrollIntoView({block:"center"});', wishlistBtn);
    await driver.wait(until.elementIsVisible(wishlistBtn), 5000);
    await wishlistBtn.click();
    await driver.sleep(2000);
    await driver.get(`${BASE_URL}/wishlist`);
    const header = await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(),'My Wishlist')]")),
      20000
    );
    assert.ok(header, 'Wishlist header should be visible');
    const removeButtons = await driver.findElements(By.xpath("//button[contains(., 'Remove')]"));
    assert.ok(removeButtons.length > 0, 'Wishlist should contain at least one item');
    await removeButtons[0].click();
    await driver.sleep(1000);
  });

  async function fetchSampleProductId() {
    try {
      const res = await fetch(`${API_BASE_URL}/products?limit=1`);
      if (!res.ok) return null;
      const data = await res.json();
      return data?.products?.[0]?._id || null;
    } catch (error) {
      console.error('Failed to fetch product for Selenium tests:', error);
      return null;
    }
  }
});


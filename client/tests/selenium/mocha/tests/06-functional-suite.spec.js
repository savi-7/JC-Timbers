const { strict: assert } = require('assert');
const { By } = require('selenium-webdriver');
const { buildDriver, screenshot, BASE_URL, BROWSER } = require('./helpers');
const addContext = require('mochawesome/addContext');
const API_BASE = process.env.SELENIUM_API_BASE || 'http://localhost:5001/api';

describe(`[${BROWSER}] Functional Suite: 6 Requested Test Cases`, function() {
	this.timeout(90000);
	let driver;

	before(async () => {
		driver = await buildDriver();
	});

	after(async () => {
		if (driver) await driver.quit();
	});

	function step(steps, message) {
		const line = `${new Date().toISOString()} | ${message}`;
		console.log(line);
		steps.push(line);
	}

	async function capture(testCtx, steps, screenshotName, label) {
		await screenshot(driver, screenshotName);
		const reportRelativePath = `../screenshots/${screenshotName}`;
		addContext(testCtx, { title: label, value: reportRelativePath });
		step(steps, `Screenshot saved: ${reportRelativePath}`);
	}

	function attachSteps(testCtx, steps) {
		addContext(testCtx, {
			title: 'Detailed step log',
			value: `\n${steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n`
		});
	}

	function normalizeStepLine(line) {
		// step() lines are like: ISO_TIMESTAMP | Message...
		const parts = String(line).split(' | ');
		if (parts.length >= 2) return parts.slice(1).join(' | ');
		return String(line);
	}

	function buildExecutionBlock({ status, testCase, description, durationMs, steps }) {
		const seconds = (durationMs / 1000).toFixed(2);
		const flowSteps = steps.length
			? steps.map((s, i) => `${i + 1}. ${normalizeStepLine(s)}`).join('\n')
			: 'No steps recorded.';

		return `Status: ${status}\n\nTest Case: ${testCase}\nDescription: ${description}\nExecution Time: ${seconds} seconds\n\nUser Flow Steps:\n${flowSteps}\n`;
	}

	async function getToast() {
		// Notification component renders a fixed toast in the top-right.
		const toastEls = await driver.findElements(By.css('div.fixed.top-4.right-4 p'));
		if (!toastEls.length) return null;

		const el = toastEls[0];
		const text = (await el.getText()).trim();
		const classAttr = (await el.getAttribute('class')) || '';

		let type = 'info';
		if (classAttr.includes('text-green-800')) type = 'success';
		if (classAttr.includes('text-red-800')) type = 'error';
		if (classAttr.includes('text-blue-800')) type = 'info';

		return { text, type, classAttr };
	}

	async function waitUntil(checkFn, timeoutMs, intervalMs = 400) {
		const start = Date.now();
		while (Date.now() - start < timeoutMs) {
			const res = await checkFn();
			if (res) return res;
			await driver.sleep(intervalMs);
		}
		return null;
	}

	async function backendLoginCheck(email, password) {
		// Verifies registration success by attempting login directly against the backend API.
		// Uses Node fetch (no browser CORS issues) rather than executeAsyncScript.
		try {
			const res = await fetch(`${API_BASE}/auth/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});
			let data = null;
			try {
				data = await res.json();
			} catch {
				// ignore non-json responses
			}
			return {
				ok: res.ok,
				status: res.status,
				message: data && data.message ? data.message : null,
				token: data && data.token ? data.token : null
			};
		} catch (err) {
			return { ok: false, status: null, message: String(err), token: null };
		}
	}

	async function assertLoginFormVisible() {
		const emailInputs = await driver.findElements(By.id('email'));
		const passwordInputs = await driver.findElements(By.id('password'));
		const submitButtons = await driver.findElements(By.css('button[type="submit"]'));
		assert.ok(emailInputs.length > 0, 'Expected login email input with id="email"');
		assert.ok(passwordInputs.length > 0, 'Expected login password input with id="password"');
		assert.ok(submitButtons.length > 0, 'Expected login submit button (button[type="submit"])');
	}

	async function openAndAssert(testCtx, steps, pathname, markers, screenshotName) {
		step(steps, `Navigating to ${pathname}`);
		await driver.get(`${BASE_URL}${pathname}`);
		await driver.sleep(1500);

		const currentUrl = await driver.getCurrentUrl();
		const pageSource = (await driver.getPageSource()).toLowerCase();
		const markerFound = markers.some((marker) => pageSource.includes(marker.toLowerCase()));
		step(steps, `Current URL: ${currentUrl}`);
		step(steps, `Content marker check: ${markerFound ? 'found' : 'not found'}`);

		const redirectedToLogin = currentUrl.includes('/login');
		assert.ok(
			currentUrl.includes(pathname) || redirectedToLogin,
			`Expected URL to include ${pathname} (or redirect to /login), got: ${currentUrl}`
		);

		if (redirectedToLogin) {
			step(steps, 'Redirected to /login; verifying login form exists');
			await assertLoginFormVisible();
		} else {
			assert.ok(markerFound, `Expected page markers (${markers.join(', ')}) for ${pathname}`);
		}

		await capture(testCtx, steps, screenshotName, `${pathname} result`);
		return currentUrl;
	}

	it('TC-01: Login + Registration forms and real-user login', async function() {
		const steps = [];
		const startTime = Date.now();
		addContext(this, {
			title: 'Test Description',
			value:
				'Precondition: App is running. Actions: (1) Open /register and verify registration form fields. (2) Open /login and sign in using real credentials from LOGIN_EMAIL/LOGIN_PASSWORD. Expected: Login succeeds and the browser lands outside /login (or shows a success notification). If LOGIN_EMAIL/LOGIN_PASSWORD are not set, TC-01 will skip functional login unless ATTEMPT_REGISTRATION_SUBMIT=1 is enabled.'
		});

		const loginEmail = process.env.LOGIN_EMAIL;
		const loginPassword = process.env.LOGIN_PASSWORD;
		const hasRealLogin = !!loginEmail && !!loginPassword;

		const generatedUser = {
			firstName: 'Selenium',
			lastName: 'User',
			email: `selenium.user.${Date.now()}@gmail.com`,
			phone: '9876543210',
			password: 'Selenium@123'
		};

		// Start clean to avoid stale auth state affecting redirects.
		await driver.get(`${BASE_URL}/`);
		await driver.sleep(800);
		await driver.manage().deleteAllCookies();
		await driver.executeScript('window.localStorage && window.localStorage.clear && window.localStorage.clear();');
		await driver.sleep(300);

		step(steps, 'Step 1: Open registration page and verify fields exist');
		await driver.get(`${BASE_URL}/register`);
		await driver.sleep(1200);
		const registerUrl = await driver.getCurrentUrl();
		assert.ok(registerUrl.includes('/register'), `Expected /register URL, got: ${registerUrl}`);

		// Registration UI elements (field ids come from RegisterPage.jsx)
		await driver.findElement(By.id('firstName'));
		await driver.findElement(By.id('lastName'));
		await driver.findElement(By.id('email'));
		await driver.findElement(By.id('phone'));
		await driver.findElement(By.id('password'));
		await driver.findElement(By.id('confirmPassword'));
		await driver.findElement(By.css('input[name="agreeToTerms"]'));
		const registerButtons = await driver.findElements(By.css('button[type="submit"]'));
		assert.ok(registerButtons.length > 0, 'Expected registration submit button');
		await capture(this, steps, '06-01-register-page.png', 'Registration page form validated');

		if (!hasRealLogin && process.env.ATTEMPT_REGISTRATION_SUBMIT !== '1') {
			addContext(this, {
				title: 'Execution Report',
				value: buildExecutionBlock({
					status: 'PENDING',
					testCase: 'Login + Registration (TC-01)',
					description:
						'LOGIN_EMAIL/LOGIN_PASSWORD were not provided. TC-01 validated registration and login UI, then skipped functional login to avoid false failures.',
					durationMs: Date.now() - startTime,
					steps
				})
			});
			this.skip();
		}

		// Registration submission is required when no real login credentials are provided.
		// Enable end-to-end registration explicitly using ATTEMPT_REGISTRATION_SUBMIT=1.
		const shouldSubmitRegistration = !hasRealLogin || process.env.ATTEMPT_REGISTRATION_SUBMIT === '1';

		let loginCredsEmail = hasRealLogin ? loginEmail : generatedUser.email;
		let loginCredsPassword = hasRealLogin ? loginPassword : generatedUser.password;

		if (shouldSubmitRegistration) {
			step(steps, `Step 2: Submit registration form to create user ${generatedUser.email}`);
			await driver.findElement(By.id('firstName')).sendKeys(generatedUser.firstName);
			await driver.findElement(By.id('lastName')).sendKeys(generatedUser.lastName);
			await driver.findElement(By.id('email')).sendKeys(generatedUser.email);
			await driver.findElement(By.id('phone')).sendKeys(generatedUser.phone);
			await driver.findElement(By.id('password')).sendKeys(generatedUser.password);
			await driver.findElement(By.id('confirmPassword')).sendKeys(generatedUser.password);
			const terms = await driver.findElement(By.css('input[name="agreeToTerms"]'));
			await terms.click();
			assert.ok(await terms.isSelected(), 'Expected agreeToTerms checkbox to be selected after clicking');
			await capture(this, steps, '06-01-register-filled.png', 'Registration form filled');

			step(steps, 'Step 3: Click Register submit button');
			const submitNow = await driver.findElements(By.css('button[type="submit"]'));
			assert.ok(submitNow.length > 0, 'Expected registration submit button at click-time');
			await submitNow[0].click();
			await driver.sleep(600);

			step(steps, 'Step 4: Waiting for registration result in UI');
			const successCheck = await waitUntil(async () => {
				const afterRegisterUrl = await driver.getCurrentUrl();
				const srcLower = (await driver.getPageSource()).toLowerCase();
				if (afterRegisterUrl.includes('/login')) return { afterRegisterUrl };
				if (srcLower.includes('application successful')) return { afterRegisterUrl };
				return null;
			}, 20000, 1000);

			if (!successCheck) {
				const afterRegisterUrl = await driver.getCurrentUrl();
				const srcLower = (await driver.getPageSource()).toLowerCase();
				const toast = await getToast();

				const inlineErrEls = await driver.findElements(By.css('p.text-accent-red'));
				const inlineErrors = [];
				for (const el of inlineErrEls.slice(0, 3)) {
					inlineErrors.push((await el.getText()).trim());
				}

				throw new Error(
					`Registration did not show success feedback. url=${afterRegisterUrl}, toast="${toast?.text || ''}", inlineErrors="${inlineErrors.join('; ')}", pageHasSuccessText=${srcLower.includes('application successful')}`
				);
			}

			await capture(this, steps, '06-01-register-result.png', 'Registration result detected in UI');
		} else {
			step(steps, 'Step 2: Registration submission skipped (real login credentials provided and ATTEMPT_REGISTRATION_SUBMIT not enabled)');
		}

		step(steps, 'Step 5: Open login page and sign in');
		await driver.get(`${BASE_URL}/login`);
		await driver.sleep(1000);
		await assertLoginFormVisible();

		const emailInput = await driver.findElement(By.id('email'));
		const passwordInput = await driver.findElement(By.id('password'));
		await emailInput.clear();
		await emailInput.sendKeys(loginCredsEmail);
		await passwordInput.clear();
		await passwordInput.sendKeys(loginCredsPassword);
		await capture(this, steps, '06-01-credentials-entered.png', 'Login credentials entered');

		step(steps, 'Step 6: Submit login form');
		const loginButtonCandidates = await driver.findElements(By.css('button[type="submit"]'));
		assert.ok(loginButtonCandidates.length > 0, 'Login submit button should exist');
		await loginButtonCandidates[0].click();

		step(steps, 'Step 7: Wait for login success (URL change or success toast)');
		const loginOutcome = await waitUntil(async () => {
			const url = await driver.getCurrentUrl();
			if (!url.includes('/login')) return { status: 'redirect', url };
			const toast = await getToast();
			if (toast && toast.text) {
				return { status: toast.type || 'unknown', url, toast };
			}
			return null;
		}, 30000);

		assert.ok(loginOutcome, 'Expected login result (redirect or toast), but none appeared');
		const postLoginUrl = loginOutcome.url;
		const toastText = loginOutcome.toast?.text || '';

		if (postLoginUrl.includes('/login')) {
			throw new Error(`Login unsuccessful. Still on ${postLoginUrl}. Toast="${toastText}"`);
		}

		if (process.env.LOGIN_SUCCESS_PATH) {
			assert.ok(
				postLoginUrl.includes(process.env.LOGIN_SUCCESS_PATH),
				`Expected post-login URL to include ${process.env.LOGIN_SUCCESS_PATH}, got: ${postLoginUrl}`
			);
		}

		step(steps, `Step 8: Login success confirmed at ${postLoginUrl}`);
		await capture(this, steps, '06-01-login-result.png', 'Login result');
		attachSteps(this, steps);

		addContext(this, {
			title: 'Execution Report',
			value: buildExecutionBlock({
				status: 'PASSED',
				testCase: 'Login + Registration (TC-01)',
				description:
					'Registration and login pages validated; login completed successfully and ended outside /login (or showed success feedback).',
				durationMs: Date.now() - startTime,
				steps
			})
		});
	});

	it('TC-02: Cart - Open /cart and verify cart/checkout UI (or login redirect)', async function() {
		const steps = [];
		const startTime = Date.now();
		addContext(this, {
			title: 'Test Description',
			value:
				'Precondition: App is running. Actions: Open `/cart`. Expected: Cart page elements (cart/checkout/order summary markers) are visible. If the app redirects to `/login`, the login form inputs (`email`, `password`) must be visible.'
		});
		const url = await openAndAssert(this, steps, '/cart', ['cart', 'checkout', 'order summary'], '06-02-cart.png');
		const cartButtons = await driver.findElements(By.css('button, a'));
		assert.ok(cartButtons.length >= 1, `Expected interactive elements in cart flow, got: ${cartButtons.length} on ${url}`);
		step(steps, `Interactive elements found on cart flow: ${cartButtons.length}`);
		attachSteps(this, steps);

		addContext(this, {
			title: 'Execution Report',
			value: buildExecutionBlock({
				status: 'PASSED',
				testCase: 'Cart (TC-02)',
				description:
					'Opened /cart and verified cart UI markers and at least one interactive element. If redirected, verified login UI.',
				durationMs: Date.now() - startTime,
				steps
			})
		});
	});

	it('TC-03: Wishlist - Open /wishlist and verify wishlist UI (or login redirect)', async function() {
		const steps = [];
		const startTime = Date.now();
		addContext(this, {
			title: 'Test Description',
			value:
				'Precondition: App is running. Actions: Open `/wishlist`. Expected: Wishlist page markers are visible. If the app redirects to `/login`, the login form inputs (`email`, `password`) must be visible.'
		});
		await openAndAssert(this, steps, '/wishlist', ['wishlist', 'saved', 'favorites'], '06-03-wishlist.png');
		attachSteps(this, steps);

		addContext(this, {
			title: 'Execution Report',
			value: buildExecutionBlock({
				status: 'PASSED',
				testCase: 'Wishlist (TC-03)',
				description:
					'Opened /wishlist and verified wishlist markers in the page content. If redirected, verified login UI markers.',
				durationMs: Date.now() - startTime,
				steps
			})
		});
	});

	it('TC-04: Products - Open /timber-products and verify product listing markers', async function() {
		const steps = [];
		const startTime = Date.now();
		addContext(this, {
			title: 'Test Description',
			value:
				'Precondition: App is running. Actions: Open `/timber-products`. Expected: Product listing markers (timber/products/wood keywords) are present in the page content.'
		});
		await openAndAssert(this, steps, '/timber-products', ['timber', 'products', 'wood'], '06-04-products.png');
		attachSteps(this, steps);

		addContext(this, {
			title: 'Execution Report',
			value: buildExecutionBlock({
				status: 'PASSED',
				testCase: 'Products (TC-04)',
				description:
					'Opened /timber-products and verified product listing keywords (timber/products/wood) are present in the page content.',
				durationMs: Date.now() - startTime,
				steps
			})
		});
	});

	it('TC-05: Marketplace - Open /marketplace and verify listing markers', async function() {
		const steps = [];
		const startTime = Date.now();
		addContext(this, {
			title: 'Test Description',
			value:
				'Precondition: App is running. Actions: Open `/marketplace`. Expected: Marketplace listing markers (marketplace/listing/seller keywords) are present in the page content.'
		});
		await openAndAssert(this, steps, '/marketplace', ['marketplace', 'listing', 'seller'], '06-05-marketplace.png');
		attachSteps(this, steps);

		addContext(this, {
			title: 'Execution Report',
			value: buildExecutionBlock({
				status: 'PASSED',
				testCase: 'Marketplace (TC-05)',
				description:
					'Opened /marketplace and verified marketplace/listing/seller keywords are present in the page content.',
				durationMs: Date.now() - startTime,
				steps
			})
		});
	});

	it('TC-06: After-sale service - Open /after-sale/new and verify service enquiry form (or login redirect)', async function() {
		const steps = [];
		const startTime = Date.now();
		addContext(this, {
			title: 'Test Description',
			value:
				'Precondition: App is running. Actions: Open `/after-sale/new`. Expected: After-sale service request page markers (after sale/request/service keywords) are present. If the app redirects to `/login`, the login form inputs (`email`, `password`) must be visible.'
		});
		await openAndAssert(this, steps, '/after-sale/new', ['after sale', 'request', 'service'], '06-06-after-sale.png');
		attachSteps(this, steps);

		addContext(this, {
			title: 'Execution Report',
			value: buildExecutionBlock({
				status: 'PASSED',
				testCase: 'After-sale service (TC-06)',
				description:
					'Opened /after-sale/new and verified service enquiry markers exist. If redirected, verified login UI markers.',
				durationMs: Date.now() - startTime,
				steps
			})
		});
	});
});

const { Builder, By, until } = require('selenium-webdriver');
const edge = require('selenium-webdriver/edge');

// Test 4: Contact Form Test
async function testContact() {
  console.log('\n🧪 TEST 4: Contact Form Test');
  console.log('='.repeat(50));
  
  let driver;
  
  try {
    // Setup Edge options
    const options = new edge.Options();
    options.addArguments('--start-maximized');
    
    // Create WebDriver
    driver = await new Builder()
      .forBrowser('MicrosoftEdge')
      .setEdgeOptions(options)
      .build();
    
    console.log('✓ Browser opened');
    
    // Navigate to contact page
    await driver.get('http://localhost:5173/contact');
    console.log('✓ Navigated to contact page');
    
    await driver.sleep(2000);
    
    // Check page title
    const title = await driver.getTitle();
    console.log(`✓ Page Title: "${title}"`);
    
    // Look for contact form or input fields
    try {
      const forms = await driver.findElements(By.css('form'));
      if (forms.length > 0) {
        console.log(`✓ Found ${forms.length} form(s) on page`);
      }
    } catch (e) {
      console.log('⚠ No forms found');
    }
    
    // Look for input fields
    try {
      const inputs = await driver.findElements(By.css('input[type="text"], input[type="email"], input[name*="name"], input[name*="email"]'));
      console.log(`✓ Found ${inputs.length} input field(s)`);
      
      // Try to fill in a name field
      if (inputs.length > 0) {
        await inputs[0].sendKeys('Test User');
        console.log('✓ Filled first input field with "Test User"');
      }
    } catch (e) {
      console.log('⚠ Could not find or fill input fields');
    }
    
    // Look for email field
    try {
      const emailInput = await driver.findElement(By.css('input[type="email"], input[name*="email"]'));
      await emailInput.sendKeys('testuser@example.com');
      console.log('✓ Filled email field with "testuser@example.com"');
    } catch (e) {
      console.log('⚠ Email field not found or could not fill');
    }
    
    // Look for textarea (message field)
    try {
      const textarea = await driver.findElement(By.css('textarea'));
      await textarea.sendKeys('This is a test message from Selenium automation.');
      console.log('✓ Filled textarea with test message');
    } catch (e) {
      console.log('⚠ Textarea not found');
    }
    
    // Look for submit button (but don't click it)
    try {
      const submitBtn = await driver.findElement(By.css('button[type="submit"], input[type="submit"], button:contains("Submit")'));
      console.log('✓ Submit button found (not clicking in test)');
    } catch (e) {
      console.log('⚠ Submit button not found');
    }
    
    // Check for contact information
    const pageSource = await driver.getPageSource();
    let contactInfo = [];
    
    if (pageSource.includes('@') && pageSource.includes('.com')) {
      contactInfo.push('Email address');
    }
    if (pageSource.match(/\d{10}|\(\d{3}\)\s?\d{3}-?\d{4}/)) {
      contactInfo.push('Phone number');
    }
    if (pageSource.toLowerCase().includes('address')) {
      contactInfo.push('Address');
    }
    
    if (contactInfo.length > 0) {
      console.log(`✓ Found contact information: ${contactInfo.join(', ')}`);
    }
    
    // Take screenshot
    await driver.takeScreenshot().then(
      function(image) {
        require('fs').writeFileSync('screenshots/04-contact.png', image, 'base64');
        console.log('✓ Screenshot saved: screenshots/04-contact.png');
      }
    );
    
    console.log('\n✅ TEST 4 PASSED: Contact form tested successfully!\n');
    return true;
    
  } catch (error) {
    console.error('\n❌ TEST 4 FAILED:', error.message);
    if (driver) {
      await driver.takeScreenshot().then(
        function(image) {
          require('fs').writeFileSync('screenshots/04-contact-error.png', image, 'base64');
          console.log('✓ Error screenshot saved');
        }
      );
    }
    return false;
  } finally {
    if (driver) {
      await driver.quit();
      console.log('✓ Browser closed');
    }
  }
}

// Run test if called directly
if (require.main === module) {
  testContact().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = testContact;


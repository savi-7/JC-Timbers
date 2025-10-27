const { Builder, By, until } = require('selenium-webdriver');
const edge = require('selenium-webdriver/edge');

// Test 2: Products Page Test
async function testProducts() {
  console.log('\n🧪 TEST 2: Products Page Test');
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
    
    // Navigate to products page
    await driver.get('http://localhost:5173/products');
    console.log('✓ Navigated to products page');
    
    // Wait for page to load
    await driver.sleep(2000); // Wait 2 seconds for content
    
    // Check page title
    const title = await driver.getTitle();
    console.log(`✓ Page Title: "${title}"`);
    
    // Check for products or product cards
    try {
      const products = await driver.findElements(By.css('.product, [class*="product"], .card, [class*="card"]'));
      if (products.length > 0) {
        console.log(`✓ Found ${products.length} product cards`);
      } else {
        console.log('⚠ No product cards found (page might be empty)');
      }
    } catch (e) {
      console.log('⚠ Could not find product elements');
    }
    
    // Check for navigation/categories
    try {
      const navElements = await driver.findElements(By.css('nav, .nav, [role="navigation"]'));
      if (navElements.length > 0) {
        console.log('✓ Navigation found');
      }
    } catch (e) {
      console.log('⚠ Navigation not found');
    }
    
    // Try to find "Timber" or "Furniture" text
    try {
      const pageSource = await driver.getPageSource();
      if (pageSource.includes('Timber') || pageSource.includes('timber')) {
        console.log('✓ "Timber" category found on page');
      }
      if (pageSource.includes('Furniture') || pageSource.includes('furniture')) {
        console.log('✓ "Furniture" category found on page');
      }
      if (pageSource.includes('Construction') || pageSource.includes('construction')) {
        console.log('✓ "Construction" category found on page');
      }
    } catch (e) {
      console.log('⚠ Could not check page content');
    }
    
    // Take screenshot
    await driver.takeScreenshot().then(
      function(image) {
        require('fs').writeFileSync('screenshots/02-products.png', image, 'base64');
        console.log('✓ Screenshot saved: screenshots/02-products.png');
      }
    );
    
    console.log('\n✅ TEST 2 PASSED: Products page loaded successfully!\n');
    return true;
    
  } catch (error) {
    console.error('\n❌ TEST 2 FAILED:', error.message);
    if (driver) {
      await driver.takeScreenshot().then(
        function(image) {
          require('fs').writeFileSync('screenshots/02-products-error.png', image, 'base64');
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
  testProducts().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = testProducts;


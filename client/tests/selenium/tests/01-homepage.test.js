const { Builder, By, until } = require('selenium-webdriver');
const edge = require('selenium-webdriver/edge');

// Test 1: Homepage Test
async function testHomepage() {
  console.log('\n🧪 TEST 1: Homepage Test');
  console.log('='.repeat(50));
  
  let driver;
  
  try {
    // Setup Edge options
    const options = new edge.Options();
    options.addArguments('--start-maximized');
    // Uncomment for headless mode
    // options.addArguments('--headless');
    
    // Create WebDriver
    driver = await new Builder()
      .forBrowser('MicrosoftEdge')
      .setEdgeOptions(options)
      .build();
    
    console.log('✓ Browser opened');
    
    // Navigate to homepage
    await driver.get('http://localhost:5173');
    console.log('✓ Navigated to homepage');
    
    // Wait for page to load
    await driver.wait(until.titleContains('JC'), 10000);
    console.log('✓ Page title loaded');
    
    // Check page title
    const title = await driver.getTitle();
    console.log(`✓ Page Title: "${title}"`);
    
    // Check if logo exists
    try {
      const logo = await driver.findElement(By.css('img, svg, .logo, [alt*="logo" i]'));
      console.log('✓ Logo found on page');
    } catch (e) {
      console.log('⚠ Logo not found (might be text-based)');
    }
    
    // Check if main content exists
    const mainContent = await driver.findElement(By.css('main, .main, #root'));
    console.log('✓ Main content found');
    
    // Take screenshot
    await driver.takeScreenshot().then(
      function(image) {
        require('fs').writeFileSync('screenshots/01-homepage.png', image, 'base64');
        console.log('✓ Screenshot saved: screenshots/01-homepage.png');
      }
    );
    
    console.log('\n✅ TEST 1 PASSED: Homepage loaded successfully!\n');
    return true;
    
  } catch (error) {
    console.error('\n❌ TEST 1 FAILED:', error.message);
    if (driver) {
      await driver.takeScreenshot().then(
        function(image) {
          require('fs').writeFileSync('screenshots/01-homepage-error.png', image, 'base64');
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
  testHomepage().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = testHomepage;


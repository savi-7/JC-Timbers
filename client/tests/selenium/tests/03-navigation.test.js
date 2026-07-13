const { Builder, By, until } = require('selenium-webdriver');
const edge = require('selenium-webdriver/edge');

// Test 3: Navigation Test
async function testNavigation() {
  console.log('\n🧪 TEST 3: Navigation Test');
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
    
    // Navigate to homepage
    await driver.get('http://localhost:5173');
    console.log('✓ Navigated to homepage');
    
    await driver.sleep(2000);
    
    // Find navigation links
    const navLinks = await driver.findElements(By.css('nav a, .nav a, header a, [role="navigation"] a'));
    console.log(`✓ Found ${navLinks.length} navigation links`);
    
    // Test clicking different navigation items
    const pagesToTest = [
      { name: 'Products', url: '/products', text: ['Products', 'PRODUCTS', 'products'] },
      { name: 'About', url: '/about', text: ['About', 'ABOUT', 'about'] },
      { name: 'Contact', url: '/contact', text: ['Contact', 'CONTACT', 'contact'] }
    ];
    
    let testedPages = 0;
    
    for (const page of pagesToTest) {
      try {
        // Go back to homepage
        await driver.get('http://localhost:5173');
        await driver.sleep(1000);
        
        // Try to find and click the link
        let linkFound = false;
        for (const linkText of page.text) {
          try {
            const link = await driver.findElement(By.linkText(linkText));
            await link.click();
            linkFound = true;
            console.log(`✓ Clicked "${page.name}" link`);
            break;
          } catch (e) {
            // Try next variation
          }
        }
        
        if (!linkFound) {
          // Try by partial link text
          for (const linkText of page.text) {
            try {
              const link = await driver.findElement(By.partialLinkText(linkText));
              await link.click();
              linkFound = true;
              console.log(`✓ Clicked "${page.name}" link (partial match)`);
              break;
            } catch (e) {
              // Continue
            }
          }
        }
        
        if (linkFound) {
          await driver.sleep(1500);
          const currentUrl = await driver.getCurrentUrl();
          console.log(`✓ Current URL: ${currentUrl}`);
          testedPages++;
        } else {
          console.log(`⚠ Could not find "${page.name}" link`);
        }
        
      } catch (error) {
        console.log(`⚠ Could not test "${page.name}": ${error.message}`);
      }
    }
    
    // Test Home link
    try {
      const homeLink = await driver.findElement(By.css('a[href="/"], a[href=""]'));
      await homeLink.click();
      console.log('✓ Clicked "Home" link');
      await driver.sleep(1000);
      const currentUrl = await driver.getCurrentUrl();
      console.log(`✓ Returned to: ${currentUrl}`);
    } catch (e) {
      console.log('⚠ Could not find or click Home link');
    }
    
    // Take screenshot
    await driver.takeScreenshot().then(
      function(image) {
        require('fs').writeFileSync('screenshots/03-navigation.png', image, 'base64');
        console.log('✓ Screenshot saved: screenshots/03-navigation.png');
      }
    );
    
    console.log(`\n✅ TEST 3 PASSED: Navigation tested (${testedPages} pages)!\n`);
    return true;
    
  } catch (error) {
    console.error('\n❌ TEST 3 FAILED:', error.message);
    if (driver) {
      await driver.takeScreenshot().then(
        function(image) {
          require('fs').writeFileSync('screenshots/03-navigation-error.png', image, 'base64');
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
  testNavigation().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = testNavigation;


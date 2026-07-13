// Test Runner - Runs all 4 Selenium tests
const fs = require('fs');
const path = require('path');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
  console.log('✓ Created screenshots directory');
}

// Import all tests
const test1Homepage = require('./tests/01-homepage.test');
const test2Products = require('./tests/02-products.test');
const test3Navigation = require('./tests/03-navigation.test');
const test4Contact = require('./tests/04-contact.test');

// Main test runner
async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 JC-TIMBERS SELENIUM TEST SUITE');
  console.log('='.repeat(60));
  console.log(`📅 Test Run: ${new Date().toLocaleString()}`);
  console.log('='.repeat(60));
  
  const results = {
    total: 4,
    passed: 0,
    failed: 0,
    tests: []
  };
  
  const startTime = Date.now();
  
  // Run Test 1: Homepage
  try {
    const result = await test1Homepage();
    results.tests.push({ name: 'Test 1: Homepage', passed: result });
    if (result) results.passed++;
    else results.failed++;
  } catch (error) {
    console.error('Test 1 crashed:', error.message);
    results.tests.push({ name: 'Test 1: Homepage', passed: false });
    results.failed++;
  }
  
  // Run Test 2: Products
  try {
    const result = await test2Products();
    results.tests.push({ name: 'Test 2: Products', passed: result });
    if (result) results.passed++;
    else results.failed++;
  } catch (error) {
    console.error('Test 2 crashed:', error.message);
    results.tests.push({ name: 'Test 2: Products', passed: false });
    results.failed++;
  }
  
  // Run Test 3: Navigation
  try {
    const result = await test3Navigation();
    results.tests.push({ name: 'Test 3: Navigation', passed: result });
    if (result) results.passed++;
    else results.failed++;
  } catch (error) {
    console.error('Test 3 crashed:', error.message);
    results.tests.push({ name: 'Test 3: Navigation', passed: false });
    results.failed++;
  }
  
  // Run Test 4: Contact
  try {
    const result = await test4Contact();
    results.tests.push({ name: 'Test 4: Contact', passed: result });
    if (result) results.passed++;
    else results.failed++;
  } catch (error) {
    console.error('Test 4 crashed:', error.message);
    results.tests.push({ name: 'Test 4: Contact', passed: false });
    results.failed++;
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⏱️  Duration: ${duration}s`);
  console.log('='.repeat(60));
  
  // Print individual results
  console.log('\n📋 INDIVIDUAL TEST RESULTS:');
  results.tests.forEach((test, index) => {
    const status = test.passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`  ${index + 1}. ${test.name}: ${status}`);
  });
  
  console.log('\n' + '='.repeat(60));
  
  if (results.failed === 0) {
    console.log('🎉 ALL TESTS PASSED! 🎉');
  } else {
    console.log(`⚠️  ${results.failed} TEST(S) FAILED`);
  }
  
  console.log('='.repeat(60) + '\n');
  
  // Exit with appropriate code
  process.exit(results.failed === 0 ? 0 : 1);
}

// Run all tests
runAllTests().catch(error => {
  console.error('\n💥 Test runner crashed:', error);
  process.exit(1);
});


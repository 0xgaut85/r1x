/**
 * Check PayAI Facilitator URL and connectivity
 * Run: node check-facilitator.js
 */

const facilitatorUrl = process.env.FACILITATOR_URL || 'https://facilitator.payai.network';

console.log('🔍 Checking PayAI Facilitator Configuration\n');
console.log(`Facilitator URL: ${facilitatorUrl}`);
console.log(`Expected (official): https://facilitator.payai.network`);
console.log(`Match: ${facilitatorUrl === 'https://facilitator.payai.network' ? '✅' : '❌'}\n`);

// Test connectivity
async function testConnectivity() {
  console.log('🌐 Testing connectivity...\n');
  
  const endpoints = [
    '/supported',
    '/list',
  ];
  
  for (const endpoint of endpoints) {
    const url = `${facilitatorUrl}${endpoint}`;
    console.log(`Testing: ${url}`);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const startTime = Date.now();
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      const duration = Date.now() - startTime;
      const status = response.status;
      const ok = response.ok;
      
      console.log(`  Status: ${status} ${ok ? '✅' : '❌'}`);
      console.log(`  Duration: ${duration}ms`);
      
      if (ok) {
        try {
          const data = await response.json();
          console.log(`  Response: ${JSON.stringify(data).substring(0, 100)}...`);
        } catch (e) {
          const text = await response.text();
          console.log(`  Response (text): ${text.substring(0, 100)}...`);
        }
      } else {
        const text = await response.text();
        console.log(`  Error: ${text.substring(0, 200)}`);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log(`  ❌ TIMEOUT (>10s)`);
      } else {
        console.log(`  ❌ ERROR: ${error.message}`);
        if (error.cause) {
          console.log(`  Cause: ${error.cause.message || JSON.stringify(error.cause)}`);
        }
      }
    }
    
    console.log('');
  }
}

testConnectivity().catch(console.error);


const fs = require('fs');
const { Resend } = require('resend');

// Load env vars manually
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

async function testKeys() {
  console.log('Testing API Keys...');

  // 1. Test Serper API
  console.log('\n--- Testing Serper API ---');
  try {
    const serperKey = env.SERPER_API_KEY;
    if (!serperKey) throw new Error('SERPER_API_KEY not found in .env.local');
    
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': serperKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ q: 'test query', num: 1 })
    });
    
    if (response.ok) {
      console.log('✅ Serper API Key is VALID.');
    } else {
      console.log('❌ Serper API Key FAILED with status:', response.status);
      console.log(await response.text());
    }
  } catch (err) {
    console.error('Error testing Serper:', err.message);
  }

  // 2. Test Resend API
  console.log('\n--- Testing Resend API ---');
  try {
    const resendKey = env.RESEND_API_KEY;
    if (!resendKey) throw new Error('RESEND_API_KEY not found in .env.local');
    
    const resend = new Resend(resendKey);
    const domains = await resend.domains.list();
    if (domains.error) {
       console.log('❌ Resend API Key FAILED:', domains.error);
    } else {
       console.log('✅ Resend API Key is VALID. Connected successfully.');
    }
  } catch (err) {
    console.error('Error testing Resend:', err.message);
  }
}

testKeys();

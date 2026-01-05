#!/usr/bin/env node

// Fast demo script that mocks network requests
// This is for the GIF demo - shows laggy working visually

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Mock endpoints - we'll use localhost or just simulate
const endpoints = [
  { name: '/api/users', expected: 50 },
  { name: '/api/posts', expected: 45 },
  { name: '/api/comments', expected: 55 },
];

async function makeRequest(name, expectedMs) {
  const start = Date.now();
  
  try {
    // Use a fast endpoint or just measure the chaos delay
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    // This will be intercepted by laggy if running with it
    const res = await fetch('https://httpbin.org/status/200', {
      signal: controller.signal,
    });
    
    clearTimeout(timeout);
    const elapsed = Date.now() - start;
    return { success: true, status: res.status, elapsed };
  } catch (err) {
    const elapsed = Date.now() - start;
    const isChaos = err.message.includes('[laggy chaos]') || 
                    err.message.includes('simulated') ||
                    err.message.includes('timed out');
    return { 
      success: false, 
      error: isChaos ? 'CHAOS' : err.message.slice(0, 30),
      elapsed 
    };
  }
}

async function demo() {
  console.log('\n  Making API requests...\n');
  
  for (const { name } of endpoints) {
    process.stdout.write(`  GET ${name} `);
    const result = await makeRequest(name);
    
    if (result.success) {
      console.log(`-> ${result.status} OK (${result.elapsed}ms)`);
    } else {
      console.log(`-> FAILED (${result.elapsed}ms)`);
      if (result.error !== 'CHAOS') {
        console.log(`     ${result.error}`);
      }
    }
    await sleep(200);
  }
  
  console.log('\n  Done!\n');
}

demo();

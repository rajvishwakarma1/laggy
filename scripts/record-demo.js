#!/usr/bin/env node

// Demo script that shows laggy in action with different presets
// Usage: node scripts/record-demo.js
//
// To record a GIF:
// 1. Install asciinema: brew install asciinema (mac) or apt install asciinema (linux)
// 2. Record: asciinema rec demo.cast
// 3. Run this script
// 4. Stop recording: Ctrl+D
// 5. Convert to GIF: agg demo.cast demo.gif

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const cliPath = resolve(__dirname, '..', 'bin', 'laggy.js');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runCommand(title, args) {
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`📍 ${title}`);
  console.log(`${'─'.repeat(50)}\n`);
  console.log(`$ laggy ${args.join(' ')} node scripts/demo.js\n`);
  
  return new Promise((resolve) => {
    const child = spawn('node', [cliPath, ...args, 'node', 'scripts/demo.js'], {
      stdio: 'inherit',
      cwd: dirname(__dirname),
    });
    
    child.on('close', () => {
      resolve();
    });
  });
}

async function main() {
  console.clear();
  console.log('\n🧪 laggy demo - Network Chaos Simulator\n');
  
  await sleep(1000);
  
  // Normal (no chaos)
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`📍 Normal network (no laggy)`);
  console.log(`${'─'.repeat(50)}\n`);
  console.log(`$ node scripts/demo.js\n`);
  
  await new Promise((resolve) => {
    const child = spawn('node', ['scripts/demo.js'], {
      stdio: 'inherit',
      cwd: dirname(__dirname),
    });
    child.on('close', resolve);
  });
  
  await sleep(1500);
  
  // Slow 3G
  await runCommand('Slow 3G preset (400ms latency)', ['--preset', 'slow-3g', '--verbose']);
  
  await sleep(1500);
  
  // Flaky network
  await runCommand('Flaky network (30% failure rate)', ['--preset', 'flaky', '--verbose']);
  
  await sleep(1500);
  
  // Offline
  await runCommand('Offline (100% failure)', ['--preset', 'offline']);
  
  console.log(`\n${'─'.repeat(50)}`);
  console.log('✅ Demo complete!');
  console.log(`${'─'.repeat(50)}\n`);
}

main();

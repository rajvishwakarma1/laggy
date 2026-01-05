#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';
import { parseArgs } from './cli.js';
import { getPreset, listPresets } from './presets.js';
import { mergeConfig, configToEnv, type LaggyConfig } from './config.js';
import * as logger from './logger.js';

const VERSION = '1.0.0';

function printHelp(): void {
  console.log(`
laggy - Simulate bad networks. Break your app before users do.

USAGE:
  laggy [options] <command>

EXAMPLES:
  laggy npm test
  laggy --preset slow-3g npm test
  laggy --latency 500 --fail-rate 0.2 vitest
  laggy --preset chaos playwright test

OPTIONS:
  --preset <name>       Use a network preset
  --latency <ms>        Base latency in milliseconds (default: 0)
  --jitter <ms>         Random latency variance +/- (default: 0)
  --fail-rate <0-1>     Percentage of requests that fail (default: 0)
  --fail-codes <codes>  Comma-separated failure status codes (default: 500,502,503)
  --timeout-rate <0-1>  Percentage of requests that timeout (default: 0)
  --timeout-ms <ms>     Timeout duration in ms (default: 30000)
  --include <pattern>   Only affect URLs matching pattern (can use *)
  --exclude <pattern>   Skip URLs matching pattern (can use *)
  --seed <number>       Seed for reproducible randomness
  --verbose             Log every intercepted request
  --silent              Suppress laggy output
  --list-presets        Show all available presets
  --help                Show this help message
  --version             Show version number

PRESETS:
  5g          Fast 5G connection
  4g          Standard 4G/LTE
  fast-3g     Fast 3G connection
  slow-3g     Slow 3G connection
  edge        EDGE/2G network
  wifi        Home WiFi
  wifi-poor   Coffee shop WiFi
  offline     No network connection
  flaky       Unreliable connection
  chaos       Maximum chaos for stress testing
  lie-fi      Connected but barely usable
`);
}

function printPresets(): void {
  console.log('\nAvailable presets:\n');
  for (const preset of listPresets()) {
    const cfg = preset.config;
    const parts = [];
    if (cfg.latency) parts.push(`latency: ${cfg.latency}ms`);
    if (cfg.jitter) parts.push(`jitter: ${cfg.jitter}ms`);
    if (cfg.failRate) parts.push(`fail: ${(cfg.failRate * 100).toFixed(0)}%`);
    if (cfg.timeoutRate) parts.push(`timeout: ${(cfg.timeoutRate * 100).toFixed(0)}%`);
    
    console.log(`  ${preset.name.padEnd(12)} ${preset.description}`);
    if (parts.length > 0) {
      console.log(`               ${parts.join(', ')}`);
    }
  }
  console.log('');
}

export function run(): void {
  const args = process.argv.slice(2);
  
  // handle meta flags - only if they're the first argument
  const firstArg = args[0];
  if (!firstArg || firstArg === '--help' || firstArg === '-h') {
    printHelp();
    process.exit(0);
  }
  
  if (firstArg === '--version' || firstArg === '-v') {
    console.log(VERSION);
    process.exit(0);
  }
  
  if (firstArg === '--list-presets') {
    printPresets();
    process.exit(0);
  }
  
  // parse arguments
  const parsed = parseArgs(args);
  
  if (parsed.command.length === 0) {
    logger.error('No command specified. Run `laggy --help` for usage.');
    process.exit(1);
  }
  
  // build config
  let config: Partial<LaggyConfig> = {};
  
  // apply preset first
  if (parsed.preset) {
    const preset = getPreset(parsed.preset);
    if (!preset) {
      logger.error(`Unknown preset: ${parsed.preset}`);
      logger.info('Run `laggy --list-presets` to see available presets.');
      process.exit(1);
    }
    config = { ...preset.config };
  }
  
  // apply explicit options (override preset)
  if (parsed.latency !== undefined) config.latency = parsed.latency;
  if (parsed.jitter !== undefined) config.jitter = parsed.jitter;
  if (parsed.failRate !== undefined) config.failRate = parsed.failRate;
  if (parsed.failCodes !== undefined) config.failCodes = parsed.failCodes;
  if (parsed.timeoutRate !== undefined) config.timeoutRate = parsed.timeoutRate;
  if (parsed.timeoutMs !== undefined) config.timeoutMs = parsed.timeoutMs;
  if (parsed.include !== undefined) config.include = parsed.include;
  if (parsed.exclude !== undefined) config.exclude = parsed.exclude;
  if (parsed.seed !== undefined) config.seed = parsed.seed;
  if (parsed.verbose !== undefined) config.verbose = parsed.verbose;
  if (parsed.silent !== undefined) config.silent = parsed.silent;
  
  const finalConfig = mergeConfig(config);
  
  // configure logger
  logger.configure({ silent: finalConfig.silent, verbose: finalConfig.verbose });
  
  // find the hook file - use file:// URL for cross-platform compatibility
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const hookPath = resolve(__dirname, 'hook.js');
  const hookUrl = pathToFileURL(hookPath).href;
  
  // log what we're doing
  if (parsed.preset) {
    logger.info(`Using preset: ${parsed.preset}`);
  }
  if (finalConfig.latency > 0 || finalConfig.jitter > 0) {
    logger.info(`Latency: ${finalConfig.latency}ms (±${finalConfig.jitter}ms)`);
  }
  if (finalConfig.failRate > 0) {
    logger.info(`Failure rate: ${(finalConfig.failRate * 100).toFixed(0)}%`);
  }
  if (finalConfig.timeoutRate > 0) {
    logger.info(`Timeout rate: ${(finalConfig.timeoutRate * 100).toFixed(0)}%`);
  }
  
  logger.info(`Running: ${parsed.command.join(' ')}`);
  
  // spawn the command with our hook
  const child = spawn(parsed.command[0], parsed.command.slice(1), {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      LAGGY_CONFIG: configToEnv(finalConfig),
      NODE_OPTIONS: `--import ${hookUrl} ${process.env.NODE_OPTIONS || ''}`.trim(),
    },
  });
  
  child.on('close', (code) => {
    process.exit(code || 0);
  });
  
  child.on('error', (err) => {
    logger.error(`Failed to start command: ${err.message}`);
    process.exit(1);
  });
}

run();

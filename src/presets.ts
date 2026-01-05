import type { LaggyConfig } from './config.js';

export interface Preset {
  name: string;
  description: string;
  config: Partial<LaggyConfig>;
}

// based on real-world network conditions
// sources: chrome devtools throttling, webpagetest, various research
export const presets: Record<string, Preset> = {
  '5g': {
    name: '5g',
    description: 'Fast 5G connection',
    config: { latency: 10, jitter: 5 },
  },
  '4g': {
    name: '4g',
    description: 'Standard 4G/LTE',
    config: { latency: 50, jitter: 20 },
  },
  'fast-3g': {
    name: 'fast-3g',
    description: 'Fast 3G connection',
    config: { latency: 150, jitter: 50, failRate: 0.01 },
  },
  'slow-3g': {
    name: 'slow-3g',
    description: 'Slow 3G connection',
    config: { latency: 400, jitter: 100, failRate: 0.02, timeoutRate: 0.01 },
  },
  'edge': {
    name: 'edge',
    description: 'EDGE/2G network',
    config: { latency: 800, jitter: 200, failRate: 0.05, timeoutRate: 0.02 },
  },
  'wifi': {
    name: 'wifi',
    description: 'Home WiFi',
    config: { latency: 20, jitter: 10 },
  },
  'wifi-poor': {
    name: 'wifi-poor',
    description: 'Coffee shop WiFi',
    config: { latency: 100, jitter: 80, failRate: 0.03, timeoutRate: 0.01 },
  },
  'offline': {
    name: 'offline',
    description: 'No network connection',
    config: { failRate: 1.0, failCodes: [0] },
  },
  'flaky': {
    name: 'flaky',
    description: 'Unreliable connection with random failures',
    config: { latency: 200, jitter: 300, failRate: 0.3, timeoutRate: 0.1 },
  },
  'chaos': {
    name: 'chaos',
    description: 'Maximum chaos for stress testing',
    config: { latency: 500, jitter: 1500, failRate: 0.2, timeoutRate: 0.1 },
  },
  'lie-fi': {
    name: 'lie-fi',
    description: 'Connected but barely usable',
    config: { latency: 2000, jitter: 500, failRate: 0.1, timeoutRate: 0.3 },
  },
};

export function getPreset(name: string): Preset | undefined {
  return presets[name];
}

export function listPresets(): Preset[] {
  return Object.values(presets);
}

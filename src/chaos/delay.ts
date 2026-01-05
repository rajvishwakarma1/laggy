import { randomInt } from '../random.js';

export function calcDelay(latency: number, jitter: number): number {
  if (latency <= 0 && jitter <= 0) return 0;
  
  const base = Math.max(0, latency);
  const variance = jitter > 0 ? randomInt(-jitter, jitter) : 0;
  
  return Math.max(0, base + variance);
}

export function sleep(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

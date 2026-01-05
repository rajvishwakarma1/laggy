import { shouldTrigger } from '../random.js';

export interface TimeoutResult {
  shouldTimeout: boolean;
  timeoutMs: number;
}

export function checkTimeout(
  timeoutRate: number,
  timeoutMs: number
): TimeoutResult {
  if (!shouldTrigger(timeoutRate)) {
    return { shouldTimeout: false, timeoutMs: 0 };
  }

  return { shouldTimeout: true, timeoutMs };
}

// creates a promise that never resolves (simulates hanging request)
export function hang(): Promise<never> {
  return new Promise(() => {
    // intentionally never resolves
  });
}

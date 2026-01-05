import { describe, it, expect, beforeEach } from 'vitest';
import { setSeed, random, randomInt, shouldTrigger } from '../src/random';
import { calcDelay } from '../src/chaos/delay';
import { checkFailure } from '../src/chaos/fail';
import { checkTimeout } from '../src/chaos/timeout';

describe('random', () => {
  beforeEach(() => {
    setSeed(null); // reset to non-deterministic
  });

  it('random returns values between 0 and 1', () => {
    for (let i = 0; i < 100; i++) {
      const val = random();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it('randomInt returns values in range', () => {
    for (let i = 0; i < 100; i++) {
      const val = randomInt(5, 10);
      expect(val).toBeGreaterThanOrEqual(5);
      expect(val).toBeLessThanOrEqual(10);
    }
  });

  it('setSeed makes random deterministic', () => {
    setSeed(12345);
    const first = [random(), random(), random()];
    
    setSeed(12345);
    const second = [random(), random(), random()];
    
    expect(first).toEqual(second);
  });

  it('shouldTrigger returns false when rate is 0', () => {
    for (let i = 0; i < 100; i++) {
      expect(shouldTrigger(0)).toBe(false);
    }
  });

  it('shouldTrigger returns true when rate is 1', () => {
    for (let i = 0; i < 100; i++) {
      expect(shouldTrigger(1)).toBe(true);
    }
  });
});

describe('delay', () => {
  beforeEach(() => {
    setSeed(42);
  });

  it('calcDelay returns 0 when latency and jitter are 0', () => {
    expect(calcDelay(0, 0)).toBe(0);
  });

  it('calcDelay returns latency when jitter is 0', () => {
    expect(calcDelay(100, 0)).toBe(100);
  });

  it('calcDelay adds jitter variance', () => {
    const results = new Set<number>();
    
    for (let i = 0; i < 50; i++) {
      results.add(calcDelay(100, 50));
    }
    
    // should have some variance
    expect(results.size).toBeGreaterThan(1);
  });

  it('calcDelay never returns negative', () => {
    for (let i = 0; i < 100; i++) {
      const delay = calcDelay(10, 100); // jitter > latency
      expect(delay).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('failure', () => {
  beforeEach(() => {
    setSeed(42);
  });

  it('checkFailure returns no failure when rate is 0', () => {
    const result = checkFailure(0, [500]);
    expect(result.shouldFail).toBe(false);
  });

  it('checkFailure returns failure when rate is 1', () => {
    const result = checkFailure(1, [500]);
    expect(result.shouldFail).toBe(true);
    expect(result.statusCode).toBe(500);
  });

  it('checkFailure picks from provided codes', () => {
    const codes = new Set<number>();
    
    for (let i = 0; i < 100; i++) {
      const result = checkFailure(1, [500, 502, 503]);
      codes.add(result.statusCode);
    }
    
    // should use provided codes
    expect(codes.has(500) || codes.has(502) || codes.has(503)).toBe(true);
  });

  it('checkFailure with code 0 returns network error', () => {
    const result = checkFailure(1, [0]);
    
    expect(result.shouldFail).toBe(true);
    expect(result.statusCode).toBe(0);
    expect(result.message).toContain('Network error');
  });
});

describe('timeout', () => {
  it('checkTimeout returns no timeout when rate is 0', () => {
    const result = checkTimeout(0, 30000);
    expect(result.shouldTimeout).toBe(false);
  });

  it('checkTimeout returns timeout when rate is 1', () => {
    const result = checkTimeout(1, 5000);
    expect(result.shouldTimeout).toBe(true);
    expect(result.timeoutMs).toBe(5000);
  });
});

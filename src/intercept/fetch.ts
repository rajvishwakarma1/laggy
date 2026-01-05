import type { LaggyConfig } from '../config.js';
import { matchesUrl } from '../filter.js';
import { calcDelay, sleep } from '../chaos/delay.js';
import { checkFailure } from '../chaos/fail.js';
import { checkTimeout, hang } from '../chaos/timeout.js';
import * as logger from '../logger.js';

type FetchFn = typeof globalThis.fetch;

let originalFetch: FetchFn | null = null;

export function patchFetch(cfg: LaggyConfig): void {
  if (originalFetch) return; // already patched
  
  originalFetch = globalThis.fetch;
  
  globalThis.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const method = init?.method || 'GET';
    
    // check if this url should be affected
    if (!matchesUrl(url, cfg.include, cfg.exclude)) {
      logger.debug(`${method} ${url} → passthrough (excluded)`);
      return originalFetch!(input, init);
    }
    
    // check for timeout (request hangs forever)
    const timeout = checkTimeout(cfg.timeoutRate, cfg.timeoutMs);
    if (timeout.shouldTimeout) {
      logger.request(method, url, `timeout (hanging for ${timeout.timeoutMs}ms)`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout.timeoutMs);
      
      try {
        return await Promise.race([
          hang(),
          new Promise<Response>((_, reject) => {
            controller.signal.addEventListener('abort', () => {
              reject(new Error('Request timed out'));
            });
          }),
        ]);
      } finally {
        clearTimeout(timeoutId);
      }
    }
    
    // check for failure
    const failure = checkFailure(cfg.failRate, cfg.failCodes);
    if (failure.shouldFail) {
      // apply delay before failing
      const delayMs = calcDelay(cfg.latency, cfg.jitter);
      if (delayMs > 0) await sleep(delayMs);
      
      logger.request(method, url, `fail ${failure.statusCode}`);
      
      if (failure.statusCode === 0) {
        throw new TypeError('Failed to fetch');
      }
      
      return new Response(failure.message, {
        status: failure.statusCode,
        statusText: failure.message,
      });
    }
    
    // apply latency
    const delayMs = calcDelay(cfg.latency, cfg.jitter);
    if (delayMs > 0) {
      logger.request(method, url, `delay ${delayMs}ms`);
      await sleep(delayMs);
    } else {
      logger.debug(`${method} ${url} → passthrough`);
    }
    
    return originalFetch!(input, init);
  };
}

export function restoreFetch(): void {
  if (originalFetch) {
    globalThis.fetch = originalFetch;
    originalFetch = null;
  }
}

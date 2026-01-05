import type { LaggyConfig } from '../config.js';
import { matchesUrl } from '../filter.js';
import { calcDelay } from '../chaos/delay.js';
import { checkFailure } from '../chaos/fail.js';
import { checkTimeout } from '../chaos/timeout.js';
import * as logger from '../logger.js';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const http = require('node:http');
const https = require('node:https');

type RequestFn = typeof http.request;

let originalHttpRequest: RequestFn | null = null;
let originalHttpsRequest: RequestFn | null = null;

function createPatchedRequest(
  original: RequestFn,
  protocol: string,
  cfg: LaggyConfig
): RequestFn {
  return function patchedRequest(
    this: unknown,
    urlOrOptions: unknown,
    optionsOrCallback?: unknown,
    maybeCallback?: unknown
  ) {
    // figure out the url
    let url: string;
    let options: Record<string, unknown>;
    let callback: unknown;
    
    if (typeof urlOrOptions === 'string') {
      url = urlOrOptions;
      if (typeof optionsOrCallback === 'function') {
        callback = optionsOrCallback;
        options = {};
      } else {
        options = (optionsOrCallback as Record<string, unknown>) || {};
        callback = maybeCallback;
      }
    } else if (urlOrOptions instanceof URL) {
      url = urlOrOptions.href;
      if (typeof optionsOrCallback === 'function') {
        callback = optionsOrCallback;
        options = {};
      } else {
        options = (optionsOrCallback as Record<string, unknown>) || {};
        callback = maybeCallback;
      }
    } else {
      options = (urlOrOptions as Record<string, unknown>) || {};
      callback = optionsOrCallback;
      const host = (options.hostname || options.host || 'localhost') as string;
      const port = options.port ? `:${options.port}` : '';
      const path = (options.path || '/') as string;
      url = `${protocol}//${host}${port}${path}`;
    }
    
    const method = (options.method as string) || 'GET';
    
    // check if this url should be affected
    if (!matchesUrl(url, cfg.include, cfg.exclude)) {
      logger.debug(`${method} ${url} → passthrough (excluded)`);
      return original.call(this, urlOrOptions, optionsOrCallback, maybeCallback);
    }
    
    // check for timeout
    const timeout = checkTimeout(cfg.timeoutRate, cfg.timeoutMs);
    if (timeout.shouldTimeout) {
      logger.request(method, url, `timeout`);
      
      const req = original.call(this, urlOrOptions, optionsOrCallback, maybeCallback);
      req.setTimeout(timeout.timeoutMs, () => {
        req.destroy(new Error('Request timed out'));
      });
      return req;
    }
    
    // check for failure
    const failure = checkFailure(cfg.failRate, cfg.failCodes);
    if (failure.shouldFail) {
      logger.request(method, url, `fail ${failure.statusCode}`);
      
      const delayMs = calcDelay(cfg.latency, cfg.jitter);
      
      // create a fake request that will emit an error or fake response
      const req = original.call(this, urlOrOptions, optionsOrCallback, maybeCallback);
      
      setTimeout(() => {
        if (failure.statusCode === 0) {
          req.destroy(new Error('Network error'));
        } else {
          // we can't easily fake a response with http module
          // so we destroy with an error that includes the status
          req.destroy(new Error(`HTTP ${failure.statusCode}: ${failure.message}`));
        }
      }, delayMs);
      
      return req;
    }
    
    // apply latency
    const delayMs = calcDelay(cfg.latency, cfg.jitter);
    if (delayMs > 0) {
      logger.request(method, url, `delay ${delayMs}ms`);
      
      // delay the actual request
      const req = original.call(this, urlOrOptions, optionsOrCallback, maybeCallback);
      const originalWrite = req.write.bind(req);
      const originalEnd = req.end.bind(req);
      
      const writeQueue: Array<{ chunk: unknown; encoding: unknown; callback: unknown }> = [];
      let endArgs: unknown[] | null = null;
      
      req.write = (chunk: unknown, encoding?: unknown, cb?: unknown) => {
        writeQueue.push({ chunk, encoding, callback: cb });
        return true;
      };
      
      req.end = (...args: unknown[]) => {
        endArgs = args;
        return req;
      };
      
      setTimeout(() => {
        for (const { chunk, encoding, callback: cb } of writeQueue) {
          originalWrite(chunk, encoding, cb);
        }
        if (endArgs) {
          originalEnd(...endArgs);
        }
      }, delayMs);
      
      return req;
    }
    
    logger.debug(`${method} ${url} → passthrough`);
    return original.call(this, urlOrOptions, optionsOrCallback, maybeCallback);
  } as RequestFn;
}

export function patchHttp(cfg: LaggyConfig): void {
  if (originalHttpRequest) return; // already patched
  
  originalHttpRequest = http.request;
  originalHttpsRequest = https.request;
  
  http.request = createPatchedRequest(originalHttpRequest, 'http:', cfg);
  https.request = createPatchedRequest(originalHttpsRequest, 'https:', cfg);
}

export function restoreHttp(): void {
  if (originalHttpRequest) {
    http.request = originalHttpRequest;
    originalHttpRequest = null;
  }
  if (originalHttpsRequest) {
    https.request = originalHttpsRequest;
    originalHttpsRequest = null;
  }
}

// this file is loaded via --import or --require before the test command runs
// it reads config from env and patches network functions

import { parseConfigFromEnv } from './config.js';
import { setSeed } from './random.js';
import { patchFetch } from './intercept/fetch.js';
import { patchHttp } from './intercept/http.js';
import * as logger from './logger.js';

const cfg = parseConfigFromEnv();

// skip if no config (not running via laggy cli)
if (process.env.LAGGY_CONFIG) {
  // set up random seed if provided
  if (cfg.seed !== null) {
    setSeed(cfg.seed);
  }
  
  // configure logger
  logger.configure({ silent: cfg.silent, verbose: cfg.verbose });
  
  // patch network functions
  patchFetch(cfg);
  patchHttp(cfg);
  
  logger.debug('Network chaos enabled');
}

export {};

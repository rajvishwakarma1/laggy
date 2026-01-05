// public api for programmatic usage

export { type LaggyConfig, mergeConfig, defaultConfig } from './config.js';
export { presets, getPreset, listPresets, type Preset } from './presets.js';
export { patchFetch, restoreFetch } from './intercept/fetch.js';
export { patchHttp, restoreHttp } from './intercept/http.js';
export { setSeed } from './random.js';
export { configure as configureLogger } from './logger.js';

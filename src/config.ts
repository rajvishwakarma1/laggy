export interface LaggyConfig {
  latency: number;
  jitter: number;
  failRate: number;
  failCodes: number[];
  timeoutRate: number;
  timeoutMs: number;
  include: string[];
  exclude: string[];
  seed: number | null;
  verbose: boolean;
  silent: boolean;
}

export const defaultConfig: LaggyConfig = {
  latency: 0,
  jitter: 0,
  failRate: 0,
  failCodes: [500, 502, 503],
  timeoutRate: 0,
  timeoutMs: 30000,
  include: [],
  exclude: [],
  seed: null,
  verbose: false,
  silent: false,
};

export function mergeConfig(partial: Partial<LaggyConfig>): LaggyConfig {
  return { ...defaultConfig, ...partial };
}

export function parseConfigFromEnv(): LaggyConfig {
  const raw = process.env.LAGGY_CONFIG;
  if (!raw) return defaultConfig;
  
  try {
    const parsed = JSON.parse(raw);
    return mergeConfig(parsed);
  } catch {
    return defaultConfig;
  }
}

export function configToEnv(cfg: LaggyConfig): string {
  return JSON.stringify(cfg);
}

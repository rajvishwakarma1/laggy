const COLORS = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
} as const;

let silent = false;
let verbose = false;

export function configure(opts: { silent?: boolean; verbose?: boolean }): void {
  if (opts.silent !== undefined) silent = opts.silent;
  if (opts.verbose !== undefined) verbose = opts.verbose;
}

function prefix(): string {
  return `${COLORS.cyan}[laggy]${COLORS.reset}`;
}

export function info(msg: string): void {
  if (silent) return;
  console.log(`${prefix()} ${msg}`);
}

export function success(msg: string): void {
  if (silent) return;
  console.log(`${prefix()} ${COLORS.green}${msg}${COLORS.reset}`);
}

export function warn(msg: string): void {
  if (silent) return;
  console.log(`${prefix()} ${COLORS.yellow}${msg}${COLORS.reset}`);
}

export function error(msg: string): void {
  console.error(`${prefix()} ${COLORS.red}${msg}${COLORS.reset}`);
}

export function debug(msg: string): void {
  if (!verbose || silent) return;
  console.log(`${prefix()} ${COLORS.dim}${msg}${COLORS.reset}`);
}

export function request(method: string, url: string, action: string): void {
  if (!verbose || silent) return;
  const methodColor = method === 'GET' ? COLORS.green : COLORS.yellow;
  console.log(
    `${prefix()} ${methodColor}${method}${COLORS.reset} ${url} ${COLORS.dim}→ ${action}${COLORS.reset}`
  );
}

# laggy

Simulate bad networks. Break your app before users do.

```bash
npx laggy --preset slow-3g npm test
```

![laggy demo](scripts/demo.svg)

```
$ laggy --list-presets

Available presets:

  5g           Fast 5G connection
               latency: 10ms, jitter: 5ms
  4g           Standard 4G/LTE
               latency: 50ms, jitter: 20ms
  slow-3g      Slow 3G connection
               latency: 400ms, jitter: 100ms, fail: 2%, timeout: 1%
  flaky        Unreliable connection with random failures
               latency: 200ms, jitter: 300ms, fail: 30%, timeout: 10%
  chaos        Maximum chaos for stress testing
               latency: 500ms, jitter: 1500ms, fail: 20%, timeout: 10%
  ...and 6 more
```

## Why?

Your app works fine on localhost. But what about:
- A user on a train going through a tunnel?
- Someone on hotel wifi?
- A phone switching between 4G and 3G?

Most apps don't handle these cases well. `laggy` lets you test them.

## Install

```bash
npm install -D laggy
```

Or just use it directly:

```bash
npx laggy --preset flaky npm test
```

## Usage

Wrap any test command:

```bash
# Use a preset
laggy --preset slow-3g npm test
laggy --preset flaky vitest
laggy --preset offline jest

# Custom settings
laggy --latency 500 npm test
laggy --latency 200 --fail-rate 0.1 npm test
laggy --latency 100 --jitter 50 --timeout-rate 0.05 vitest
```

Works with any test runner: Vitest, Jest, Playwright, Cypress, or anything else.

## Presets

| Preset | Latency | Description |
|--------|---------|-------------|
| `5g` | 10ms | Fast 5G connection |
| `4g` | 50ms | Standard 4G/LTE |
| `fast-3g` | 150ms | Fast 3G connection |
| `slow-3g` | 400ms | Slow 3G connection |
| `edge` | 800ms | EDGE/2G network |
| `wifi` | 20ms | Home WiFi |
| `wifi-poor` | 100ms | Coffee shop WiFi |
| `offline` | - | No network (100% failure) |
| `flaky` | 200ms | Unreliable (30% failure) |
| `chaos` | 500ms | Maximum chaos for stress testing |
| `lie-fi` | 2000ms | Connected but barely usable |

```bash
laggy --list-presets  # See all presets with details
```

## Options

```
--preset <name>       Use a network preset
--latency <ms>        Base latency in milliseconds
--jitter <ms>         Random latency variance +/-
--fail-rate <0-1>     Percentage of requests that fail
--fail-codes <codes>  Comma-separated failure codes (default: 500,502,503)
--timeout-rate <0-1>  Percentage of requests that timeout
--timeout-ms <ms>     Timeout duration (default: 30000)
--include <pattern>   Only affect URLs matching pattern
--exclude <pattern>   Skip URLs matching pattern
--seed <number>       Reproducible randomness
--verbose             Log every intercepted request
--silent              Suppress laggy output
```

## Examples

### Test with slow network
```bash
laggy --preset slow-3g npm test
```

### Test with random failures
```bash
laggy --fail-rate 0.2 npm test  # 20% of requests fail
```

### Test specific endpoints
```bash
laggy --latency 500 --include "*api.example.com*" npm test
```

### Exclude certain URLs
```bash
laggy --preset flaky --exclude "*localhost*" npm test
```

### Reproducible chaos
```bash
laggy --preset chaos --seed 12345 npm test  # Same failures every run
```

### Debug what's happening
```bash
laggy --preset slow-3g --verbose npm test
```

## Programmatic API

```typescript
import { patchFetch, restoreFetch, mergeConfig } from 'laggy';

const config = mergeConfig({
  latency: 200,
  jitter: 50,
  failRate: 0.1,
});

patchFetch(config);

// your tests...

restoreFetch();
```

## How It Works

```
┌─────────────────────────────────────────────────────┐
│  npx laggy --preset slow-3g npm test                │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│  1. laggy CLI parses your options                   │
│  2. Sets LAGGY_CONFIG env variable                  │
│  3. Spawns your command with:                       │
│     NODE_OPTIONS="--import laggy/hook"              │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│  The hook runs before your tests:                   │
│  • Patches globalThis.fetch()                       │
│  • Patches Node's http.request / https.request      │
│  • Reads chaos config from environment              │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│  Every network request:                             │
│  1. Check URL against include/exclude patterns      │
│  2. Roll dice for timeout (hang request)            │
│  3. Roll dice for failure (return error)            │
│  4. Apply latency + jitter delay                    │
│  5. Pass through to real network                    │
└─────────────────────────────────────────────────────┘
```

**Key details:**
- Uses Node.js `--import` flag (requires Node 18+)
- Intercepts both `fetch()` and `http`/`https` modules
- Errors include `[laggy chaos]` prefix so you know they're simulated
- Seed option makes chaos reproducible across runs

No code changes to your app. Just wrap your test command.

## Roadmap

**v1.0** (current)
- Latency injection with jitter
- Random failures with configurable status codes
- Request timeouts
- URL filtering (include/exclude)
- 11 realistic network presets
- Seeded randomness for reproducibility

**v2.0** (planned)
- Bandwidth throttling
- DNS delay simulation
- Gradual degradation (network gets worse over time)
- Packet loss simulation
- Config file support (`.laggyrc`)
- Browser support (Playwright integration)

## Requirements

- Node.js 18+

## License

MIT

## Author

Raj Vishwakarma ([@rajvishwakarma1](https://github.com/rajvishwakarma1))

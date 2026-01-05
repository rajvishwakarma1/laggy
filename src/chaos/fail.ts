import { shouldTrigger, randomInt } from '../random.js';

export interface FailureResult {
  shouldFail: boolean;
  statusCode: number;
  message: string;
}

const CHAOS_PREFIX = '[laggy chaos]';

export function checkFailure(
  failRate: number,
  failCodes: number[]
): FailureResult {
  if (!shouldTrigger(failRate)) {
    return { shouldFail: false, statusCode: 0, message: '' };
  }

  // pick a random failure code
  const codes = failCodes.length > 0 ? failCodes : [500, 502, 503];
  const idx = randomInt(0, codes.length - 1);
  const statusCode = codes[idx];

  // code 0 means network error (offline)
  if (statusCode === 0) {
    return {
      shouldFail: true,
      statusCode: 0,
      message: `${CHAOS_PREFIX} Network error: simulated offline`,
    };
  }

  const messages: Record<number, string> = {
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
  };

  const baseMsg = messages[statusCode] || `HTTP Error ${statusCode}`;

  return {
    shouldFail: true,
    statusCode,
    message: `${CHAOS_PREFIX} ${baseMsg} (simulated failure)`,
  };
}

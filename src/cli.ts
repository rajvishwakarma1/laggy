export interface ParsedArgs {
  preset?: string;
  latency?: number;
  jitter?: number;
  failRate?: number;
  failCodes?: number[];
  timeoutRate?: number;
  timeoutMs?: number;
  include?: string[];
  exclude?: string[];
  seed?: number;
  verbose?: boolean;
  silent?: boolean;
  command: string[];
}

export function parseArgs(args: string[]): ParsedArgs {
  const result: ParsedArgs = {
    command: [],
  };
  
  let i = 0;
  
  while (i < args.length) {
    const arg = args[i];
    
    // once we hit a non-flag, everything after is the command
    if (!arg.startsWith('--')) {
      result.command = args.slice(i);
      break;
    }
    
    switch (arg) {
      case '--preset':
        result.preset = args[++i];
        break;
        
      case '--latency':
        result.latency = parseInt(args[++i], 10);
        break;
        
      case '--jitter':
        result.jitter = parseInt(args[++i], 10);
        break;
        
      case '--fail-rate':
        result.failRate = parseFloat(args[++i]);
        break;
        
      case '--fail-codes':
        result.failCodes = args[++i].split(',').map((s) => parseInt(s.trim(), 10));
        break;
        
      case '--timeout-rate':
        result.timeoutRate = parseFloat(args[++i]);
        break;
        
      case '--timeout-ms':
        result.timeoutMs = parseInt(args[++i], 10);
        break;
        
      case '--include':
        result.include = result.include || [];
        result.include.push(args[++i]);
        break;
        
      case '--exclude':
        result.exclude = result.exclude || [];
        result.exclude.push(args[++i]);
        break;
        
      case '--seed':
        result.seed = parseInt(args[++i], 10);
        break;
        
      case '--verbose':
        result.verbose = true;
        break;
        
      case '--silent':
        result.silent = true;
        break;
        
      default:
        // unknown flag, treat as start of command
        result.command = args.slice(i);
        return result;
    }
    
    i++;
  }
  
  return result;
}

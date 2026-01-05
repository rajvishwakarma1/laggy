// url pattern matching for --include and --exclude

function patternToRegex(pattern: string): RegExp {
  // escape regex special chars except *
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
  // convert * to .*
  const regexStr = escaped.replace(/\*/g, '.*');
  return new RegExp(`^${regexStr}$`, 'i');
}

export function matchesUrl(
  url: string,
  include: string[],
  exclude: string[]
): boolean {
  // if exclude patterns exist and url matches any, skip
  if (exclude.length > 0) {
    for (const pattern of exclude) {
      if (patternToRegex(pattern).test(url)) {
        return false;
      }
    }
  }

  // if no include patterns, match everything
  if (include.length === 0) {
    return true;
  }

  // if include patterns exist, url must match at least one
  for (const pattern of include) {
    if (patternToRegex(pattern).test(url)) {
      return true;
    }
  }

  return false;
}

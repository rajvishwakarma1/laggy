import { describe, it, expect } from 'vitest';
import { matchesUrl } from '../src/filter';

describe('filter', () => {
  describe('matchesUrl', () => {
    it('matches all urls when no patterns specified', () => {
      expect(matchesUrl('https://api.example.com/users', [], [])).toBe(true);
      expect(matchesUrl('http://localhost:3000/api', [], [])).toBe(true);
    });

    it('matches urls in include list', () => {
      const include = ['*api.example.com*'];
      
      expect(matchesUrl('https://api.example.com/users', include, [])).toBe(true);
      expect(matchesUrl('https://other.com/users', include, [])).toBe(false);
    });

    it('excludes urls in exclude list', () => {
      const exclude = ['*localhost*'];
      
      expect(matchesUrl('http://localhost:3000/api', [], exclude)).toBe(false);
      expect(matchesUrl('https://api.example.com/users', [], exclude)).toBe(true);
    });

    it('exclude takes priority over include', () => {
      const include = ['*example.com*'];
      const exclude = ['*api.example.com*'];
      
      expect(matchesUrl('https://api.example.com/users', include, exclude)).toBe(false);
      expect(matchesUrl('https://www.example.com/page', include, exclude)).toBe(true);
    });

    it('supports wildcard patterns', () => {
      const include = ['https://*.example.com/*'];
      
      expect(matchesUrl('https://api.example.com/users', include, [])).toBe(true);
      expect(matchesUrl('https://www.example.com/page', include, [])).toBe(true);
      expect(matchesUrl('http://api.example.com/users', include, [])).toBe(false); // http not https
    });

    it('pattern matching is case insensitive', () => {
      const include = ['*EXAMPLE.COM*'];
      
      expect(matchesUrl('https://api.example.com/users', include, [])).toBe(true);
    });

    // edge cases
    it('handles empty url', () => {
      expect(matchesUrl('', [], [])).toBe(true);
      expect(matchesUrl('', ['*foo*'], [])).toBe(false);
    });

    it('handles special regex characters in patterns', () => {
      const include = ['*api.example.com/v1/users?id=123*'];
      
      expect(matchesUrl('https://api.example.com/v1/users?id=123', include, [])).toBe(true);
      expect(matchesUrl('https://api.example.com/v1/users?id=456', include, [])).toBe(false);
    });

    it('handles multiple include patterns (OR logic)', () => {
      const include = ['*api.example.com*', '*api.test.com*'];
      
      expect(matchesUrl('https://api.example.com/users', include, [])).toBe(true);
      expect(matchesUrl('https://api.test.com/users', include, [])).toBe(true);
      expect(matchesUrl('https://api.other.com/users', include, [])).toBe(false);
    });

    it('handles multiple exclude patterns (OR logic)', () => {
      const exclude = ['*localhost*', '*127.0.0.1*'];
      
      expect(matchesUrl('http://localhost:3000/api', [], exclude)).toBe(false);
      expect(matchesUrl('http://127.0.0.1:3000/api', [], exclude)).toBe(false);
      expect(matchesUrl('https://api.example.com/users', [], exclude)).toBe(true);
    });

    it('handles urls with ports', () => {
      const include = ['*:3000*'];
      
      expect(matchesUrl('http://localhost:3000/api', include, [])).toBe(true);
      expect(matchesUrl('http://localhost:8080/api', include, [])).toBe(false);
    });

    it('handles urls with query strings', () => {
      const exclude = ['*debug=true*'];
      
      expect(matchesUrl('https://api.com/users?debug=true', [], exclude)).toBe(false);
      expect(matchesUrl('https://api.com/users?debug=false', [], exclude)).toBe(true);
    });

    it('handles exact match patterns', () => {
      const include = ['https://api.example.com/users'];
      
      expect(matchesUrl('https://api.example.com/users', include, [])).toBe(true);
      expect(matchesUrl('https://api.example.com/users/123', include, [])).toBe(false);
    });
  });
});

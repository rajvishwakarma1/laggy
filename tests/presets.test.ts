import { describe, it, expect } from 'vitest';
import { presets, getPreset, listPresets } from '../src/presets';

describe('presets', () => {
  it('has all expected presets', () => {
    const names = Object.keys(presets);
    
    expect(names).toContain('5g');
    expect(names).toContain('4g');
    expect(names).toContain('fast-3g');
    expect(names).toContain('slow-3g');
    expect(names).toContain('edge');
    expect(names).toContain('wifi');
    expect(names).toContain('wifi-poor');
    expect(names).toContain('offline');
    expect(names).toContain('flaky');
    expect(names).toContain('chaos');
    expect(names).toContain('lie-fi');
  });

  it('getPreset returns correct preset', () => {
    const preset = getPreset('slow-3g');
    
    expect(preset).toBeDefined();
    expect(preset?.name).toBe('slow-3g');
    expect(preset?.config.latency).toBe(400);
  });

  it('getPreset returns undefined for unknown preset', () => {
    const preset = getPreset('unknown');
    
    expect(preset).toBeUndefined();
  });

  it('listPresets returns array of all presets', () => {
    const list = listPresets();
    
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBe(11);
    expect(list.every((p) => p.name && p.description)).toBe(true);
  });

  it('offline preset has 100% fail rate', () => {
    const preset = getPreset('offline');
    
    expect(preset?.config.failRate).toBe(1.0);
  });

  it('presets have reasonable latency values', () => {
    // faster networks should have lower latency
    const p5g = getPreset('5g');
    const p4g = getPreset('4g');
    const p3g = getPreset('slow-3g');
    
    expect(p5g?.config.latency).toBeLessThan(p4g?.config.latency || 0);
    expect(p4g?.config.latency).toBeLessThan(p3g?.config.latency || 0);
  });
});

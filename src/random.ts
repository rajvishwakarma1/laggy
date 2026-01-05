// simple seeded PRNG using mulberry32
// deterministic when seed is provided, random otherwise

let currentSeed: number | null = null;

export function setSeed(seed: number | null): void {
  currentSeed = seed;
}

export function random(): number {
  if (currentSeed === null) {
    return Math.random();
  }
  
  // mulberry32 algorithm
  let t = (currentSeed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

export function shouldTrigger(rate: number): boolean {
  if (rate <= 0) return false;
  if (rate >= 1) return true;
  return random() < rate;
}

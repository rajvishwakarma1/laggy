#!/usr/bin/env node

// Generates a simple terminal-style SVG demo for README
// Run: node scripts/generate-svg.js > demo.svg

const lines = [
  { text: '$ laggy --preset slow-3g npm test', delay: 0, color: '#c6d0f5' },
  { text: '', delay: 500, color: '' },
  { text: '[laggy] Using preset: slow-3g', delay: 600, color: '#89dceb' },
  { text: '[laggy] Latency: 400ms (+/-100ms)', delay: 700, color: '#89dceb' },
  { text: '[laggy] Failure rate: 2%', delay: 800, color: '#89dceb' },
  { text: '[laggy] Running: npm test', delay: 900, color: '#89dceb' },
  { text: '', delay: 1000, color: '' },
  { text: '> test', delay: 1100, color: '#a6e3a1' },
  { text: '> vitest run', delay: 1200, color: '#a6e3a1' },
  { text: '', delay: 1300, color: '' },
  { text: '[laggy] GET /api/users -> delay 423ms', delay: 1500, color: '#f9e2af' },
  { text: '[laggy] GET /api/posts -> delay 512ms', delay: 2000, color: '#f9e2af' },
  { text: '[laggy] GET /api/comments -> fail 503', delay: 2500, color: '#f38ba8' },
  { text: '', delay: 2700, color: '' },
  { text: 'PASS tests/api.test.ts (3 tests)', delay: 3000, color: '#a6e3a1' },
  { text: '', delay: 3200, color: '' },
  { text: 'Test Files  1 passed', delay: 3400, color: '#c6d0f5' },
  { text: 'Tests       3 passed', delay: 3500, color: '#c6d0f5' },
];

const width = 600;
const height = 380;
const lineHeight = 18;
const padding = 20;
const fontSize = 13;

function generateSvg() {
  let y = padding + 30;
  
  const textElements = lines.map((line, i) => {
    const el = line.text ? `    <text x="${padding}" y="${y}" fill="${line.color}" font-family="monospace" font-size="${fontSize}px">
      <tspan opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="${line.delay}ms" fill="freeze"/>
        ${escapeXml(line.text)}
      </tspan>
    </text>` : '';
    y += lineHeight;
    return el;
  }).join('\n');
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#1e1e2e" rx="8"/>
  
  <!-- Window buttons -->
  <circle cx="20" cy="15" r="6" fill="#f38ba8"/>
  <circle cx="40" cy="15" r="6" fill="#f9e2af"/>
  <circle cx="60" cy="15" r="6" fill="#a6e3a1"/>
  
  <!-- Title -->
  <text x="${width/2}" y="15" fill="#6c7086" font-family="monospace" font-size="12px" text-anchor="middle">laggy - Network Chaos Simulator</text>
  
  <!-- Terminal content -->
${textElements}
</svg>`;
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

console.log(generateSvg());

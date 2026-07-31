/**
 * Display palette + type, pulled from the hi-fi mockups
 * (Comp Timer Mockups.dc.html — dark tokens). The crowd-facing display is a
 * "screen": it stays dark. Light theme lives on the marketing site, not here.
 */
export const D = {
  scrBg: '#0a0e10', // deepest — the timer stage
  bg: '#10161a', // chrome (pairing background)
  card: '#161d22',
  text: '#f2f6f7',
  sub: '#8b9ba3',
  line: 'rgba(255,255,255,.09)',
  accent: '#26cbe8', // cyan — CLIMB / brand
  accentInk: '#03262d',
  amber: '#f0b23e', // REST / PAUSED / waiting
  amberInk: '#3a2705',
  chip: 'rgba(255,255,255,.05)',
  live: '#3ddc84', // LINKED dot
  danger: '#ff5a5a', // final seconds
  sans: 'Archivo, system-ui, sans-serif',
  mono: "'Chivo Mono', ui-monospace, monospace",
} as const

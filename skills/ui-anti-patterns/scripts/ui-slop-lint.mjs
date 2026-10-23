#!/usr/bin/env node
// ui-slop-lint: finds common "generated UI" patterns in a front-end codebase.
// Dependency-free, Node >= 18. See ../references/rules.md for the rule catalogue.
// Source note: write dashes as \u2014 escapes so this file passes its own prose checks.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const VERSION = '0.1.0';
const SEV = { P0: 0, P1: 1, P2: 2 };
const EM = '\u2014';

/* ---------- colour helpers ---------- */

export function parseColor(input) {
  const s = String(input).trim().toLowerCase();
  let m;
  if (s === 'white') return [255, 255, 255, 1];
  if (s === 'black') return [0, 0, 0, 1];
  if ((m = s.match(/^#([0-9a-f]{3,8})$/))) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
    if (h.length !== 6 && h.length !== 8) return null;
    const a = h.length === 8 ? parseInt(h.slice(6), 16) / 255 : 1;
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), a];
  }
  if ((m = s.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)(?:[\s,/]+([\d.]+)(%?))?\s*\)$/))) {
    let a = m[4] === undefined ? 1 : parseFloat(m[4]);
    if (m[5]) a /= 100;
    return [+m[1], +m[2], +m[3], a];
  }
  if ((m = s.match(/^hsla?\(\s*([\d.]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%(?:[\s,/]+([\d.]+))?\s*\)$/))) {
    const h = +m[1] / 360, sat = +m[2] / 100, l = +m[3] / 100;
    const q = l < 0.5 ? l * (1 + sat) : l + sat - l * sat, p = 2 * l - q;
    const f = (t) => {
      t = (t + 1) % 1;
      return t < 1 / 6 ? p + (q - p) * 6 * t : t < 0.5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p;
    };
    return [Math.round(f(h + 1 / 3) * 255), Math.round(f(h) * 255), Math.round(f(h - 1 / 3) * 255), m[4] === undefined ? 1 : +m[4]];
  }
  return null;
}

function luminance([r, g, b]) {
  const c = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

export function contrastRatio(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

function hueSat([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (d === 0) return { h: 0, s: 0 };
  let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  const l = (mx + mn) / 2;
  return { h, s: d / (1 - Math.abs(2 * l - 1)) };
}

const NAMED_HUE = { purple: 280, violet: 270, indigo: 245, fuchsia: 300, magenta: 300, pink: 330, cyan: 185, aqua: 185, blue: 225 };
const GRAY = { 50: 'f9fafb', 100: 'f3f4f6', 200: 'e5e7eb', 300: 'd1d5db', 400: '9ca3af', 500: '6b7280', 600: '4b5563', 700: '374151', 800: '1f2937', 900: '111827', 950: '030712' };

/* ---------- glob / comment / segment helpers ---------- */

export function globToRegex(g) {
  let re = '';
  for (let i = 0; i < g.length; i++) {
    const c = g[i];
    if (c === '*') {
      if (g[i + 1] === '*') { re += '.*'; i++; if (g[i + 1] === '/') i++; } else re += '[^/]*';
    } else if (c === '?') re += '[^/]';
    else re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp('(^|/)' + re + '$');
}
const matchAny = (list, f) => (list || []).some((g) => globToRegex(g).test(f));

function blank(s) { return s.replace(/[^\n]/g, ' '); }
export function stripComments(text, ext) {
  if (ext === 'md') return text.replace(/^---\n[\s\S]*?\n---/, blank).replace(/^(\s*)(```|~~~)[\s\S]*?^\s*\2.*$/gm, blank).replace(/<!--[\s\S]*?-->/g, blank);
  let t = text.replace(/\/\*[\s\S]*?\*\//g, blank);
  if (ext !== 'css') t = t.replace(/(^|[\s;{},])\/\/.*$/gm, (m, p) => p + blank(m.slice(p.length)));
  if (ext !== 'css' && ext !== 'scss') t = t.replace(/<!--[\s\S]*?-->/g, blank);
  return t;
}

const PURE_TEXT = /^\s*[^<>{}=;`$\\/"']*[A-Za-z][^<>{}=;`$\\/"']*$/;
const CODEISH = /\w\.[A-Za-z_$]|[[\]]|\?\?|&&|\|\||\s\?\s|=>|\+\+|;\s*$|^\s*[\w$]+\s*:\s*\S.*[,{(]\s*$/;
const JSX_TEXT = /(?<=[\w"'}\])/])>(?!=)([^<>{}]+)(?=<|$)/g;
const CODE_START = /^\s*(import|export|const|let|var|return|if|else|function|case|default|type|interface|class|for|while|await|async)\b/;
export function segments(line, kind) {
  if (kind === 'md') return [line.replace(/`[^`]*`/g, '')];
  const l = line.replace(/\b(?:class|className|href|src|id|key|d|viewBox|style|type|htmlFor|fill|stroke|rel|target|role|data-[\w-]+)=("[^"]*"|'[^']*'|\{[^}]*\})/g, (m, v) => m.slice(0, m.length - v.length) + v[0] + ' '.repeat(v.length - 2) + v[v.length - 1]);
  if (/^\s*(import|export\b.*\bfrom)\b/.test(l)) return [];
  const out = new Set();
  for (const m of l.matchAll(/(["'`])((?:\\.|(?!\1).)*)\1/g)) out.add(m[2]);
  for (const m of l.matchAll(JSX_TEXT)) out.add(m[1]);
  if (PURE_TEXT.test(l) && !CODE_START.test(l) && !CODEISH.test(l)) out.add(l.trim());
  return [...out];
}

const EMOJI = /(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}️)/u;

/* ---------- default options ---------- */

export const DEFAULTS = {
  minFontPx: 11,
  minTouchPx: 44,
  spacingScale: [4, 8, 12, 16, 24, 32, 48, 64],
  maxHexPerFile: 12,
  maxCapsLabels: 3,
  maxAccentPerFile: 8,
  accentTokens: ['accent', 'brand', 'primary'],
  buzzwords: ['seamless(?:ly)?', 'robust', 'leverag(?:e|es|ed|ing)', 'unlock(?:s|ed|ing)?(?= (?:your|the|new|more|full|insights|potential|value|power))', 'empower(?:s|ed|ing)?', 'game-changing', 'cutting-edge', 'next-gen(?:eration)?', 'revolutioni[sz](?:e|es|ed|ing)', 'supercharg(?:e|es|ed|ing)', 'state-of-the-art', 'best-in-class', 'world-class', 'turnkey', 'synerg(?:y|ies)', 'holistic', 'effortless(?:ly)?', 'blazing[- ]fast', 'all-in-one', 'streamlin(?:e|es|ed|ing)', 'harness(?:es|ed|ing)?(?= (?:the|your|ai|data|power))'],
  buzzwordsExclude: [],
  touchTargets: true,
  maxPunctPerFile: 6,
  maxHeavyShadows: 4,
  maxCardsPerFile: 12,
};

const INDIGO_HEX = new Set(['6366f1', '4f46e5', '4338ca', '3730a3', '8b5cf6', '7c3aed', 'a855f7', '6d28d9', '5b21b6', '818cf8', 'a78bfa', 'c084fc']);
const HUE_NAMES = 'violet|purple|indigo|fuchsia|pink|blue|cyan|sky|teal';


const TAG_RE = /<(\/?)([A-Za-z][\w.]*)((?:[^<>"'{}]|"[^"]*"|'[^']*'|\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})*?)(\/?)>/g;
const CARD_EXCLUDE = new Set(['button', 'a', 'span', 'label', 'Button', 'Link', 'Badge']);
const VOID = new Set(['img', 'br', 'hr', 'input', 'meta', 'link', 'source', 'wbr', 'area', 'col', 'embed', 'track']);
const HTML_TAGS = new Set(['div', 'section', 'article', 'aside', 'main', 'header', 'footer', 'nav', 'ul', 'ol', 'li', 'span', 'p', 'a', 'button', 'form', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'dl', 'dt', 'dd', 'figure', 'label', 'fieldset', 'details', 'summary']);
const TYPE_NAMES = new Set(['Array', 'Record', 'Promise', 'Map', 'Set', 'Partial', 'Omit', 'Pick', 'Readonly', 'Required', 'ReactNode', 'Ref', 'RefObject', 'Dispatch', 'SetStateAction', 'FC', 'Props']);
const OVERLAY = /\b(?:fixed|absolute|sticky)\b|\bz-\d{2}|zIndex|role=["'](?:dialog|menu|tooltip|listbox)|popover|tooltip|modal|dropdown|drawer|dialog|\bmenu\b/i;
const FLOATING = new RegExp(OVERLAY.source + '|toast|snackbar|notification|popup|\\bsheet\\b|combobox|command-palette', 'i');
const CHART_DEFAULTS = new Set(['36a2eb', 'ff6384', 'ffcd56', '4bc0c0', '9966ff', 'ff9f40', 'c9cbcf', '8884d8', '82ca9d', 'ffc658', 'ff7300', '7cb5ec', '434348', '90ed7d', 'f7a35c', '8085e9', 'f15c80', 'e4d354', '2b908f', 'f45b5b', '91e8e1', '2caffe', '544fc5', '00e272', 'fe6a35', '6b8abc', 'd568fb', '2ee0ca', 'fa4b42', '4e79a7', 'f28e2b', 'e15759', '76b7b2', '59a14f', 'edc948', 'b07aa1', 'ff9da7', '9c755f', 'bab0ac']);

function colorsIn(line) {
  const out = [];
  for (const m of line.matchAll(/#([0-9a-fA-F]{6})\b|rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/g)) {
    out.push(m[1] ? m[1].toLowerCase() : [m[2], m[3], m[4]].map((v) => (+v).toString(16).padStart(2, '0')).join(''));
  }
  return out;
}

/** Parses every box-shadow, shadow-[...] and filter drop-shadow in the file. */
function shadowsIn(ctx) {
  const out = [];
  const push = (value, idx) => {
    let depth = 0, cur = '';
    const parts = [];
    for (const ch of value) { if (ch === '(') depth++; if (ch === ')') depth--; if (ch === ',' && depth === 0) { parts.push(cur); cur = ''; } else cur += ch; }
    parts.push(cur);
    for (const part of parts) {
      const inset = /\binset\b/.test(part);
      const colorM = part.match(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/);
      const rest = part.replace(colorM ? colorM[0] : '', '').replace('inset', '');
      const nums = [...rest.matchAll(/(-?\d*\.?\d+)(px|rem)?/g)].map((n) => (n[2] === 'rem' ? n[1] * 16 : +n[1]));
      if (nums.length < 2) continue;
      const [x, y, blur = 0] = nums;
      let glow = false;
      const c = colorM && parseColor(colorM[0]);
      if (c && x === 0 && y === 0 && blur >= 8 && c[3] >= 0.3) { const { s } = hueSat(c); const l = (Math.max(c[0], c[1], c[2]) + Math.min(c[0], c[1], c[2])) / 510; glow = s > 0.6 && l > 0.35 && l < 0.8; }
      out.push({ x, y, blur, inset, glow, line: ctx.lineOf(idx) });
    }
  };
  for (const m of ctx.text.matchAll(/box-shadow\s*:\s*([^;}]+)|boxShadow\s*:\s*['"`]([^'"`]+)/g)) push(m[1] ?? m[2], m.index);
  for (const m of ctx.text.matchAll(/\bshadow-\[([^\]]+)\]/g)) push(m[1].replace(/_/g, ' '), m.index);
  return out;
}


const CSS_LIKE = /^\s*[\w-]+\s*:\s*[^:;]+;/;
const LOG_LINE = /\bconsole\.|\bnew Error\(|\bthrow\b|\blogger\.|\bdescribe\(|\b(?:it|test|expect)\(|\bt\(['"][\w.:-]+['"]/;
const PROSE_LINE = /^\s*[^<>{}=()`$\\/"']*[A-Za-z][^<>{}=()`$\\/"']*$/;
/** Runs `test` on each prose segment. Findings turn P1 when one rule fires more than maxPunctPerFile times. */
function punctScan(ctx, test, msg, minWords) {
  if (ctx.kind === 'style') return [];
  const out = [];
  ctx.lines.forEach((l, i) => {
    if (LOG_LINE.test(l)) return;
    const segs = segments(l, ctx.kind).filter((s) => !/^\s*[|:\- ]+$/.test(s));
    if (PROSE_LINE.test(l) && !CODE_START.test(l) && !CODEISH.test(l)) segs.push(l.trim());
    const hit = segs.some((s) => {
      const t = ctx.kind === 'md' ? s.replace(/^\s*(?:[-*+]|\d+\.)\s+/, '') : s;
      return t.trim().split(/\s+/).length >= minWords && test(t);
    });
    if (hit) out.push({ line: i + 1, msg });
  });
  if (out.length > ctx.opts.maxPunctPerFile) for (const f of out) f.severity = 'P1';
  return out;
}

/* ---------- rule table ---------- */
// Each rule: id, severity, title, hint, scan(ctx) -> [{line, msg?, severity?}]
// ctx: file, ext, kind, lines (comment-stripped), orig, text (stripped), opts, isToken, state, lineOf(idx)

function eachLine(ctx, fn) {
  const out = [];
  ctx.lines.forEach((l, i) => {
    const r = fn(l, i, ctx);
    if (!r) return;
    for (const x of Array.isArray(r) ? r : [r]) out.push({ line: i + 1, ...(typeof x === 'object' ? x : { msg: x }) });
  });
  return out;
}
const lineRe = (re, msg, extra) => (ctx) => eachLine(ctx, (l) => (re.test(l) ? { msg, ...extra } : null));
const textRe = (re, msg, extra) => (ctx) =>
  ctx.kind === 'style' ? [] : eachLine(ctx, (l) => (segments(l, ctx.kind).some((s) => re.test(s)) ? { msg, ...extra } : null));

function balanced(text, open) {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === '(') depth++;
    else if (text[i] === ')' && --depth === 0) return text.slice(open + 1, i);
  }
  return null;
}

function declBlocks(ctx) {
  const out = [];
  for (const m of ctx.text.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const decls = {};
    for (const d of m[2].split(';')) {
      const k = d.indexOf(':');
      if (k > 0) decls[d.slice(0, k).trim().toLowerCase()] = d.slice(k + 1).trim();
    }
    const at = m.index + m[0].search(/\S/);
    out.push({ selector: m[1].trim(), decls, line: ctx.lineOf(at) });
  }
  return out;
}

function isLarge(s) { return /text-(?:2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)\b|font-size:\s*(?:2[4-9]|[3-9]\d)px/.test(s); }

function contrastFromPairs(fg, bg, large, soft, where) {
  const a = parseColor(fg), b = parseColor(bg);
  if (!a || !b || a[3] < 1 || b[3] < 1) return null;
  const r = contrastRatio(a, b);
  const need = large ? 3 : 4.5;
  if (r >= need) return null;
  return { severity: soft ? 'P2' : 'P0', msg: `contrast ${r.toFixed(2)}:1 is below ${need}:1 (${fg} on ${bg})${where ? ' in ' + where : ''}` };
}

function twColor(tok) {
  if (tok === 'white' || tok === 'black') return tok;
  let m;
  if ((m = tok.match(/^gray-(\d+)$/)) && GRAY[m[1]]) return '#' + GRAY[m[1]];
  if ((m = tok.match(/^\[(#[0-9a-fA-F]{3,8})\]$/))) return m[1];
  return null;
}

export const RULES = [
  {
    id: 'default-indigo', severity: 'P1', title: 'Default indigo or violet accent',
    hint: 'Use the project accent token instead of the Tailwind indigo/violet defaults.',
    scan(ctx) {
      if (ctx.isToken) return [];
      return eachLine(ctx, (l) => {
        const out = [];
        for (const m of l.matchAll(/(?<![&\w])#([0-9a-fA-F]{6})\b/g)) if (INDIGO_HEX.has(m[1].toLowerCase())) out.push({ msg: `default indigo/violet colour #${m[1]}` });
        const t = l.match(/\b(?:bg|text|border|ring|from|via|to|fill|stroke|accent|decoration|outline|shadow)-(?:indigo|violet|purple)-\d{2,3}\b/);
        if (t) out.push({ msg: `default Tailwind class ${t[0]}` });
        return out.slice(0, 1);
      });
    },
  },
  {
    id: 'two-stop-gradient', severity: 'P1', title: 'Purple/blue/pink "trust" gradient',
    hint: 'Use a flat surface from the palette. Keep real gradients for data visualisation only.',
    scan(ctx) {
      const out = [];
      for (const m of ctx.text.matchAll(/-gradient\(/g)) {
        const body = balanced(ctx.text, m.index + m[0].length - 1);
        if (!body) continue;
        const hues = [];
        for (const c of body.matchAll(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)|\b(?:purple|violet|indigo|fuchsia|magenta|pink|cyan|blue|aqua)\b/gi)) {
          const t = c[0].toLowerCase();
          if (NAMED_HUE[t] !== undefined) { hues.push(NAMED_HUE[t]); continue; }
          const rgb = parseColor(t);
          if (!rgb || rgb[3] === 0) continue;
          const { h, s } = hueSat(rgb);
          if (s > 0.2 && h >= 180 && h <= 345) hues.push(h);
        }
        const spread = hues.length >= 2 && Math.max(...hues) - Math.min(...hues) >= 20;
        if (spread) out.push({ line: ctx.lineOf(m.index), msg: 'gradient between purple/blue/cyan/pink stops' });
      }
      const tw = eachLine(ctx, (l) => {
        if (!/\bbg-(?:gradient-to-|linear-to-|linear-)/.test(l)) return null;
        const f = l.match(new RegExp(`\\bfrom-(${HUE_NAMES})-\\d+`)), t = l.match(new RegExp(`\\bto-(${HUE_NAMES})-\\d+`));
        return f && t && f[1] !== t[1] ? { msg: `Tailwind gradient from-${f[1]} to-${t[1]}` } : null;
      });
      return out.concat(tw);
    },
  },
  {
    id: 'gradient-text', severity: 'P1', title: 'Gradient-filled text',
    hint: 'Use a solid text colour. Express emphasis with size or weight.',
    scan: (ctx) => eachLine(ctx, (l) => (/\bbg-clip-text\b/.test(l) && /\btext-transparent\b/.test(l)) || /(?:-webkit-)?background-clip\s*:\s*text/i.test(l) || /WebkitBackgroundClip\s*:\s*['"]text/.test(l) ? 'text filled with a background gradient' : null),
  },
  {
    id: 'emoji-ui', severity: 'P1', title: 'Emoji used as icon or in headings, buttons, list items',
    hint: 'Use the product icon set (monoline SVG, currentColor) or no icon.',
    scan(ctx) {
      if (matchAny(ctx.cfg.emojiAllowFiles, ctx.file)) return [];
      const tag = /<(?:h[1-6]|button|Button|li|label|th|summary|Heading)\b[^>]*>[^<]*/;
      return eachLine(ctx, (l, i) => {
        if (ctx.kind === 'style') return null;
        if (ctx.kind === 'md') return /^#{1,6}\s/.test(l) && EMOJI.test(l) ? 'emoji in heading' : null;
        const m = l.match(tag);
        if (m && EMOJI.test(m[0])) return 'emoji inside a heading, button, list item or label';
        if (PURE_TEXT.test(l) && EMOJI.test(l)) {
          const prev = ctx.lines.slice(Math.max(0, i - 3), i).join('\n');
          if (/<(?:h[1-6]|button|Button|li|label)\b[^>]*>\s*$/.test(prev)) return 'emoji inside a heading, button, list item or label';
        }
        const q = l.match(/(["'`])\s*(\p{Emoji_Presentation}|\p{Extended_Pictographic}️)/u);
        if (q && /(?:title|label|text|heading|name|cta)\s*[:=]/i.test(l)) return 'label string starts with an emoji';
        return null;
      });
    },
  },
  {
    id: 'frosted-glass', severity: 'P1', title: 'Frosted glass (backdrop blur)',
    hint: 'Use a solid background. Keep blur only for real overlays that need it.',
    scan: (ctx) => eachLine(ctx, (l, i) => {
      if (!/(?:-webkit-)?backdrop-filter\s*:(?!\s*none)|\bbackdrop-blur(?:-[\w[\]]+)?\b|backdropFilter\s*:/.test(l) || /@supports/.test(l)) return null;
      const near = ctx.lines.slice(Math.max(0, i - 3), i + 1).join('\n');
      const scrim = /\binset-0\b|inset\s*:\s*0/.test(near) && /bg-black|rgba\(\s*\d{1,2},\s*\d{1,2},\s*\d{1,2},\s*0?\.\d+\)|\bbg-\w+\/\d+/.test(near);
      return scrim ? null : 'backdrop blur on a surface';
    }),
  },
  {
    id: 'side-border-accent', aliases: ['left-border-accent'], severity: 'P1', title: 'Coloured side border accent',
    hint: 'Build hierarchy with spacing and type. If the border encodes severity, add an ignore comment with that reason.',
    scan: (ctx) => eachLine(ctx, (l) => {
      let m;
      if (/(?:border-(?:left|right)|border(?:Left|Right)|border-inline-(?:start|end))[^;,}]*\btransparent\b/i.test(l)) return null;
      if (/\bborder-transparent\b/.test(l) && !/\bborder-(?!transparent\b|[lrtbxyse]-)[a-z]+-\d/.test(l)) return null;
      if (/\bborder-[lrse]-(?:2|3|4|5|6|8)\b/.test(l) || /\bborder-[lrse]-\[(?:[2-9]|\d{2,})px\]/.test(l)) return 'thick side border utility';
      if (/\bborder-[lr]-(?:primary|accent|destructive|success|warning|info|brand|(?:red|orange|amber|yellow|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|pink|rose)-\d+)\b/.test(l)) return 'coloured side border utility';
      if ((m = l.match(/border-(left|right|inline-start|inline-end)\s*:\s*(\d*\.?\d+)px\s+solid/i)) && +m[2] >= 2) return `${m[2]}px solid ${m[1]} border`;
      if ((m = l.match(/border-(left|right|inline-start|inline-end)-width\s*:\s*(\d*\.?\d+)px/i)) && +m[2] >= 2) return `${m[2]}px ${m[1]} border width`;
      if ((m = l.match(/border(?:Left|Right)(?:Width)?\s*:\s*['"]?(\d+)/)) && +m[1] >= 2) return 'inline-style side border';
      return null;
    }),
  },
  {
    id: 'scroll-entrance', severity: 'P1', title: 'Sections that fade in on scroll',
    hint: 'Render content in place. Animate only in response to a user action, and honour prefers-reduced-motion.',
    scan: (ctx) => eachLine(ctx, (l) => {
      if (/\bwhileInView\b/.test(l)) return 'whileInView entrance';
      if (/\bdata-aos\b/.test(l)) return 'AOS scroll entrance';
      if (/opacity-0[^"'`]*translate-y-\d|translate-y-\d[^"'`]*opacity-0/.test(l)) return { msg: 'opacity-0 plus translate-y entrance classes', severity: 'P2' };
      if (/\banimate-fade-(?:in|up|down)\b|\bfade-in-up\b|\buseInView\(/.test(l)) return { msg: 'fade-in entrance helper', severity: 'P2' };
      return null;
    }),
  },
  {
    id: 'cursor-glow', severity: 'P1', title: 'Glow that follows the cursor',
    hint: 'Remove the effect. Use a visible focus ring and a real hover state instead.',
    scan(ctx) {
      const t = ctx.text;
      if (!/(?:mousemove|pointermove)/.test(t) || !/setProperty\(\s*['"]--/.test(t) || !/radial-gradient/.test(t)) return [];
      return [{ line: ctx.lineOf(t.search(/mousemove|pointermove/)), msg: 'pointer position feeds a radial gradient' }];
    },
  },
  {
    id: 'hover-opacity', severity: 'P2', title: 'Hover state is only an opacity change',
    hint: 'Change background, border or underline, and keep a visible focus style.',
    scan(ctx) {
      const out = eachLine(ctx, (l) => /\bhover:opacity-\d+/.test(l) && /<button|<Button|<a\s|<Link|\bbtn\b|role="button"/.test(l) && !/hover:(?:bg|text|shadow|underline|border|ring|scale|-?translate)/.test(l) ? 'button hover only changes opacity' : null);
      for (const b of declBlocks(ctx)) {
        if (!/:hover/.test(b.selector)) continue;
        const keys = Object.keys(b.decls).filter((k) => !/^(transition|cursor)/.test(k));
        if (keys.length === 1 && keys[0] === 'opacity') out.push({ line: b.line, msg: `${b.selector} :hover only sets opacity` });
      }
      return out;
    },
  },
  {
    id: 'icon-card-row', landing: true, severity: 'P2', title: 'Three identical icon, title and blurb cards',
    hint: 'State the real number of points, make the most important one larger, and drop icons that carry no meaning.',
    scan(ctx) {
      const L = ctx.lines, heads = [];
      L.forEach((l, i) => {
        if (!/<h[34]\b/.test(l)) return;
        const before = L.slice(Math.max(0, i - 8), i).join('\n') + '\n' + l.slice(0, l.indexOf('<h')), after = l.slice(l.indexOf('<h')) + '\n' + L.slice(i + 1, i + 5).join('\n');
        if (/<svg|<[A-Z]\w*Icon\b|<Icon\b|lucide|<i\s+class|\{[\w.]*icon\}/i.test(before) && /<p\b|<Text\b/.test(after)) heads.push(i);
      });
      const out = [];
      for (let k = 0; k + 2 < heads.length; k++) {
        const g1 = heads[k + 1] - heads[k], g2 = heads[k + 2] - heads[k + 1];
        if (g1 <= 24 && g2 <= 24 && Math.abs(g1 - g2) <= 2) { out.push({ line: heads[k] + 1, msg: 'three sibling cards with the same icon, title, paragraph structure' }); k += 2; }
      }
      const icons = [];
      L.forEach((l, i) => { if (/\bicon\s*:/.test(l) && !/typeof|;\s*$/.test(l)) { const w = L.slice(Math.max(0, i - 3), i + 4).join('\n'); if (/\b(?:title|heading|label|name)\s*:/.test(w) && /\b(?:description|desc|body|text|blurb)\s*:/.test(w)) icons.push(i); } });
      for (let k = 0; k + 2 < icons.length; k++) {
        const g1 = icons[k + 1] - icons[k], g2 = icons[k + 2] - icons[k + 1];
        if (g1 <= 12 && g2 <= 12) { out.push({ line: icons[k] + 1, msg: 'three data items with icon, title and description render as an icon-card row' }); break; }
      }
      return out;
    },
  },
  {
    id: 'eyebrow-pill', landing: true, severity: 'P2', title: 'Badge or eyebrow pill above a heading',
    hint: 'Lead with the heading. If the label carries information, fold it into the heading or the page chrome.',
    scan: (ctx) => eachLine(ctx, (l, i) => {
      if (/<h[12]\b/.test(l)) return null;
      const pill = /(?:class|className)=["'{`][^"'`]*\b(?:eyebrow|kicker|overline)\b/i.test(l) ||
        (/<(?:span|div|p|Badge)\b/.test(l) && /rounded-full/.test(l) && /\bpx-\d/.test(l) && /text-(?:xs|sm|\[1\dpx\])/.test(l) && /\bbg-|\bborder\b/.test(l));
      return pill && /<h[12]\b|<Heading\b/.test(ctx.lines.slice(i + 1, i + 5).join('\n')) ? 'pill or eyebrow label sits above a heading' : null;
    }),
  },
  {
    id: 'caps-tracked', severity: 'P2', title: 'ALL-CAPS tracked labels',
    hint: 'Use sentence case. Keep caps for real abbreviations and table column units.',
    scan(ctx) {
      const hits = eachLine(ctx, (l) => (/\buppercase\b/.test(l) && /\btracking-/.test(l) ? 'uppercase with letter spacing' : null));
      for (const b of declBlocks(ctx)) if (/uppercase/.test(b.decls['text-transform'] || '') && b.decls['letter-spacing']) hits.push({ line: b.line, msg: `${b.selector} uses uppercase with letter spacing` });
      const max = ctx.opts.maxCapsLabels;
      if (hits.length > max) hits.unshift({ line: hits[0].line, severity: 'P1', msg: `${hits.length} tracked all-caps labels in one file (limit ${max})` });
      return hits;
    },
  },
  {
    id: 'em-dash', severity: 'P1', title: 'Em dash in UI copy',
    hint: 'Use a comma, a colon or a full stop.',
    scan: (ctx) => {
      if (ctx.kind === 'style') return [];
      return eachLine(ctx, (l) => {
        const segs = segments(l, ctx.kind);
        if (segs.some((s) => s.includes(EM) && s.trim() !== EM && !/^[A-Z][A-Z0-9 ]{1,24} \u2014 /.test(s.trim()))) return 'em dash in text';
        if (/&mdash;|&#8212;|\\u2014/.test(l) && ctx.kind !== 'md') return 'em dash entity in text';
        return null;
      });
    },
  },
  {
    id: 'label-dash', severity: 'P1', title: '"WORD \u2014 fragment" label',
    hint: 'Write a plain label. Put the second part in a separate element or drop it.',
    scan: textRe(/^\s*[A-Z][A-Z0-9 ]{1,24}\s(?:\u2014|&mdash;)\s\S/, 'caps label followed by an em dash fragment'),
  },
  {
    id: 'middle-dot', severity: 'P2', title: 'Middle-dot joined meta string',
    hint: 'Use separate elements or labelled fields, not a dotted string.',
    scan: textRe(/\s(?:·|&middot;|&#183;)\s/, 'meta text joined with middle dots'),
  },
  {
    id: 'arrow-suffix', severity: 'P2', title: 'Arrow appended to link or button text',
    hint: 'Write the label as a verb phrase. Let the link style show that it is a link.',
    scan: textRe(/\S\s*(?:→|&rarr;|&#8594;|›|&rsaquo;)\s*$/, 'arrow glyph at the end of a label'),
  },
  {
    id: 'placeholder-copy', severity: 'P1', title: 'Placeholder or filler copy',
    hint: 'Write the real text. For an empty state, say what the user can do next.',
    scan: textRe(/lorem ipsum|dolor sit amet|\bfeature (?:one|two|three|1|2|3)\b|\b(?:sample|placeholder|dummy) (?:content|text|description)\b|\byour (?:text|content|title|description) here\b|\bgoes here\b/i, 'placeholder text in UI'),
  },
  {
    id: 'invented-metric', severity: 'P1', title: 'Metric that may be invented',
    hint: 'Show a number only when it comes from a real source. Label sample data as sample data.',
    scan: textRe(/\b\d{1,3}(?:\.\d+)?x\s+(?:faster|quicker|more|better|cheaper|less|lower)\b|\b99(?:\.\d+)?%\s*(?:uptime|availability|accuracy|SLA)|\b\d{2,3}%\s+(?:faster|less|more|reduction|increase|improvement|savings?)\b|\btrusted by\s+\d|\b\d+[kKmM]?\+\s+(?:users|customers|teams|companies|downloads|developers)\b|\b(?:over|more than)\s+\d[\d,]*\s+(?:users|customers|teams|companies)\b/i, 'marketing-style metric in UI text'),
  },
  {
    id: 'buzzword', severity: 'P2', title: 'Generic buzzword in copy',
    hint: 'State what the product does, in plain words, from the user point of view.',
    scan(ctx) {
      const words = ctx.opts.buzzwords.filter((w) => !ctx.opts.buzzwordsExclude.includes(w));
      const re = new RegExp(`\\b(?:${words.join('|')})\\b`, 'i');
      if (ctx.kind === 'style') return [];
      return eachLine(ctx, (l) => {
        for (const s of segments(l, ctx.kind)) { const m = s.match(re); if (m && /\s/.test(s.trim())) return `buzzword "${m[0]}"`; }
        return null;
      });
    },
  },
  {
    id: 'placeholder-image', severity: 'P1', title: 'External placeholder image service',
    hint: 'Ship real assets, or draw an honest empty state.',
    scan: lineRe(/\b(?:images\.unsplash\.com|source\.unsplash\.com|unsplash\.com\/photos|placehold\.co|placehold\.it|picsum\.photos|placekitten\.com|via\.placeholder\.com|dummyimage\.com|loremflickr\.com)/i, 'placeholder image host'),
  },
  {
    id: 'decorative-blob', severity: 'P2', title: 'Decorative blob or wave graphic',
    hint: 'Remove the decoration, or replace it with a graphic that explains the product.',
    scan: lineRe(/\b(?:blobs?|waves?|squiggle)[\w-]*\.(?:svg|png|webp)\b/i, 'reference to a blob or wave graphic'),
  },
  {
    id: 'grain-noise', severity: 'P2', title: 'Grain or noise texture',
    hint: 'Use a flat surface. Texture adds weight and file size, not information.',
    scan: lineRe(/feTurbulence|(?:noise|grain)[\w-]*\.(?:png|svg|webp|jpg|gif)\b|\bbg-(?:noise|grain)\b|url\([^)]*(?:noise|grain)/i, 'noise or grain texture'),
  },
  {
    id: 'hex-excess', severity: 'P2', title: 'Too many raw hex colours outside token files',
    hint: 'Move colours into design tokens and reference the tokens.',
    scan(ctx) {
      if (ctx.isToken) return [];
      let n = 0, first = 0;
      ctx.lines.forEach((l, i) => {
        if (/href=|&#/.test(l)) return;
        const c = [...l.matchAll(/(?<![&\w#])#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g)].length;
        if (c && !first) first = i + 1;
        n += c;
      });
      return n > ctx.opts.maxHexPerFile ? [{ line: first, msg: `${n} raw hex colours (limit ${ctx.opts.maxHexPerFile})` }] : [];
    },
  },
  {
    id: 'accent-overuse', severity: 'P2', title: 'Accent colour used too often',
    hint: 'Reserve the accent for one primary action per view.',
    scan(ctx) {
      const t = ctx.opts.accentTokens.join('|');
      const re = new RegExp(`\\b(?:bg|text|border|ring|fill|stroke|from|to|via|outline|shadow)-(?:${t})(?![\\w-])|var\\(--(?:${t})[\\w-]*\\)`, 'g');
      let n = 0, first = 0;
      ctx.lines.forEach((l, i) => { const c = [...l.matchAll(re)].length; if (c && !first) first = i + 1; n += c; });
      return n > ctx.opts.maxAccentPerFile ? [{ line: first, msg: `accent token used ${n} times (limit ${ctx.opts.maxAccentPerFile})` }] : [];
    },
  },
  {
    id: 'low-contrast', severity: 'P0', title: 'Low contrast text and background pair',
    hint: 'Raise the text colour until the ratio reaches 4.5:1 (3:1 for large text).',
    scan(ctx) {
      const out = [];
      for (const b of declBlocks(ctx)) {
        const fg = b.decls.color, bg = b.decls['background-color'] || b.decls.background;
        if (!fg || !bg) continue;
        if (/disabled|\[aria-disabled/.test(b.selector)) continue;
        const r = contrastFromPairs(fg, bg, isLarge(b.decls['font-size'] ? 'font-size:' + b.decls['font-size'] : ''), /placeholder/.test(b.selector), b.selector);
        if (r) out.push({ line: b.line, ...r });
      }
      ctx.lines.forEach((l, i) => {
        const fg = l.match(/(?<![-\w])color\s*:\s*['"]?(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|white|black)/);
        const bg = l.match(/background(?:Color|-color)?\s*:\s*['"]?(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|white|black)/);
        if (fg && bg && /style=|\{\{|:\s*['"]/.test(l) && !/\{[^{}]*;[^{}]*\}/.test(l)) {
          const r = contrastFromPairs(fg[1], bg[1], /fontSize\s*:\s*(?:2[4-9]|[3-9]\d)\b/.test(l), false);
          if (r) out.push({ line: i + 1, ...r });
        }
        for (const prefix of ['', 'dark:']) {
          const tokens = l.split(/[\s"'`]+/).filter((x) => x.startsWith(prefix) && (prefix || !x.includes(':'))).map((x) => x.slice(prefix.length));
          const tc = tokens.find((x) => x.startsWith('text-') && twColor(x.slice(5))), bc = tokens.find((x) => x.startsWith('bg-') && twColor(x.slice(3)));
          if (tc && bc) {
            if (/disabled|not-allowed/.test(l)) continue;
            const r = contrastFromPairs(twColor(tc.slice(5)), twColor(bc.slice(3)), isLarge(l), /placeholder/.test(l), (prefix ? 'dark mode ' : '') + `${tc} ${bc}`);
            if (r) out.push({ line: i + 1, ...r });
          }
        }
      });
      return out;
    },
  },
  {
    id: 'tiny-font', severity: 'P1', title: 'Font size below the minimum',
    hint: 'Raise the size to the project minimum (default 11px) or remove the text.',
    scan(ctx) {
      const min = ctx.opts.minFontPx;
      return eachLine(ctx, (l) => {
        for (const m of l.matchAll(/font-size\s*:\s*(\d*\.?\d+)(px|rem)\b|fontSize\s*:\s*['"]?(\d*\.?\d+)(px|rem)?\b|\btext-\[(\d*\.?\d+)(px|rem)\]/g)) {
          const v = parseFloat(m[1] ?? m[3] ?? m[5]), u = m[2] ?? m[4] ?? m[6] ?? 'px';
          const px = u === 'rem' ? v * 16 : v;
          if (px > 0 && px < min) return `font size ${px}px is below ${min}px`;
        }
        return null;
      });
    },
  },
  {
    id: 'small-touch-target', severity: 'P2', title: 'Touch target below 44px',
    hint: 'Give interactive elements at least 44px by 44px, or pad the hit area.',
    scan(ctx) {
      if (!ctx.opts.touchTargets) return [];
      const min = ctx.opts.minTouchPx, out = [];
      ctx.lines.forEach((l, i) => {
        if (!/<(?:button|Button|IconButton)\b/.test(l)) return;
        const s = l.match(/\bsize-(\d+)\b/), h = l.match(/\bh-(\d+)\b/), w = l.match(/\bw-(\d+)\b/);
        const hh = s ? +s[1] : h ? +h[1] : null, ww = s ? +s[1] : w ? +w[1] : null;
        if (hh !== null && ww !== null && hh * 4 < min && ww * 4 < min) out.push({ line: i + 1, msg: `button is ${ww * 4}px by ${hh * 4}px` });
      });
      for (const b of declBlocks(ctx)) {
        if (!/button|btn/i.test(b.selector)) continue;
        const px = (k) => { const m = (b.decls[k] || '').match(/^(\d*\.?\d+)px$/); return m ? +m[1] : null; };
        const hh = px('height') ?? px('min-height'), ww = px('width') ?? px('min-width');
        if (hh !== null && ww !== null && hh < min && ww < min) out.push({ line: b.line, msg: `${b.selector} is ${ww}px by ${hh}px` });
      }
      return out;
    },
  },
  {
    id: 'off-scale-spacing', severity: 'P2', title: 'Spacing value outside the scale',
    hint: 'Use one spacing scale (default 4, 8, 12, 16, 24, 32, 48, 64).',
    scan(ctx) {
      const scale = new Set([0, 1, 2, ...ctx.opts.spacingScale]);
      const ok = (v) => scale.has(v) || (v >= 64 && v % 16 === 0);
      const tsx = ['tsx', 'jsx'].includes(ctx.ext);
      return eachLine(ctx, (l) => {
        const bad = [];
        for (const m of l.matchAll(/\b(?:margin|padding|gap|row-gap|column-gap)(?:-(?:top|right|bottom|left|inline|block)(?:-(?:start|end))?)?\s*:\s*([^;}{]+)|\b(?:margin|padding|gap)(?:Top|Right|Bottom|Left|Inline|Block)?\s*:\s*(['"]?)([^,;}]+)/g)) {
          const val = m[1] ?? m[3];
          if (/var\(|calc\(|%|auto|clamp\(/.test(val)) continue;
          for (const t of val.matchAll(/(-?\d*\.?\d+)(px|rem)?(?![\w.])/g)) {
            if (!t[2] && !(tsx && m[3] !== undefined)) continue;
            const v = Math.abs(t[2] === 'rem' ? parseFloat(t[1]) * 16 : parseFloat(t[1]));
            if (!ok(v)) bad.push(v);
          }
        }
        for (const m of l.matchAll(/\b-?(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|space-x|space-y)-\[(\d*\.?\d+)(px|rem)\]/g)) {
          const v = m[2] === 'rem' ? parseFloat(m[1]) * 16 : parseFloat(m[1]);
          if (!ok(v)) bad.push(v);
        }
        return bad.length ? `spacing ${[...new Set(bad)].join(', ')}px is not on the scale` : null;
      });
    },
  },
  {
    id: 'default-font-only', severity: 'P2', title: 'Only a default font stack, no display role',
    hint: 'Pick a deliberate type pair with distinct roles, and define a type scale.',
    project: true,
    scan(ctx) {
      const f = (ctx.state.fonts ||= { first: null, custom: false });
      const DEFAULT = /^(?:inter|roboto|system-ui|arial|helvetica(?: neue)?|sans-serif|serif|monospace|ui-sans-serif|ui-monospace|ui-serif|-apple-system|blinkmacsystemfont|segoe ui|apple color emoji|segoe ui emoji|sf mono|menlo|consolas|courier new|inherit|initial)$/;
      ctx.lines.forEach((l, i) => {
        const found = [];
        for (const m of l.matchAll(/font-family\s*:\s*([^;}{]+)|fontFamily\s*:\s*['"`]([^'"`]+)['"`]|\bfont-\[(?:'|")?([^\]'"]+)/g)) found.push(m[1] ?? m[2] ?? m[3]);
        for (const m of l.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"]next\/font\/google['"]/g)) found.push(m[1].split(',').map((x) => x.trim().replace(/_/g, ' ')).join(','));
        for (const v of found) {
          if (/var\(/.test(v)) f.custom = true;
          for (const fam of v.split(',').map((x) => x.trim().replace(/^['"]|['"]$/g, '').toLowerCase()).filter(Boolean)) {
            if (fam.startsWith('var(')) f.custom = true;
            else if (!DEFAULT.test(fam)) f.custom = true;
            else if (!f.first) f.first = { file: ctx.file, line: i + 1, snippet: ctx.orig[i].trim() };
          }
        }
      });
      return [];
    },
    finalize(state) {
      const f = state.fonts;
      return f && f.first && !f.custom ? [{ file: f.first.file, line: f.first.line, snippet: f.first.snippet, msg: 'every font family in the project is a default (Inter, Roboto, system-ui, Arial)' }] : [];
    },
  },
  {
    id: 'serif-italic-emphasis', landing: true, severity: 'P2', title: 'One italic or serif word inside a heading',
    hint: 'Keep the heading in one style. Say the specific claim in plain words.',
    scan: lineRe(/<h[1-3]\b[^>]*>[^<]*<(?:em|i|span[^>]*\b(?:italic|font-serif)\b[^>]*)>\s*[\w'-]+\s*<\/(?:em|i|span)>/, 'single emphasised word in a heading'),
  },
  {
    id: 'heavy-shadow', severity: 'P2', title: 'Heavy shadow on cards',
    hint: 'Use a border or a flat tonal step. Keep shadows for overlays such as menus and drawers.',
    scan(ctx) {
      const out = [];
      const overlay = (line) => OVERLAY.test(ctx.lines.slice(Math.max(0, line - 4), line + 1).join('\n'));
      for (const s of shadowsIn(ctx)) {
        if (s.inset || s.glow || overlay(s.line)) continue;
        if (s.blur >= 24 || s.y >= 12) out.push({ line: s.line, msg: `shadow with ${s.blur}px blur and ${s.y}px offset` });
      }
      for (const [i, l] of ctx.lines.entries()) if (/\bshadow-(?:xl|2xl)\b/.test(l) && !/\bhover:shadow/.test(l) && !overlay(i + 1)) out.push({ line: i + 1, msg: 'large Tailwind shadow' });
      if (out.length > ctx.opts.maxHeavyShadows) out.unshift({ line: out[0].line, severity: 'P1', msg: `${out.length} heavy shadows in one file (limit ${ctx.opts.maxHeavyShadows})` });
      return out;
    },
  },
  {
    id: 'nested-cards', severity: 'P2', title: 'Cards inside cards, or too many cards',
    hint: 'Use whitespace, dividers and tables for grouping. One container level is usually enough.',
    scan(ctx) {
      if (ctx.kind !== 'markup') return [];
      const stack = [], out = []; let total = 0, flagged = false;
      for (const m of ctx.text.matchAll(TAG_RE)) {
        const [, close, name, attrs, self] = m;
        if (name.length === 1 || TYPE_NAMES.has(name) || VOID.has(name.toLowerCase())) continue;
        if (!/^[A-Z]/.test(name) && !HTML_TAGS.has(name)) continue;
        if (CARD_EXCLUDE.has(name)) continue;
        if (close) { let k = stack.length - 1; while (k >= 0 && stack[k].name !== name) k--; if (k >= 0) stack.length = k; continue; }
        const card = name === 'Card' || /\b(?:class|className)\s*=\s*["'{`][^"'`]*(?:\bcard\b|[\w]-card\b|\bcard-|(?=[^"'`]*\bp-(?:[4-9]|1\d)\b)(?=[^"'`]*\bborder\b)(?=[^"'`]*\brounded-(?:md|lg|xl|2xl|3xl)\b)(?=[^"'`]*\bbg-))/.test(attrs);
        if (card) { total++; if (!flagged && stack.some((s) => s.card)) { out.push({ line: ctx.lineOf(m.index), msg: 'card-like container inside another card-like container' }); flagged = true; } }
        if (!self) stack.push({ name, card });
      }
      if (total > ctx.opts.maxCardsPerFile) out.push({ line: 1, msg: `${total} card-like containers in one file (limit ${ctx.opts.maxCardsPerFile})` });
      return out;
    },
  },
  {
    id: 'uniform-radius', severity: 'P2', title: 'One large radius on every component',
    hint: 'Use at least two radius steps: a small one for controls and a larger one for containers, or keep corners tight.',
    project: true,
    scan(ctx) {
      const r = (ctx.state.radius ||= { values: new Map(), first: null });
      const TW = { sm: 2, '': 4, md: 6, lg: 8, xl: 12, '2xl': 16, '3xl': 24 };
      const add = (v, line) => { r.values.set(v, (r.values.get(v) || 0) + 1); r.first ||= { file: ctx.file, line, snippet: ctx.orig[line - 1] }; };
      ctx.lines.forEach((l, i) => {
        for (const m of l.matchAll(/\brounded(?:-(?:t|b|l|r|s|e|tl|tr|bl|br))?(?:-(sm|md|lg|xl|2xl|3xl|full|none))?(?![\w-])/g)) { if (m[1] === 'full' || m[1] === 'none') continue; add(TW[m[1] ?? ''], i + 1); }
        for (const m of l.matchAll(/border-radius\s*:\s*(\d*\.?\d+)(px|rem)/gi)) { const v = m[2] === 'rem' ? m[1] * 16 : +m[1]; if (v > 0 && v < 500) add(v, i + 1); }
      });
      return [];
    },
    finalize(state) {
      const r = state.radius;
      if (!r) return [];
      const total = [...r.values.values()].reduce((a, b) => a + b, 0);
      if (r.values.size === 1 && total >= 8 && [...r.values.keys()][0] >= 8) return [{ file: r.first.file, line: r.first.line, snippet: r.first.snippet, msg: `all ${total} rounded corners use ${[...r.values.keys()][0]}px` }];
      return [];
    },
  },
  {
    id: 'default-chart-palette', severity: 'P2', title: 'Default chart-library colours',
    hint: 'Map chart colours to design tokens with a stated meaning (status or category).',
    scan(ctx) {
      if (ctx.isToken) return [];
      const seen = new Map();
      ctx.lines.forEach((l, i) => {
        for (const c of colorsIn(l)) if (CHART_DEFAULTS.has(c) && !seen.has(c)) seen.set(c, i + 1);
      });
      const out = [];
      if (seen.size >= 2) out.push({ line: Math.min(...seen.values()), msg: `${seen.size} colours from a chart library default palette` });
      for (const m of ctx.text.matchAll(/\b(?:colors?|palette|chartColors|seriesColors|COLORS)\s*[:=]\s*\[([^\]]+)\]/gi)) {
        if ((m[1].match(/#[0-9a-fA-F]{6}\b|rgba?\(/g) || []).length >= 4) out.push({ line: ctx.lineOf(m.index), msg: 'chart palette array of raw colours' });
      }
      return out;
    },
  },
  {
    id: 'gradient-orb', severity: 'P1', title: 'Decorative gradient orb or glow background',
    hint: 'Remove the glow. App content sits on a flat surface.',
    scan(ctx) {
      const out = eachLine(ctx, (l) => (/\bblur-(?:2xl|3xl)\b|\bblur-\[(?:[4-9]\d|\d{3,})px\]/.test(l) && /\babsolute\b|\bfixed\b/.test(l) && /rounded-full|\bw-\d{2,}|\bsize-\d{2,}/.test(l) ? 'large blurred absolute element' : null));
      for (const b of declBlocks(ctx)) {
        const m = (b.decls.filter || '').match(/blur\((\d+)px\)/);
        if (m && +m[1] >= 40 && /absolute|fixed/.test(b.decls.position || '')) out.push({ line: b.line, msg: `${b.selector} is an absolutely positioned ${m[1]}px blur` });
      }
      return out;
    },
  },
  {
    id: 'neon-glow', severity: 'P2', title: 'Neon glow border or shadow',
    hint: 'Use a plain border and a solid focus ring. Colour should carry state, not glow.',
    scan(ctx) {
      const out = [];
      for (const s of shadowsIn(ctx)) if (s.glow) out.push({ line: s.line, msg: `saturated ${s.blur}px glow with no offset` });
      for (const [i, l] of ctx.lines.entries()) if (/\bshadow-(?:blue|cyan|sky|purple|violet|indigo|fuchsia|pink|emerald|green|lime)-(?:300|400|500)\/\d+/.test(l) && /\bshadow-(?:md|lg|xl|2xl)\b/.test(l)) out.push({ line: i + 1, msg: 'coloured Tailwind shadow glow' });
      return out;
    },
  },
  {
    id: 'weak-hierarchy', severity: 'P2', title: 'Almost no type size or weight contrast',
    hint: 'Give each level a distinct size and weight. Make the one important thing larger.',
    scan(ctx) {
      if (ctx.kind !== 'markup') return [];
      const sizes = new Set(), weights = new Set(); let uses = 0;
      for (const m of ctx.text.matchAll(/\btext-(xs|sm|base|lg|xl|[2-9]xl)\b/g)) { sizes.add(m[1]); uses++; }
      for (const m of ctx.text.matchAll(/\bfont-(thin|light|normal|medium|semibold|bold|extrabold|black)\b/g)) weights.add(m[1]);
      return uses >= 12 && sizes.size <= 2 && weights.size <= 1 ? [{ line: 1, msg: `${uses} text-size classes but only ${sizes.size} size(s) and ${weights.size} weight(s)` }] : [];
    },
  },
  {
    id: 'floating-animation', severity: 'P2', title: 'Infinite floating or bobbing animation',
    hint: 'Remove ambient motion. Animate only in response to a user action, and respect reduced motion.',
    scan(ctx) {
      const out = eachLine(ctx, (l) => (/\banimate-(?:float|floating|bounce)\b/.test(l) ? 'ambient float or bounce utility' : /animation(?:-name)?\s*:[^;]*\b(?:float|floating|bob|levitate|drift)\w*\b[^;]*\binfinite\b/i.test(l) ? 'infinite floating animation' : null));
      const names = [...ctx.text.matchAll(/@keyframes\s+([\w-]+)\s*\{([\s\S]*?\})\s*\}/g)].filter((m) => /translate(?:Y|3d)?\(/i.test(m[2]) && !/rotate|scale|opacity/i.test(m[2]));
      for (const k of names) if (new RegExp(`animation[^;]*\\b${k[1]}\\b[^;]*infinite|animation[^;]*infinite[^;]*\\b${k[1]}\\b`).test(ctx.text) && !/spin|load|skeleton|pulse|shimmer|float|bob|levitate|drift/i.test(k[1])) out.push({ line: ctx.lineOf(k.index), msg: `keyframes ${k[1]} moves an element up and down forever` });
      return out;
    },
  },
  {
    id: 'accent-word-heading', landing: true, severity: 'P2', title: 'One word of a heading in a different colour',
    hint: 'Keep the heading in one colour. Say the claim in plain words.',
    scan(ctx) {
      const out = [];
      for (const m of ctx.text.matchAll(/<h[1-3]\b[^>]*>(?:(?!<\/h[1-3]>)[\s\S]){0,240}?<span\b([^>]*)>\s*[\w'-]+(?:\s+[\w'-]+)?\s*<\/span>/g)) {
        if (/\bitalic\b|font-serif/.test(m[1])) continue;
        if (/text-(?!transparent\b|inherit\b)[\w/[\]#-]*(?:-\d{2,3}|primary|accent|brand)|color\s*:|font-mono|underline|decoration-/.test(m[1])) out.push({ line: ctx.lineOf(m.index), msg: 'one word in the heading has its own colour, font or underline' });
      }
      return out;
    },
  },
  {
    id: 'mono-heading', landing: true, severity: 'P2', title: 'Monospace used for headings',
    hint: 'Use monospace for identifiers, versions, hashes and code only.',
    scan(ctx) {
      const out = eachLine(ctx, (l) => (/<h[1-3]\b[^>]*\bfont-mono\b/.test(l) ? 'heading uses font-mono' : null));
      for (const b of declBlocks(ctx)) if (/(?:^|[\s,])h[1-3]\b|\.(?:title|page-title|heading)\b/.test(b.selector) && /mono|courier|menlo|consolas/i.test(b.decls['font-family'] || '')) out.push({ line: b.line, msg: `${b.selector} uses a monospace font` });
      return out;
    },
  },
  {
    id: 'kpi-card-row', severity: 'P2', title: 'One card per KPI',
    hint: 'Use one flat strip in a single bordered container, with dividers between figures and provenance next to the numbers.',
    scan(ctx) {
      const L = ctx.lines, big = [], out = [];
      L.forEach((l, i) => {
        if (!/\btext-(?:2xl|3xl|4xl|5xl)\b/.test(l)) return;
        const near = L.slice(Math.max(0, i - 3), i + 4).join('\n'), above = L.slice(Math.max(0, i - 4), i + 1).join('\n');
        if (/\btext-(?:xs|sm)\b|muted|label/i.test(near) && /\bborder\b|rounded|\bcard\b|<Card/i.test(above)) big.push(i);
      });
      for (let k = 0; k + 2 < big.length; k++) {
        const g1 = big[k + 1] - big[k], g2 = big[k + 2] - big[k + 1];
        if (g1 <= 14 && g2 <= 14 && Math.abs(g1 - g2) <= 3) { out.push({ line: big[k] + 1, msg: 'three or more sibling cards each hold one big number and a small label' }); break; }
      }
      const items = [];
      L.forEach((l, i) => { if (/\bvalue\s*:/.test(l)) { const w = L.slice(Math.max(0, i - 3), i + 4).join('\n'); if (/\blabel\s*:|\btitle\s*:/.test(w) && /\b(?:delta|change|trend|spark\w*)\s*:/.test(w)) items.push(i); } });
      if (!out.length && items.length >= 3 && items[2] - items[0] <= 30) out.push({ line: items[0] + 1, msg: 'KPI data items with value, label and delta render as separate cards' });
      return out;
    },
  },
  {
    id: 'punct-semicolon-in-copy', severity: 'P2', title: 'Semicolon inside UI copy',
    hint: 'Split the sentence in two, or join the parts with a comma or a full stop.',
    scan: (ctx) => punctScan(ctx, (s) => /\w;\s+[A-Za-z]/.test(s.replace(/&#?\w+;/g, '')) && !CSS_LIKE.test(s), 'semicolon in a sentence', 4),
  },
  {
    id: 'punct-colon-in-copy', severity: 'P2', title: 'Colon inside UI copy',
    hint: 'Let the layout carry the label, or write a full sentence with a comma or a full stop.',
    scan: (ctx) => punctScan(ctx, (s) => !/:\/\/|[{}=]|;|`/.test(s) && !/^\s*(?:\$|npm|npx|git|kubectl|docker|curl)\b/.test(s) && (/^[A-Z][A-Za-z ]{1,24}:\s+\S/.test(s.trim()) || (s.trim().split(/\s+/).length >= 4 && /[a-z]{3,}:\s+[a-z]/.test(s))), 'colon in a label or sentence', 2),
  },
  {
    id: 'punct-dash-separator', severity: 'P2', title: 'Spaced dash used as a separator',
    hint: 'Use a comma or a full stop, or put the second part in its own element.',
    scan: (ctx) => punctScan(ctx, (s) => {
      if (/[{}$]|\.\.\/|--/.test(s)) return false;
      for (const m of s.matchAll(/(\S+) [-–] (\S+)/g)) {
        const num = (x) => /^v?[+-]?\d/.test(x) || /\d$/.test(x);
        if (!(num(m[1]) && num(m[2]))) return true;
      }
      return false;
    }, 'spaced dash separates two parts of a text', 2),
  },
  {
    id: 'hard-offset-shadow', severity: 'P2', title: 'Hard offset block shadow',
    hint: 'Use a border, or a soft shadow on overlays only. A zero-blur offset shadow is a one-style costume.',
    scan(ctx) {
      const out = [];
      for (const s of shadowsIn(ctx)) if (!s.inset && s.blur === 0 && Math.abs(s.x) >= 4 && Math.abs(s.y) >= 4) out.push({ line: s.line, msg: `${s.x}px ${s.y}px shadow with no blur` });
      return out;
    },
  },
  {
    id: 'ghost-card', severity: 'P2', title: 'Hairline border plus wide soft shadow',
    hint: 'Declare elevation once. Use the border for resting cards and keep the shadow for overlays.',
    scan(ctx) {
      const out = [];
      const overlay = (line) => FLOATING.test(ctx.lines.slice(Math.max(0, line - 4), line + 1).join('\n'));
      for (const b of declBlocks(ctx)) {
        if (!/^\d*\.?\d+px\s+solid\b/.test(b.decls.border || '') || !b.decls['box-shadow'] || FLOATING.test(b.selector)) continue;
        const wide = shadowsIn({ text: `box-shadow:${b.decls['box-shadow']};`, lineOf: () => b.line }).some((s) => !s.inset && s.blur >= 16);
        if (wide) out.push({ line: b.line, msg: `${b.selector} has a border and a wide soft shadow` });
      }
      ctx.lines.forEach((l, i) => {
        if (/(?<![\w:-])border(?![\w-])/.test(l) && /(?<![\w:-])shadow-(?:lg|xl|2xl)\b/.test(l) && !overlay(i + 1) && !/\bborder-(?:0|none)\b/.test(l)) out.push({ line: i + 1, msg: 'border and a large shadow on the same element' });
      });
      return out;
    },
  },
  {
    id: 'radial-glow-background', severity: 'P2', title: 'Coloured radial glow behind content',
    hint: 'Use a flat page surface. A saturated radial wash is decoration, not information.',
    scan(ctx) {
      if (/chart|graph|heat|map/i.test(ctx.file)) return [];
      const out = [], text = ctx.text.replace(/\bbg-\[radial-gradient\(([^\]]*)\)\]/g, (m, b) => 'radial-gradient(' + b.replace(/_/g, ' ') + ')');
      for (const m of text.matchAll(/radial-gradient\(/g)) {
        const body = balanced(text, m.index + m[0].length - 1);
        if (!body) continue;
        const stops = [...body.matchAll(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)|\btransparent\b/gi)].map((c) => c[0].toLowerCase());
        const last = stops[stops.length - 1], lastRgb = parseColor(last);
        if (stops.length < 2 || !(last === 'transparent' || (lastRgb && lastRgb[3] === 0))) continue;
        const first = parseColor(stops[0]);
        if (!first || first[3] === 0 || hueSat(first).s <= 0.35) continue;
        out.push({ line: ctx.lineOf(m.index), msg: 'radial gradient fades a saturated colour into transparent' });
      }
      return out;
    },
  },
  {
    id: 'grid-line-background', severity: 'P2', title: 'Blueprint grid lines as a background',
    hint: 'Use a flat surface. Keep a grid only where it is the content, such as a canvas or a topology view.',
    scan(ctx) {
      if (/canvas|graph|topolog|blueprint|chart|editor|map/i.test(ctx.file)) return [];
      const out = [];
      for (const b of declBlocks(ctx)) {
        const bg = `${b.decls['background-image'] || ''} ${b.decls.background || ''}`;
        if ((bg.match(/linear-gradient\(/g) || []).length >= 2 && /\b1px\b/.test(bg) && /^\d*\.?\d+px(?:\s+\d*\.?\d+px)?$/.test((b.decls['background-size'] || '').trim())) out.push({ line: b.line, msg: `${b.selector} draws grid lines with two 1px gradients` });
      }
      ctx.lines.forEach((l, i) => { if (/(?<![\w-])bg-grid(?:-[\w/[\]]+)?(?![\w-])/.test(l) || (/bg-\[(?:linear-gradient|image)/.test(l) && (l.match(/linear-gradient\(/g) || []).length >= 2 && /1px/.test(l) && /bg-\[size:/.test(l))) out.push({ line: i + 1, msg: 'grid-line background utility' }); });
      return out;
    },
  },
  {
    id: 'stripes-gradient', severity: 'P2', title: 'Repeating stripe gradient as a surface',
    hint: 'Use a flat surface. Keep stripes for determinate progress bars and chart hatching.',
    scan: (ctx) => eachLine(ctx, (l, i) => {
      if (!/repeating-(?:linear|radial)-gradient|bg-\[repeating-/.test(l)) return null;
      const near = ctx.lines.slice(Math.max(0, i - 3), i + 1).join('\n');
      return /progress|hatch|legend|chart|meter|skeleton|loading/i.test(near) ? null : 'repeating gradient used as a surface';
    }),
  },
  {
    id: 'pulsing-status-dot', severity: 'P2', title: 'Pulsing status dot',
    hint: 'Show state with a static dot and a text label. Pulse only when it reflects a real live signal, and say so in an ignore reason.',
    scan(ctx) {
      const out = eachLine(ctx, (l) => {
        if (!/\brounded-full\b/.test(l) || /\b(?:h|w|size)-(?:[4-9]|\d{2,})\b|\b(?:h|w|size)-\[(?:1[3-9]|[2-9]\d|\d{3,})px\]/.test(l)) return null;
        if (/\banimate-ping\b/.test(l)) return 'ping animation on a dot';
        return /\banimate-pulse\b/.test(l) && /\b(?:h|w|size)-(?:0\.5|1\.5|2\.5|1|2|3)(?![\w.])/.test(l) ? 'pulse animation on a small dot' : null;
      });
      for (const b of declBlocks(ctx)) {
        const px = (k) => { const m = (b.decls[k] || '').match(/^(\d*\.?\d+)px$/); return m ? +m[1] : null; };
        const w = px('width'), h = px('height'), a = b.decls.animation || b.decls['animation-name'] || '';
        if (w !== null && h !== null && w <= 12 && h <= 12 && /\b(?:pulse|ping|blink|beat|breathe|glow)\w*\b/i.test(a) && /infinite/.test(b.decls.animation || '')) out.push({ line: b.line, msg: `${b.selector} is a ${w}px dot with an infinite pulse` });
      }
      return out;
    },
  },
  {
    id: 'marquee', severity: 'P2', title: 'Auto-scrolling marquee strip',
    hint: 'Show the items in a static row or grid. Auto-scrolling content is hard to read and cannot be paused by default.',
    scan(ctx) {
      const out = eachLine(ctx, (l) => (/<marquee\b/i.test(l) ? 'marquee element' : /(?:class|className)\s*=\s*["'{`][^"'`]*(?<![\w-])(?:animate-)?marquee(?![\w-])/.test(l) || /animation(?:-name)?\s*:[^;]*marquee/i.test(l) ? 'marquee animation class' : null));
      for (const k of ctx.text.matchAll(/@keyframes\s+([\w-]+)\s*\{([\s\S]*?\})\s*\}/g)) {
        if (!/translate(?:X|3d)?\(\s*-(?:50|100)%/i.test(k[2])) continue;
        const use = ctx.text.match(new RegExp(`animation[^;]*\\b${k[1]}\\b[^;]*(?:linear[^;]*infinite|infinite[^;]*linear)|animation[^;]*(?:linear[^;]*infinite|infinite[^;]*linear)[^;]*\\b${k[1]}\\b`));
        if (use) out.push({ line: ctx.lineOf(use.index), msg: `keyframes ${k[1]} slide a track sideways forever` });
      }
      return out;
    },
  },
  {
    id: 'transition-all', severity: 'P2', title: 'transition: all',
    hint: 'Name the properties that change, for example opacity and transform. It avoids animating layout by accident.',
    scan: (ctx) => eachLine(ctx, (l) => (/transition(?:-property)?\s*:\s*(?:['"`])?all\b/.test(l) || /(?<![\w-])(?:[\w-]+:)*transition-all(?![\w-])/.test(l) ? 'transition on all properties' : null)),
  },
  {
    id: 'ease-in-ui', severity: 'P2', title: 'ease-in easing on a UI transition',
    hint: 'Use ease-out for things that appear and ease-in-out for things that move. An ease-in start feels slow to respond.',
    scan: (ctx) => eachLine(ctx, (l) => (/(?<![\w-])(?:[\w-]+:)*ease-in(?![\w-])/.test(l.replace(/animation[^;}]*/g, '')) || /transition(?:-timing-function)?\s*:[^;{}]*(?<![\w-])ease-in(?![\w-])/.test(l) || /cubic-bezier\(\s*0?\.4\s*,\s*0\s*,\s*1\s*,\s*1\s*\)/.test(l) || /\bease\s*:\s*['"]easeIn['"]/.test(l) ? 'ease-in on a transition' : null)),
  },
  {
    id: 'scale-zero-entrance', severity: 'P2', title: 'Element scales up from zero',
    hint: 'Start from 0.95 to 0.98 together with opacity. Nothing in the physical world grows from a point.',
    scan: (ctx) => eachLine(ctx, (l) => (/(?:\b(?:transform|translate\w*|rotate|matrix)\b[^;\n]*|["'`]\s*)scale\(\s*0(?:\.0+)?\s*(?:,\s*0(?:\.0+)?\s*)?\)/.test(l) || /(?<![\w-])(?:[\w-]+:)*scale-0(?![\w.-])/.test(l) || /\bscale\s*:\s*0\s*[,}]/.test(l) ? 'scale starts at zero' : null)),
  },
  {
    id: 'bounce-easing', severity: 'P2', title: 'Overshoot, bounce or elastic easing',
    hint: 'Use a plain ease-out curve. Overshoot on controls reads as playful and slow in a work tool.',
    scan: (ctx) => eachLine(ctx, (l, i) => {
      for (const m of l.matchAll(/cubic-bezier\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)/g)) if (+m[2] < 0 || +m[2] > 1 || +m[4] < 0 || +m[4] > 1) return 'cubic-bezier curve overshoots';
      if (/['"`](?:ease)?(?:In|Out|InOut)?(?:Back|Elastic|Bounce)['"`]/.test(l)) return 'back, elastic or bounce easing name';
      const b = l.match(/\bbounce\s*:\s*(0?\.[4-9]\d*|1(?:\.0+)?)\b/);
      return b && /\bspring\b/.test(ctx.lines.slice(Math.max(0, i - 2), i + 1).join('\n')) ? `spring with bounce ${b[1]}` : null;
    }),
  },
  {
    id: 'extreme-negative-tracking', severity: 'P2', title: 'Letter spacing so tight that glyphs merge',
    hint: 'Keep tracking between -0.05em and 0 for display type, and 0 for text. Tight tracking hurts reading speed.',
    scan(ctx) {
      const out = eachLine(ctx, (l) => {
        for (const m of l.matchAll(/(?:letter-spacing\s*:|letterSpacing\s*:\s*['"`]?|\btracking-\[)\s*(-\d*\.?\d+)em/g)) if (+m[1] < -0.05) return `letter spacing ${m[1]}em`;
        return null;
      });
      for (const b of declBlocks(ctx)) {
        const ls = (b.decls['letter-spacing'] || '').match(/^(-\d*\.?\d+)px$/), fs = (b.decls['font-size'] || '').match(/^(\d*\.?\d+)px$/);
        if (ls && fs && +ls[1] / +fs[1] < -0.05) out.push({ line: b.line, msg: `${b.selector} tracks ${ls[1]}px on ${fs[1]}px type` });
      }
      return out;
    },
  },
  {
    id: 'focus-ring-removed', severity: 'P0', title: 'Focus outline removed with no replacement',
    hint: 'Keep a visible keyboard focus style. Replace the outline with a ring, a border or an outline on :focus-visible, never with nothing.',
    scan(ctx) {
      if (ctx.kind === 'md') return [];
      const none = /^(?:none|0|0 none)$/i;
      const out = [];
      const replaced = declBlocks(ctx).some((b) => /:focus/.test(b.selector.replace(/:not\([^)]*\)/g, '')) && ((b.decls.outline && !none.test(b.decls.outline.trim())) || (b.decls['box-shadow'] && !/^none$/i.test(b.decls['box-shadow'])) || b.decls['border-color'] || b.decls.border));
      for (const b of declBlocks(ctx)) {
        const o = b.decls.outline ?? b.decls['outline-style'];
        if (o === undefined || !none.test(o.trim())) continue;
        if (/:not\(:focus|\[tabindex=["']?-1|::?-moz-focus-inner|:active|:hover/.test(b.selector)) continue;
        if (b.decls['box-shadow'] && !/^none$/i.test(b.decls['box-shadow'])) continue;
        if (replaced) continue;
        out.push({ line: b.line, msg: `${b.selector} removes the outline and nothing replaces it` });
      }
      const focusWithin = /focus-within:/.test(ctx.text);
      ctx.lines.forEach((l, i) => {
        const hit = [...l.matchAll(/(?<![\w-])((?:[\w-]+:)*)outline-(?:none|0)(?![\w-])/g)].find((m) => !/hover|active|disabled/.test(m[1]));
        const inline = /\boutline\s*:\s*['"](?:none|0)['"]/.test(l);
        if (!hit && !inline) return;
        const near = ctx.lines.slice(Math.max(0, i - 4), i + 5).join('\n');
        if (/tabIndex=\{-1\}|tabindex=["']-1/.test(near) || focusWithin) return;
        if (/(?:focus|focus-visible|group-focus|peer-focus)(?:-visible)?:(?:ring|outline(?!-(?:none|0|hidden)(?![\w-]))|border|shadow|bg|underline|text|after|before)|data-\[(?:highlighted|focus)/.test(near)) return;
        if (inline && /boxShadow|border/.test(near)) return;
        out.push({ line: i + 1, msg: 'outline removed and no focus style nearby' });
      });
      return out;
    },
  },
  {
    id: 'missing-tabular-nums', severity: 'P2', title: 'Numeric table cells with no tabular figures',
    hint: 'Set font-variant-numeric: tabular-nums (Tailwind tabular-nums) on figures, and right-align them, so digits line up.',
    project: true,
    scan(ctx) {
      const t = (ctx.state.tnum ||= { table: null, covered: ctx.opts.figureFace === 'mono' });
      if (ctx.kind === 'md') return [];
      const NUM_CELL = /<(?:td|TableCell)\b[^>]*(?:text-right|align=["']right|textAlign\s*:\s*['"]right)|<(?:td|TableCell)\b[^>]*>\s*(?:\{[^}]*\b(?:count|total|amount|size|bytes|ms|latency|score|percent|pct|rate|duration|qty|price|cost|num\w*)\b[^}]*\}|[\d][\d,.]*\s*%?)\s*</i;
      ctx.lines.forEach((l, i) => {
        if (/tabular-nums|font-variant-numeric|\btnum\b|font-feature-settings/i.test(l)) t.covered = true;
        if (NUM_CELL.test(l)) { if (/font-mono|monospace/.test(l)) t.covered = true; else if (!t.table) t.table = { file: ctx.file, line: i + 1, snippet: ctx.orig[i] }; }
      });
      if (ctx.kind === 'style') for (const b of declBlocks(ctx)) if (/(?:^|[\s,>])(?:td|th)\b|cell/i.test(b.selector) && /right/.test(b.decls['text-align'] || '') && !t.table) t.table = { file: ctx.file, line: b.line, snippet: b.selector };
      return [];
    },
    finalize(state) {
      const t = state.tnum;
      return t && t.table && !t.covered ? [{ ...t.table, msg: 'right-aligned or numeric table cells, but no tabular figures anywhere in the project' }] : [];
    },
  },
  {
    id: 'cream-clay-palette', severity: 'P2', title: 'Warm cream ground with a clay accent',
    hint: 'Choose the ground and accent from the product, not from the editorial default of cream paper with a terracotta accent.',
    scan(ctx) {
      if (ctx.kind === 'md' || /print/i.test(ctx.file)) return [];
      let cream = 0, clay = false;
      ctx.lines.forEach((l, i) => {
        for (const m of l.matchAll(/(?<![&\w#])#[0-9a-fA-F]{6}\b|rgba?\(\s*\d+[\s,]+\d+[\s,]+\d+[^)]*\)/g)) {
          const c = parseColor(m[0]);
          if (!c || c[3] < 1) continue;
          const { h, s } = hueSat(c), l2 = (Math.max(c[0], c[1], c[2]) + Math.min(c[0], c[1], c[2])) / 510;
          if (h >= 35 && h <= 60 && s >= 0.15 && s <= 0.5 && l2 >= 0.93 && l2 <= 0.99 && !cream) cream = i + 1;
          if (h >= 10 && h <= 30 && s >= 0.4 && l2 >= 0.25 && l2 <= 0.6) clay = true;
        }
      });
      return cream && clay ? [{ line: cream, msg: 'warm off-white ground and a terracotta accent in the same file' }] : [];
    },
  },
  {
    id: 'aphoristic-cadence', severity: 'P2', title: 'Rebuttal-style slogans repeated in copy',
    landing: true,
    hint: 'Say what the product does in one plain sentence. Repeated "Not X. A Y." and "No X. No Y." endings read as generated.',
    scan(ctx) {
      if (ctx.kind === 'style') return [];
      const RES = [/\bNot (?:a|an|the|just|only)\s+[\w'-]+(?: [\w'-]+){0,4}\.\s+(?:A|An|The|It's|It is|Just|Your|Our)\b/g, /\bNo [\w-]+(?: [\w-]+)?\.\s+No [\w-]+/g, /\bLess [\w-]+\.\s+More [\w-]+/g, /[a-z]{3}\.\s+Just [a-z]+/g];
      let n = 0, first = 0;
      ctx.lines.forEach((l, i) => {
        for (const seg of segments(l, ctx.kind)) for (const re of RES) { const k = [...seg.matchAll(re)].length; if (k && !first) first = i + 1; n += k; }
      });
      return n >= 3 ? [{ line: first, msg: `${n} rebuttal-style slogans in one file` }] : [];
    },
  },
  {
    id: 'placeholder-person-data', severity: 'P2', title: 'Textbook placeholder names and addresses',
    hint: 'Use realistic, varied sample data, or label the sample as sample data. Names like John Doe and Acme mark an unfinished screen.',
    scan(ctx) {
      if (ctx.kind === 'style' || /(^|\/)(?:fixtures?|mocks?|__mocks__|seeds?)\//i.test(ctx.file)) return [];
      const re = /\b(?:John|Jane) (?:Doe|Smith)\b|\bAcme(?: (?:Inc|Corp|Co|Ltd|Corporation)\b\.?)?(?![\w-])|\bFirstname Lastname\b|\b123 Main St(?:reet)?\b/;
      return eachLine(ctx, (l) => (/\bplaceholder\s*[=:]/.test(l) ? null : segments(l, ctx.kind).some((x) => re.test(x)) ? 'textbook placeholder person, company or address' : null));
    },
  },
];

/* ---------- profiles ---------- */
// "persuade" runs every rule (the 0.1.0 behaviour). "operate" is for working screens such as consoles and
// dashboards. It switches off rules marked `landing` and relaxes the tracked-caps limit.
export const PROFILES = ['operate', 'persuade'];
const OPERATE_OPTIONS = { maxCapsLabels: 8 };
export function profileFor(file, cfg = {}) {
  for (const o of cfg.profileOverrides || []) if (matchAny(o.paths, file)) return o.profile;
  return cfg.profile || 'persuade';
}

export const RULE_IDS = RULES.map((r) => r.id);

/* ---------- lint engine ---------- */

const IGNORE_RE = /ui-slop-ignore(-file)?\s+([\w*,-]+)\s*(?::\s*(.*?))?\s*(?:\*\/|-->|\}\s*\}?\s*)?$/;
const normSnippet = (s) => s.trim().replace(/\s+/g, ' ').slice(0, 160);

/** A config override for a rule, looked up by id and then by any older alias. */
const override = (cfg, rule) => [rule.id, ...(rule.aliases || [])].map((k) => (cfg.rules || {})[k]).find((v) => v !== undefined);

export function kindOf(ext) { return ext === 'css' || ext === 'scss' ? 'style' : ext === 'md' ? 'md' : 'markup'; }

export function lintText(file, text, cfg = {}, state = {}) {
  cfg = cfg || {};
  const ext = path.extname(file).slice(1).toLowerCase();
  const operate = profileFor(file, cfg) === 'operate';
  const opts = { ...DEFAULTS, ...(operate ? OPERATE_OPTIONS : {}), ...(cfg.options || {}) };
  const stripped = stripComments(text, ext);
  const lines = stripped.split(/\r?\n/), orig = text.split(/\r?\n/);
  const offsets = []; let o = 0;
  for (const l of stripped.split('\n')) { offsets.push(o); o += l.length + 1; }
  const lineOf = (idx) => { let lo = 0, hi = offsets.length - 1; while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (offsets[mid] <= idx) lo = mid; else hi = mid - 1; } return lo + 1; };
  const ctx = { file, ext, kind: kindOf(ext), lines, orig, text: stripped, opts, cfg, isToken: matchAny(cfg.tokenFiles, file), state, lineOf };

  const findings = [];
  const ignores = [];
  orig.forEach((l, i) => {
    const m = l.match(IGNORE_RE);
    if (!m) return;
    const reason = (m[3] || '').trim();
    if (!reason) {
      findings.push({ rule: 'ignore-without-reason', severity: 'P1', file, line: i + 1, snippet: normSnippet(l), message: 'ui-slop-ignore needs a reason after the colon', hint: 'Write: ui-slop-ignore rule-id: why this use is legitimate' });
      return;
    }
    ignores.push({ line: i + 1, file: !!m[1], rules: new Set(m[2].split(',')), reason });
  });
  const ignored = (rule, line) => ignores.some((g) => (g.rules.has(rule.id) || (rule.aliases || []).some((a) => g.rules.has(a)) || g.rules.has('*')) && (g.file || g.line === line || g.line === line - 1));

  let suppressed = 0;
  for (const rule of RULES) {
    const ov = override(cfg, rule);
    if (ov === 'off' || ov === false || (operate && rule.landing)) continue;
    for (const r of rule.scan(ctx) || []) {
      if (ignored(rule, r.line)) { suppressed++; continue; }
      const sev = SEV[ov] !== undefined ? ov : r.severity || rule.severity;
      findings.push({ rule: rule.id, severity: sev, file, line: r.line, snippet: normSnippet(orig[r.line - 1] ?? ''), message: r.msg || rule.title, hint: rule.hint });
    }
  }
  findings.sort((a, b) => a.line - b.line || a.rule.localeCompare(b.rule));
  return { findings, suppressed };
}

export function finalizeProject(state, cfg = {}) {
  const out = [];
  for (const rule of RULES) {
    if (!rule.finalize) continue;
    const ov = override(cfg, rule);
    if (ov === 'off' || ov === false) continue;
    for (const r of rule.finalize(state) || []) out.push({ rule: rule.id, severity: SEV[ov] !== undefined ? ov : rule.severity, file: r.file, line: r.line, snippet: normSnippet(r.snippet), message: r.msg, hint: rule.hint });
  }
  return out;
}

/* ---------- file walking ---------- */

const DEFAULT_IGNORE = ['node_modules', '.git', '.next', 'dist', 'build', 'out', 'coverage', '.turbo', '.svelte-kit', 'vendor', '*.min.*', '*.test.*', '*.spec.*', '__tests__', '__snapshots__', '*.d.ts', '*.stories.*'];
const DEFAULT_EXT = ['tsx', 'jsx', 'vue', 'svelte', 'html', 'htm', 'css', 'scss'];
const BLOB_NAME = /^(?:.*[-_])?(?:blobs?|waves?|squiggle)(?:[-_].*)?\.(?:svg|png|webp)$/i;

export function collectFiles(targets, root, cfg = {}) {
  const exts = new Set(cfg.extensions || DEFAULT_EXT);
  const ignore = [...DEFAULT_IGNORE, ...(cfg.ignore || []).map((g) => (typeof g === 'string' ? g : g.path))];
  for (const g of cfg.ignore || []) if (typeof g === 'object' && !g.reason) throw new Error(`ignore entry ${g.path} needs a reason`);
  const md = cfg.markdown || [];
  const files = [];
  const rel = (p) => path.relative(root, p).split(path.sep).join('/');
  const visit = (p) => {
    const r = rel(p) || '.';
    let st;
    try { st = fs.lstatSync(p); } catch { return; }
    if (st.isSymbolicLink()) return;
    if (r !== '.' && matchAny(ignore, r)) return;
    if (st.isDirectory()) { for (const n of fs.readdirSync(p).sort()) visit(path.join(p, n)); return; }
    const ext = path.extname(p).slice(1).toLowerCase();
    if (BLOB_NAME.test(path.basename(p))) files.push({ abs: p, rel: r, nameOnly: true });
    else if (st.size < 1_000_000 && (exts.has(ext) || (ext === 'md' && matchAny(md, r)))) files.push({ abs: p, rel: r });
  };
  for (const t of targets) visit(path.resolve(t));
  return files;
}

export function lintFiles(targets, root, cfg = {}) {
  const state = {}, findings = []; let suppressed = 0, scanned = 0;
  for (const f of collectFiles(targets, root, cfg)) {
    if (f.nameOnly) {
      if ((cfg.rules || {})['decorative-blob'] !== 'off') findings.push({ rule: 'decorative-blob', severity: (cfg.rules || {})['decorative-blob'] || 'P2', file: f.rel, line: 1, snippet: path.basename(f.abs), message: 'file name suggests a blob or wave graphic', hint: RULES.find((r) => r.id === 'decorative-blob').hint });
      continue;
    }
    scanned++;
    const r = lintText(f.rel, fs.readFileSync(f.abs, 'utf8'), cfg, state);
    findings.push(...r.findings); suppressed += r.suppressed;
  }
  findings.push(...finalizeProject(state, cfg));
  return { findings, suppressed, scanned };
}

/* ---------- baseline ---------- */

const RENAMED = Object.fromEntries(RULES.flatMap((r) => (r.aliases || []).map((a) => [a, r.id])));
const renamed = (key) => { const i = key.indexOf('|'); return RENAMED[key.slice(0, i)] ? RENAMED[key.slice(0, i)] + key.slice(i) : key; };

export const findingKey = (f) => `${f.rule}|${f.file}|${normSnippet(f.snippet)}`;

export function buildBaseline(findings) {
  const m = new Map();
  for (const f of findings) m.set(findingKey(f), (m.get(findingKey(f)) || 0) + 1);
  return { version: 1, tool: 'ui-slop-lint', findings: [...m].map(([key, count]) => ({ key, count })).sort((a, b) => a.key.localeCompare(b.key)) };
}

/** Marks each finding `baselined: true` when the baseline still has an unused slot for its key. */
export function applyBaseline(findings, baseline) {
  const left = new Map();
  for (const b of baseline?.findings || []) { const k = renamed(b.key); left.set(k, (left.get(k) || 0) + b.count); }
  for (const f of findings) {
    const k = findingKey(f), n = left.get(k) || 0;
    f.baselined = n > 0;
    if (n > 0) left.set(k, n - 1);
  }
  return findings;
}

/* ---------- safe fixes ---------- */

export const SAFE_FIXES = [
  { id: 'em-dash', what: 'replace " \u2014 " with ", " in JSX/HTML text nodes and Markdown prose (never in string literals or attributes)' },
  { id: 'arrow-suffix', what: 'remove a trailing arrow glyph from JSX/HTML text nodes' },
];

export function safeFix(file, text, cfg = {}) {
  const ext = path.extname(file).slice(1).toLowerCase(), kind = kindOf(ext);
  if (kind === 'style') return { text, changes: [] };
  const stripped = stripComments(text, ext).split(/\r?\n/), orig = text.split(/\r?\n/), changes = [];
  const off = (id) => (cfg.rules || {})[id] === 'off';
  let fence = false;
  const out = orig.map((line, i) => {
    const s = stripped[i];
    if (kind === 'md') { if (/^\s*(```|~~~)/.test(line)) fence = !fence; if (fence || /^\s*(```|~~~)/.test(line) || /`/.test(line)) return line; }
    const spans = [];
    if (kind === 'md') spans.push([0, line.length]);
    else {
      for (const m of s.matchAll(JSX_TEXT)) spans.push([m.index + 1, m.index + m[0].length]);
      if (PURE_TEXT.test(s) && !CODE_START.test(s) && !CODEISH.test(s) && !spans.length) spans.push([0, line.length]);
    }
    let res = line;
    for (const [a, b] of spans.sort((x, y) => y[0] - x[0])) {
      let seg = res.slice(a, b);
      if (/^\s*[A-Z][A-Z0-9 ]{1,24} \u2014 /.test(seg)) continue;
      let n = seg;
      if (!off('em-dash')) n = n.replace(/(\S) \u2014 (\S)/g, '$1, $2');
      if (kind !== 'md' && !off('arrow-suffix')) n = n.replace(/(\S)\s*(?:→|&rarr;)(\s*)$/, '$1$2');
      if (n !== seg) res = res.slice(0, a) + n + res.slice(b);
    }
    if (res !== line) changes.push({ line: i + 1, before: line, after: res });
    return res;
  });
  return { text: out.join(text.includes('\r\n') ? '\r\n' : '\n'), changes };
}

/* ---------- output formats ---------- */

export function toSarif(findings) {
  const level = { P0: 'error', P1: 'warning', P2: 'note' };
  return {
    $schema: 'https://json.schemastore.org/sarif-2.1.0.json', version: '2.1.0',
    runs: [{
      tool: { driver: { name: 'ui-slop-lint', version: VERSION, rules: [...RULES.map((r) => ({ id: r.id, name: r.title, shortDescription: { text: r.title }, help: { text: r.hint }, defaultConfiguration: { level: level[r.severity] } })), { id: 'ignore-without-reason', shortDescription: { text: 'Ignore comment without a reason' } }] } },
      results: findings.filter((f) => !f.baselined).map((f) => ({ ruleId: f.rule, level: level[f.severity], message: { text: `${f.message}. ${f.hint}` }, locations: [{ physicalLocation: { artifactLocation: { uri: f.file }, region: { startLine: f.line, snippet: { text: f.snippet } } } }] })),
    }],
  };
}

/* ---------- CLI ---------- */

const USAGE = `ui-slop-lint ${VERSION}
Usage: ui-slop-lint [paths...] [options]
  --config <file>        config file (default: ui-slop.config.json in --root, if present)
  --root <dir>           base for relative paths in reports (default: cwd)
  --json | --sarif       machine-readable output
  --fail-on <P0|P1|P2|none>   lowest severity that fails the run (default P1)
  --baseline <file>      ignore findings recorded in the baseline; fail only on new ones
  --update-baseline      write all current findings to the baseline file and exit 0
  --show-baselined       also print findings covered by the baseline
  --fix-safe [--write]   apply mechanical text fixes (dry run unless --write)
  --profile <operate|persuade>  rule profile (default persuade, or the config value)
  --list-rules           print the rule table
Exit codes: 0 clean, 1 findings at or above --fail-on, 2 usage error.`;

function parseArgs(argv) {
  const a = { paths: [], failOn: 'P1' };
  const need = (i, n) => { if (argv[i + 1] === undefined) throw new Error(`${n} needs a value`); return argv[i + 1]; };
  for (let i = 0; i < argv.length; i++) {
    const x = argv[i];
    if (x === '--json') a.json = true;
    else if (x === '--sarif') a.sarif = true;
    else if (x === '--fix-safe') a.fix = true;
    else if (x === '--write') a.write = true;
    else if (x === '--update-baseline') a.update = true;
    else if (x === '--show-baselined') a.showBaselined = true;
    else if (x === '--list-rules') a.list = true;
    else if (x === '--help' || x === '-h') a.help = true;
    else if (['--config', '--root', '--baseline', '--fail-on', '--profile'].includes(x)) { a[{ '--config': 'config', '--root': 'root', '--baseline': 'baseline', '--fail-on': 'failOn', '--profile': 'profile' }[x]] = need(i, x); if (x === '--fail-on') a.failOnSet = true; i++; }
    else if (x.startsWith('--')) throw new Error(`unknown option ${x}`);
    else a.paths.push(x);
  }
  if (!['P0', 'P1', 'P2', 'none'].includes(a.failOn)) throw new Error('--fail-on must be P0, P1, P2 or none');
  if (a.profile !== undefined && !PROFILES.includes(a.profile)) throw new Error('--profile must be operate or persuade');
  if (a.write && !a.fix) throw new Error('--write only works with --fix-safe');
  return a;
}

export function loadConfig(root, file) {
  const p = file ? path.resolve(file) : path.join(root, 'ui-slop.config.json');
  if (!fs.existsSync(p)) {
    if (file) throw new Error(`config file not found: ${file}`);
    return {};
  }
  let cfg;
  try { cfg = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { throw new Error(`invalid config ${p}: ${e.message}`); }
  const bad = [cfg.profile, ...(cfg.profileOverrides || []).map((o) => o.profile)].find((v) => v !== undefined && !PROFILES.includes(v));
  if (bad !== undefined) throw new Error(`invalid config ${p}: profile must be one of ${PROFILES.join(', ')}, got ${JSON.stringify(bad)}`);
  return cfg;
}

export function main(argv) {
  let args;
  try { args = parseArgs(argv); } catch (e) { process.stderr.write(`${e.message}\n${USAGE}\n`); return 2; }
  if (args.help) { process.stdout.write(USAGE + '\n'); return 0; }
  if (args.list) { for (const r of RULES) process.stdout.write(`${r.severity}  ${r.id.padEnd(26)} ${r.title}${r.landing ? ' (off in the operate profile)' : ''}\n`); return 0; }
  const root = path.resolve(args.root || process.cwd());
  let cfg;
  try { cfg = loadConfig(root, args.config); } catch (e) { process.stderr.write(e.message + '\n'); return 2; }
  if (args.profile) cfg = { ...cfg, profile: args.profile };
  const effFail = args.failOnSet ? args.failOn : cfg.failOn || args.failOn;
  const targets = args.paths.length ? args.paths : [root];

  if (args.fix) {
    let total = 0, list;
    try { list = collectFiles(targets, root, cfg); } catch (e) { process.stderr.write(e.message + '\n'); return 2; }
    for (const f of list) {
      if (f.nameOnly) continue;
      const src = fs.readFileSync(f.abs, 'utf8'), r = safeFix(f.rel, src, cfg);
      if (!r.changes.length) continue;
      total += r.changes.length;
      for (const c of r.changes) process.stdout.write(`${f.rel}:${c.line}\n- ${c.before.trim()}\n+ ${c.after.trim()}\n`);
      if (args.write) fs.writeFileSync(f.abs, r.text);
    }
    process.stdout.write(`${total} safe fix${total === 1 ? '' : 'es'} ${args.write ? 'applied' : 'found (dry run, pass --write to apply)'}\n`);
    return 0;
  }

  let result;
  try { result = lintFiles(targets, root, cfg); } catch (e) { process.stderr.write(e.message + '\n'); return 2; }
  const { findings, suppressed, scanned } = result;
  if (args.update) {
    if (!args.baseline) { process.stderr.write('--update-baseline needs --baseline <file>\n'); return 2; }
    fs.writeFileSync(path.resolve(args.baseline), JSON.stringify(buildBaseline(findings), null, 2) + '\n');
    process.stdout.write(`baseline written: ${findings.length} findings in ${args.baseline}\n`);
    return 0;
  }
  if (!args.baseline && cfg.baseline && !args.update && fs.existsSync(path.resolve(root, cfg.baseline))) args.baseline = path.resolve(root, cfg.baseline);
  if (args.baseline) {
    const bp = path.resolve(args.baseline);
    if (!fs.existsSync(bp)) { process.stderr.write(`baseline not found: ${args.baseline} (create it with --update-baseline)\n`); return 2; }
    applyBaseline(findings, JSON.parse(fs.readFileSync(bp, 'utf8')));
  }
  const fresh = findings.filter((f) => !f.baselined);
  const failing = effFail === 'none' ? [] : fresh.filter((f) => SEV[f.severity] <= SEV[effFail]);
  const shown = args.showBaselined ? findings : fresh;

  if (args.sarif) process.stdout.write(JSON.stringify(toSarif(findings), null, 2) + '\n');
  else if (args.json) {
    const counts = {};
    for (const f of fresh) counts[f.rule] = (counts[f.rule] || 0) + 1;
    process.stdout.write(JSON.stringify({ version: VERSION, scanned, suppressed, total: findings.length, new: fresh.length, counts, findings: shown }, null, 2) + '\n');
  } else {
    for (const f of shown) process.stdout.write(`${f.file}:${f.line}  ${f.severity}  ${f.rule}${f.baselined ? ' (baseline)' : ''}\n    ${f.snippet}\n    ${f.message}. ${f.hint}\n`);
    const by = { P0: 0, P1: 0, P2: 0 };
    for (const f of fresh) by[f.severity]++;
    process.stdout.write(`${scanned} files scanned, ${fresh.length} findings (P0 ${by.P0}, P1 ${by.P1}, P2 ${by.P2})${findings.length !== fresh.length ? `, ${findings.length - fresh.length} in baseline` : ''}${suppressed ? `, ${suppressed} ignored by comment` : ''}\n`);
  }
  return failing.length ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href) process.exitCode = main(process.argv.slice(2));

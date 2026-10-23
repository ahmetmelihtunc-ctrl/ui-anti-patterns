// Labelled detection corpus. Each case is a small UI snippet.
//   P(id, file, code, ...'rule:line')  a positive. Every listed rule must fire on that line.
//   N(id, file, code, ...rules)        a hard negative. None of the listed rules may fire.
// Only the rules named in a case are scored for that case.
// Dashes and emoji are written as escapes so the repo's prose check stays clean.
const EM = '—';
const ROCKET = '\u{1F680}';
const SPARKLE = '✨';
const FLAG = '\u{1F1F9}\u{1F1F7}';

export const cases = [];
const P = (id, file, code, ...exp) => cases.push({ id, file, code, expect: exp.map((e) => e.split(':')), forbid: [] });
const N = (id, file, code, ...rules) => cases.push({ id, file, code, expect: [], forbid: rules });
const withConfig = (config) => { cases[cases.length - 1].config = config; };
const project = (id, files, expect, forbid) => cases.push({ id, files, code: '', file: files[0].name, expect: expect.map((e) => e.split(':')), forbid });

/* default-indigo */
P('indigo-hex-css', 'a.css', '.btn { background: #6366f1; }', 'default-indigo:1');
P('indigo-class', 'a.tsx', 'const a = <button className="bg-indigo-600 text-white">Save</button>;', 'default-indigo:1');
N('indigo-other-hex', 'a.css', '.btn { background: #10b981; }', 'default-indigo');
N('indigo-in-token-file', 'tokens.css', ':root { --accent: #6366f1; }', 'default-indigo');
withConfig({ tokenFiles: ['tokens.css'] });

/* two-stop-gradient */
P('gradient-css', 'a.css', '.hero { background: linear-gradient(135deg, #667eea, #764ba2); }', 'two-stop-gradient:1');
P('gradient-tailwind', 'a.tsx', 'const a = <div className="bg-gradient-to-r from-purple-500 to-blue-500" />;', 'two-stop-gradient:1');
N('gradient-warm', 'a.css', '.sun { background: linear-gradient(to right, #f97316, #facc15); }', 'two-stop-gradient');
N('gradient-tonal-blue', 'a.css', '.area { background: linear-gradient(#3b82f6, #60a5fa); }', 'two-stop-gradient');
N('gradient-same-hue-tailwind', 'a.tsx', 'const a = <div className="bg-gradient-to-b from-blue-500 to-blue-700" />;', 'two-stop-gradient');

/* gradient-text */
P('gtext-tailwind', 'a.tsx', 'const a = <h1 className="bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">Hi</h1>;', 'gradient-text:1');
P('gtext-css', 'a.css', '.t {\n  -webkit-background-clip: text;\n}', 'gradient-text:2');
N('gtext-clip-padding', 'a.tsx', 'const a = <div className="bg-clip-padding p-4">x</div>;', 'gradient-text');
N('gtext-transparent-border', 'a.tsx', 'const a = <button className="border border-transparent">x</button>;', 'gradient-text');

/* emoji-ui */
P('emoji-heading', 'a.tsx', `const a = <h2>${ROCKET} Launch</h2>;`, 'emoji-ui:1');
P('emoji-button', 'a.tsx', `const a = <button>${SPARKLE} Generate</button>;`, 'emoji-ui:1');
N('emoji-plain', 'a.tsx', 'const a = <h2>Launch</h2>;', 'emoji-ui');
N('emoji-check-glyph', 'a.tsx', 'const a = <h2>Release notes ✓</h2>;', 'emoji-ui');
N('emoji-copyright', 'a.tsx', 'const a = <li>© 2026 Example</li>;', 'emoji-ui');
N('emoji-flag-data-file', 'flags.tsx', `const a = <li>${FLAG} Turkish</li>;`, 'emoji-ui');
withConfig({ emojiAllowFiles: ['flags.tsx'] });

/* frosted-glass */
P('glass-css', 'a.css', '.card {\n  backdrop-filter: blur(12px);\n}', 'frosted-glass:2');
P('glass-tailwind', 'a.tsx', 'const a = <div className="bg-white/10 backdrop-blur-md" />;', 'frosted-glass:1');
N('glass-plain-blur', 'a.css', '.avatar-loading { filter: blur(2px); }', 'frosted-glass');
N('glass-solid', 'a.tsx', 'const a = <div className="bg-white" />;', 'frosted-glass');

/* left-border-accent */
P('lborder-tailwind', 'a.tsx', 'const a = <div className="rounded-lg border-l-4 border-blue-500 p-4" />;', 'left-border-accent:1');
P('lborder-css', 'a.css', '.tile { border-left: 4px solid #3b82f6; }', 'left-border-accent:1');
N('lborder-hairline', 'a.css', '.nav { border-left: 1px solid #ddd; }', 'left-border-accent');
N('lborder-plain-class', 'a.tsx', 'const a = <div className="border-l pl-4" />;', 'left-border-accent');
N('lborder-severity-ignored', 'a.tsx', 'const a = (\n  // ui-slop-ignore left-border-accent: encodes alert severity\n  <div className="border-l-4 border-red-500" />\n);', 'left-border-accent');

/* scroll-entrance */
P('entrance-framer', 'a.tsx', 'const a = <motion.section whileInView={{ opacity: 1 }} />;', 'scroll-entrance:1');
P('entrance-aos', 'a.html', '<section data-aos="fade-up">x</section>', 'scroll-entrance:1');
N('entrance-dialog', 'a.tsx', 'const a = <div className="animate-in fade-in zoom-in-95" role="dialog" />;', 'scroll-entrance');
N('entrance-hover', 'a.tsx', 'const a = <motion.button whileHover={{ y: -1 }} />;', 'scroll-entrance');

/* cursor-glow */
P('glow-follow', 'a.tsx', "window.addEventListener('mousemove', (e) => {\n  el.style.setProperty('--x', e.clientX + 'px');\n});\nconst s = { background: 'radial-gradient(circle at var(--x) 50%, #fff, transparent)' };", 'cursor-glow:1');
N('glow-tooltip-only', 'a.tsx', "window.addEventListener('mousemove', (e) => {\n  tooltip.style.left = e.clientX + 'px';\n});", 'cursor-glow');

/* hover-opacity */
P('hoverop-tailwind', 'a.tsx', 'const a = <button className="bg-black text-white hover:opacity-80">Save</button>;', 'hover-opacity:1');
P('hoverop-css', 'a.css', '.btn:hover {\n  opacity: 0.8;\n}', 'hover-opacity:1');
N('hoverop-with-bg', 'a.tsx', 'const a = <button className="hover:opacity-90 hover:bg-gray-100">Save</button>;', 'hover-opacity');
N('hoverop-bg-css', 'a.css', '.btn:hover { background: #eee; }', 'hover-opacity');

/* icon-card-row */
P('iconcards-jsx', 'a.tsx', `const a = (
  <div>
    <div><svg /><h3>Fast</h3><p>Quick.</p></div>
    <div><svg /><h3>Safe</h3><p>Secure.</p></div>
    <div><svg /><h3>Easy</h3><p>Simple.</p></div>
  </div>
);`, 'icon-card-row:3');
P('iconcards-data', 'a.tsx', "const items = [\n  { icon: Zap, title: 'Fast', description: 'Quick' },\n  { icon: Lock, title: 'Safe', description: 'Secure' },\n  { icon: Star, title: 'Easy', description: 'Simple' },\n];", 'icon-card-row:2');
N('iconcards-no-icons', 'a.tsx', 'const a = (\n  <div>\n    <div><h3>Fast</h3><p>Quick.</p></div>\n    <div><h3>Safe</h3><p>Secure.</p></div>\n    <div><h3>Easy</h3><p>Simple.</p></div>\n  </div>\n);', 'icon-card-row');
N('iconcards-two', 'a.tsx', 'const a = (\n  <div>\n    <div><svg /><h3>Fast</h3><p>Quick.</p></div>\n    <div><svg /><h3>Safe</h3><p>Secure.</p></div>\n  </div>\n);', 'icon-card-row');

/* eyebrow-pill */
P('eyebrow-pill', 'a.tsx', 'const a = (\n  <div>\n    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs">New release</span>\n    <h1>Scans</h1>\n  </div>\n);', 'eyebrow-pill:3');
N('eyebrow-none', 'a.tsx', 'const a = (\n  <div>\n    <h1>Scans</h1>\n    <p>Last run today</p>\n  </div>\n);', 'eyebrow-pill');
N('eyebrow-status-chip-after', 'a.tsx', 'const a = (\n  <div>\n    <h1>Scans</h1>\n    <span className="rounded-full bg-green-50 px-3 py-1 text-xs">Healthy</span>\n  </div>\n);', 'eyebrow-pill');

/* caps-tracked */
P('caps-one', 'a.tsx', 'const a = <div className="text-xs uppercase tracking-widest">Overview</div>;', 'caps-tracked:1');
P('caps-css', 'a.css', '.label {\n  text-transform: uppercase;\n  letter-spacing: 0.12em;\n}', 'caps-tracked:1');
N('caps-no-tracking', 'a.tsx', 'const a = <abbr className="uppercase">api</abbr>;', 'caps-tracked');
N('caps-tracking-only', 'a.tsx', 'const a = <h1 className="tracking-tight">Scans</h1>;', 'caps-tracked');

/* em-dash */
P('emdash-jsx', 'a.tsx', `const a = <p>Fast ${EM} and simple</p>;`, 'em-dash:1');
P('emdash-string', 'a.tsx', `const title = "Fast ${EM} simple";`, 'em-dash:1');
P('emdash-entity', 'a.html', '<p>Fast &mdash; simple</p>', 'em-dash:1');
N('emdash-comment', 'a.tsx', `// note ${EM} internal only\nconst a = <p>Fast, simple</p>;`, 'em-dash');
N('emdash-block-comment', 'a.css', `/* note ${EM} internal */\n.a { color: #111; }`, 'em-dash');

/* label-dash */
P('labeldash', 'a.tsx', `const a = <span>STATUS ${EM} healthy</span>;`, 'label-dash:1');
N('labeldash-plain', 'a.tsx', 'const a = <span>Status</span>;', 'label-dash');

/* middle-dot */
P('middot', 'a.tsx', 'const a = <p>3 nodes · 12 pods</p>;', 'middle-dot:1');
N('middot-none', 'a.tsx', 'const a = <p>3 nodes, 12 pods</p>;', 'middle-dot');

/* arrow-suffix */
P('arrow', 'a.tsx', 'const a = <a href="/scans">View all →</a>;', 'arrow-suffix:1');
N('arrow-none', 'a.tsx', 'const a = <a href="/scans">View all scans</a>;', 'arrow-suffix');
N('arrow-inside-text', 'a.tsx', 'const a = <p>Maps input → output per row</p>;', 'arrow-suffix');

/* placeholder-copy */
P('lorem', 'a.tsx', 'const a = <p>Lorem ipsum dolor sit amet</p>;', 'placeholder-copy:1');
P('feature-one', 'a.tsx', 'const a = <h3>Feature one</h3>;', 'placeholder-copy:1');
N('placeholder-attribute', 'a.tsx', 'const a = <input placeholder="Search scans" />;', 'placeholder-copy');
N('features-heading', 'a.tsx', 'const a = <h3>Features</h3>;', 'placeholder-copy');

/* invented-metric */
P('metric-10x', 'a.tsx', 'const a = <p>10x faster scans</p>;', 'invented-metric:1');
P('metric-uptime', 'a.tsx', 'const a = <p>99.9% uptime guaranteed</p>;', 'invented-metric:1');
N('metric-real-count', 'a.tsx', 'const a = <p>3 clusters scanned</p>;', 'invented-metric');
N('metric-comparison', 'a.tsx', 'const a = <p>Took 2x longer than last week</p>;', 'invented-metric');

/* buzzword */
P('buzz-seamless', 'a.tsx', 'const a = <p>A seamless experience for teams</p>;', 'buzzword:1');
P('buzz-unlock-potential', 'a.tsx', 'const a = <p>Unlock your potential today</p>;', 'buzzword:1');
N('buzz-unlock-account', 'a.tsx', 'const a = <button>Unlock account</button>;', 'buzzword');
N('buzz-plain', 'a.tsx', 'const a = <p>Scans images for known vulnerabilities</p>;', 'buzzword');

/* placeholder-image */
P('img-unsplash', 'a.tsx', 'const a = <img src="https://images.unsplash.com/photo-1" />;', 'placeholder-image:1');
P('img-placehold', 'a.html', '<img src="https://placehold.co/600x400">', 'placeholder-image:1');
N('img-local', 'a.tsx', 'const a = <img src="/team/anna.jpg" alt="Anna" />;', 'placeholder-image');

/* decorative-blob */
P('blob-css', 'a.css', '.hero { background: url(/img/blob-bg.svg); }', 'decorative-blob:1');
N('blob-logo', 'a.css', '.hero { background: url(/img/logo.svg); }', 'decorative-blob');

/* grain-noise */
P('noise-filter', 'a.html', '<svg><filter><feTurbulence baseFrequency="0.8"/></filter></svg>', 'grain-noise:1');
P('noise-png', 'a.css', 'body { background: url(/img/noise.png); }', 'grain-noise:1');
N('noise-none', 'a.css', 'body { background: #fafafa; }', 'grain-noise');

/* hex-excess */
P('hex-13', 'a.css', Array.from({ length: 13 }, (_, i) => `.c${i} { color: #${(100 + i * 7).toString(16).padEnd(6, '0')}; }`).join('\n'), 'hex-excess:1');
N('hex-12', 'a.css', Array.from({ length: 12 }, (_, i) => `.c${i} { color: #${(100 + i * 7).toString(16).padEnd(6, '0')}; }`).join('\n'), 'hex-excess');
N('hex-token-file', 'tokens.css', Array.from({ length: 20 }, (_, i) => `--c${i}: #${(100 + i * 7).toString(16).padEnd(6, '0')};`).join('\n'), 'hex-excess');
withConfig({ tokenFiles: ['tokens.css'] });

/* accent-overuse */
P('accent-9', 'a.tsx', Array.from({ length: 9 }, () => 'const a = <b className="bg-primary">x</b>;').join('\n'), 'accent-overuse:1');
N('accent-3', 'a.tsx', Array.from({ length: 3 }, () => 'const a = <b className="bg-primary">x</b>;').join('\n'), 'accent-overuse');

/* low-contrast */
P('contrast-css', 'a.css', '.note {\n  color: #999999;\n  background: #ffffff;\n}', 'low-contrast:1');
P('contrast-tailwind', 'a.tsx', 'const a = <p className="text-gray-400 bg-white">Hi there</p>;', 'low-contrast:1');
P('contrast-inline', 'a.tsx', "const a = <p style={{ color: '#aaa', background: '#fff' }}>Hi there</p>;", 'low-contrast:1');
P('contrast-dark-mode', 'a.tsx', 'const a = <p className="text-gray-900 bg-white dark:text-gray-700 dark:bg-gray-900">Hi</p>;', 'low-contrast:1');
N('contrast-good', 'a.css', '.note { color: #111111; background: #ffffff; }', 'low-contrast');
N('contrast-large-text-ok', 'a.css', '.big {\n  font-size: 32px;\n  color: #888888;\n  background: #ffffff;\n}', 'low-contrast');
N('contrast-tailwind-good', 'a.tsx', 'const a = <p className="text-gray-700 bg-white">Hi</p>;', 'low-contrast');

/* tiny-font */
P('font-10px', 'a.css', '.meta { font-size: 10px; }', 'tiny-font:1');
P('font-arbitrary', 'a.tsx', 'const a = <span className="text-[9px]">x</span>;', 'tiny-font:1');
N('font-11px', 'a.css', '.meta { font-size: 11px; }', 'tiny-font');
N('font-rem', 'a.css', '.meta { font-size: 0.75rem; }', 'tiny-font');

/* small-touch-target */
P('touch-small', 'a.tsx', 'const a = <button className="h-8 w-8"><X /></button>;', 'small-touch-target:1');
N('touch-ok', 'a.tsx', 'const a = <button className="h-11 w-11"><X /></button>;', 'small-touch-target');
N('touch-height-only', 'a.tsx', 'const a = <button className="h-8 px-4">Save</button>;', 'small-touch-target');

/* off-scale-spacing */
P('space-css', 'a.css', '.card { padding: 13px; }', 'off-scale-spacing:1');
P('space-arbitrary', 'a.tsx', 'const a = <div className="p-[13px]" />;', 'off-scale-spacing:1');
N('space-on-scale', 'a.css', '.card { padding: 16px 24px; margin: 0 auto; }', 'off-scale-spacing');
N('space-var', 'a.css', '.card { padding: var(--space-3); gap: calc(1rem + 2px); }', 'off-scale-spacing');

/* serif-italic-emphasis */
P('italic-word', 'a.tsx', 'const a = <h1>Ship <em>faster</em> today</h1>;', 'serif-italic-emphasis:1');
N('italic-in-paragraph', 'a.tsx', 'const a = <p>An <em>important</em> note</p>;', 'serif-italic-emphasis');

/* heavy-shadow */
P('shadow-css', 'a.css', '.card { box-shadow: 0 20px 40px rgba(0,0,0,0.2); }', 'heavy-shadow:1');
P('shadow-2xl', 'a.tsx', 'const a = <div className="rounded-lg shadow-2xl" />;', 'heavy-shadow:1');
N('shadow-subtle', 'a.css', '.card { box-shadow: 0 1px 2px rgba(0,0,0,0.1); }', 'heavy-shadow');
N('shadow-inset', 'a.css', '.well { box-shadow: inset 0 20px 40px rgba(0,0,0,0.2); }', 'heavy-shadow');
N('shadow-sm', 'a.tsx', 'const a = <div className="shadow-sm" />;', 'heavy-shadow');

/* nested-cards */
P('cards-nested', 'a.tsx', 'const a = (\n  <Card>\n    <div className="rounded-lg border bg-card p-4">x</div>\n  </Card>\n);', 'nested-cards:3');
N('cards-siblings', 'a.tsx', 'const a = (\n  <div>\n    <Card>a</Card>\n    <Card>b</Card>\n  </div>\n);', 'nested-cards');
N('cards-plain-child', 'a.tsx', 'const a = (\n  <Card>\n    <div className="p-4">x</div>\n  </Card>\n);', 'nested-cards');
N('cards-generic-type', 'a.tsx', 'const m: Map<string, number> = new Map();\nconst a = <Card><b>x</b></Card>;', 'nested-cards');

/* neon-glow */
P('neon-css', 'a.css', '.btn { box-shadow: 0 0 20px #00ffff; }', 'neon-glow:1');
N('neon-focus-ring', 'a.css', '.btn:focus-visible { box-shadow: 0 0 0 3px rgba(59,130,246,0.5); }', 'neon-glow');
N('neon-grey-shadow', 'a.css', '.btn { box-shadow: 0 0 8px rgba(0,0,0,0.2); }', 'neon-glow');

/* gradient-orb */
P('orb-tailwind', 'a.tsx', 'const a = <div className="absolute -top-40 h-96 w-96 rounded-full bg-blue-500 blur-3xl" />;', 'gradient-orb:1');
P('orb-css', 'a.css', '.orb {\n  position: absolute;\n  filter: blur(80px);\n}', 'gradient-orb:1');
N('orb-small-blur', 'a.css', '.skeleton { position: absolute; filter: blur(4px); }', 'gradient-orb');
N('orb-static-small', 'a.tsx', 'const a = <img className="blur-sm" src="/a.jpg" />;', 'gradient-orb');

/* weak-hierarchy */
P('hierarchy-flat', 'a.tsx', Array.from({ length: 12 }, () => 'const a = <p className="text-sm font-normal">x</p>;').join('\n'), 'weak-hierarchy:1');
N('hierarchy-varied', 'a.tsx', ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-2xl', 'text-sm', 'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-sm'].map((c, i) => `const a${i} = <p className="${c} ${i % 2 ? 'font-bold' : 'font-normal'}">x</p>;`).join('\n'), 'weak-hierarchy');

/* floating-animation */
P('float-css', 'a.css', '.badge { animation: float 3s ease-in-out infinite; }', 'floating-animation:1');
P('float-keyframes', 'a.css', '@keyframes drift {\n  0% { transform: translateY(0); }\n  50% { transform: translateY(-12px); }\n}\n.hero-art { animation: drift 4s infinite; }', 'floating-animation:5');
P('float-keyframes-neutral-name', 'a.css', '@keyframes hero-motion {\n  0% { transform: translateY(0); }\n  50% { transform: translateY(-12px); }\n}\n.art { animation: hero-motion 4s infinite; }', 'floating-animation:1');
P('float-bounce', 'a.tsx', 'const a = <div className="animate-bounce">scroll</div>;', 'floating-animation:1');
N('float-spin', 'a.tsx', 'const a = <Loader className="animate-spin" />;', 'floating-animation');
N('float-pulse-skeleton', 'a.tsx', 'const a = <div className="animate-pulse h-4 bg-gray-200" />;', 'floating-animation');
N('float-loading-keyframes', 'a.css', '@keyframes loading-bar {\n  0% { transform: translateY(0); }\n  100% { transform: translateY(2px); }\n}\n.bar { animation: loading-bar 1s infinite; }', 'floating-animation');

/* accent-word-heading */
P('accentword', 'a.tsx', 'const a = <h1>Build <span className="text-blue-500">faster</span></h1>;', 'accent-word-heading:1');
N('accentword-no-colour', 'a.tsx', 'const a = <h1>Build <span className="whitespace-nowrap">faster</span></h1>;', 'accent-word-heading');
N('accentword-plain', 'a.tsx', 'const a = <h1>Build faster</h1>;', 'accent-word-heading');

/* mono-heading */
P('monohead-class', 'a.tsx', 'const a = <h1 className="font-mono text-3xl">Scans</h1>;', 'mono-heading:1');
P('monohead-css', 'a.css', 'h1 {\n  font-family: ui-monospace, monospace;\n}', 'mono-heading:1');
N('mono-code', 'a.tsx', 'const a = <code className="font-mono">v1.2.3</code>;', 'mono-heading');
N('mono-sans-heading', 'a.css', 'h1 { font-family: "Fraunces", serif; }', 'mono-heading');

/* kpi-card-row */
P('kpi-cards', 'a.tsx', `const a = (
  <div>
    <div className="rounded-lg border p-4">
      <p className="text-3xl font-bold">42</p>
      <p className="text-sm text-muted">Clusters</p>
    </div>
    <div className="rounded-lg border p-4">
      <p className="text-3xl font-bold">17</p>
      <p className="text-sm text-muted">Findings</p>
    </div>
    <div className="rounded-lg border p-4">
      <p className="text-3xl font-bold">3</p>
      <p className="text-sm text-muted">Critical</p>
    </div>
  </div>
);`, 'kpi-card-row:4');
P('kpi-data', 'a.tsx', "const kpis = [\n  { label: 'Clusters', value: 42, delta: '+2' },\n  { label: 'Findings', value: 17, delta: '-3' },\n  { label: 'Critical', value: 3, delta: '0' },\n];", 'kpi-card-row:2');
N('kpi-single', 'a.tsx', 'const a = (\n  <div className="rounded-lg border p-4">\n    <p className="text-3xl font-bold">42</p>\n    <p className="text-sm text-muted">Clusters</p>\n  </div>\n);', 'kpi-card-row');
N('kpi-strip', 'a.tsx', 'const a = (\n  <dl className="grid grid-cols-3 divide-x border">\n    <div><dt>Clusters</dt><dd>42</dd></div>\n    <div><dt>Findings</dt><dd>17</dd></div>\n    <div><dt>Critical</dt><dd>3</dd></div>\n  </dl>\n);', 'kpi-card-row');

/* default-chart-palette */
P('chart-recharts', 'a.tsx', 'const a = <><Line stroke="#8884d8" /><Area fill="#82ca9d" /></>;', 'default-chart-palette:1');
P('chart-chartjs', 'a.tsx', "const colors = ['#36a2eb', '#ff6384', '#ffcd56', '#4bc0c0'];", 'default-chart-palette:1');
N('chart-tokens', 'a.tsx', 'const a = <Line stroke="var(--chart-1)" />;', 'default-chart-palette');
N('chart-custom-single', 'a.tsx', 'const a = <Line stroke="#0f766e" />;', 'default-chart-palette');

/* punctuation */
P('semi-jsx', 'a.tsx', 'const a = <p>Scan finished; review the results below.</p>;', 'punct-semicolon-in-copy:1');
N('semi-entity', 'a.tsx', 'const a = <p>Terms &amp; conditions apply to every plan</p>;', 'punct-semicolon-in-copy');
N('semi-code', 'a.tsx', 'const a = 1;\nconst b = <p className="x">Hello there</p>;', 'punct-semicolon-in-copy');
P('colon-label', 'a.tsx', 'const a = <p>Status: ready to deploy</p>;', 'punct-colon-in-copy:1');
N('colon-time', 'a.tsx', 'const a = <p>Opens at 12:30 every day</p>;', 'punct-colon-in-copy');
N('colon-port', 'a.tsx', 'const a = <p>Listening on localhost:8080 now</p>;', 'punct-colon-in-copy');
N('colon-url', 'a.tsx', 'const a = <a href="x">See https://example.com/docs for details</a>;', 'punct-colon-in-copy');
N('colon-json-in-code', 'a.tsx', 'const data = { name: "Anna", role: "admin" };', 'punct-colon-in-copy');
N('colon-log', 'a.tsx', 'console.log("Status: ready to deploy");', 'punct-colon-in-copy');
N('colon-css', 'a.css', '.a { color: red; }', 'punct-colon-in-copy');
P('dash-sep', 'a.tsx', 'const a = <p>Cluster - production</p>;', 'punct-dash-separator:1');
N('dash-range', 'a.tsx', 'const a = <p>Pages 10 - 20 of the report</p>;', 'punct-dash-separator');
N('dash-version-range', 'a.tsx', 'const a = <p>Supports v1.2 - v1.4 only</p>;', 'punct-dash-separator');
N('dash-compound', 'a.tsx', 'const a = <p>A read-only, well-known view</p>;', 'punct-dash-separator');
N('dash-negative', 'a.tsx', 'const a = <p>Delta is -3 points today</p>;', 'punct-dash-separator');

/* project-level rules */
project('font-defaults-only', [{ name: 'a.css', code: 'body { font-family: Inter, system-ui, sans-serif; }' }], ['default-font-only:1'], []);
project('font-display-present', [{ name: 'a.css', code: 'body { font-family: Inter, sans-serif; }\nh1 { font-family: "Fraunces", serif; }' }], [], ['default-font-only']);
project('font-from-token', [{ name: 'a.css', code: 'body { font-family: var(--font-body), sans-serif; }' }], [], ['default-font-only']);
project('radius-uniform', [{ name: 'a.tsx', code: Array.from({ length: 8 }, () => 'const a = <div className="rounded-xl">x</div>;').join('\n') }], ['uniform-radius:1'], []);
project('radius-two-steps', [{ name: 'a.tsx', code: Array.from({ length: 4 }, () => 'const a = <div className="rounded-xl">x</div>;').concat(Array.from({ length: 4 }, () => 'const b = <button className="rounded-md">x</button>;')).join('\n') }], [], ['uniform-radius']);
project('radius-few', [{ name: 'a.tsx', code: 'const a = <div className="rounded-xl">x</div>;' }], [], ['uniform-radius']);

/* ignore comments */
P('ignore-needs-reason', 'a.css', '.a { color: #6366f1; } /* ui-slop-ignore default-indigo */', 'ignore-without-reason:1');

// Labelled detection corpus. Each case is a small UI snippet.
//   P(id, file, code, ...'rule:line')  a positive. Every listed rule must fire on that line.
//   N(id, file, code, ...rules)        a hard negative. None of the listed rules may fire.
// Only the rules named in a case are scored for that case.
// Dashes and emoji are written as escapes so the repo's prose check stays clean.
const EM = '\u2014';
const ROCKET = '\u{1F680}';
const SPARKLE = '\u2728';
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

/* side-border-accent */
P('lborder-tailwind', 'a.tsx', 'const a = <div className="rounded-lg border-l-4 border-blue-500 p-4" />;', 'side-border-accent:1');
P('lborder-css', 'a.css', '.tile { border-left: 4px solid #3b82f6; }', 'side-border-accent:1');
N('lborder-hairline', 'a.css', '.nav { border-left: 1px solid #ddd; }', 'side-border-accent');
N('lborder-plain-class', 'a.tsx', 'const a = <div className="border-l pl-4" />;', 'side-border-accent');
N('lborder-severity-ignored', 'a.tsx', 'const a = (\n  // ui-slop-ignore side-border-accent: encodes alert severity\n  <div className="border-l-4 border-red-500" />\n);', 'side-border-accent');

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

/* regressions found while reviewing real code */
N('blob-object-url', 'a.tsx', 'const url = URL.createObjectURL(blob);', 'decorative-blob');
N('emdash-empty-value', 'a.tsx', `const a = <td>{value ?? "${EM}"}</td>;`, 'em-dash');
N('lborder-transparent', 'a.tsx', 'const s = { borderLeft: "2px solid transparent" };', 'side-border-accent');
N('glass-none', 'a.css', '.card { backdrop-filter: none; }', 'frosted-glass');
N('glass-modal-scrim', 'a.tsx', 'const a = <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />;', 'frosted-glass');
N('shadow-dropdown', 'a.tsx', 'const a = <div className="absolute right-0 top-full shadow-2xl" />;', 'heavy-shadow');
N('cards-callout-in-card', 'a.tsx', 'const a = (\n  <Card>\n    <div className="rounded-lg border bg-red-50 px-3 py-2 text-xs">Error</div>\n  </Card>\n);', 'nested-cards');
N('cards-button-in-card', 'a.tsx', 'const a = (\n  <Card>\n    <button className="rounded-lg border bg-white p-4">Go</button>\n  </Card>\n);', 'nested-cards');
N('iconcards-type-def', 'a.tsx', 'interface Item {\n  icon: typeof Server;\n  title: string;\n  description: string;\n}\ninterface B {\n  icon: typeof Lock;\n  title: string;\n  description: string;\n}', 'icon-card-row');
N('contrast-disabled-soft', 'a.tsx', 'const c = "bg-gray-100 text-gray-400 cursor-not-allowed";', 'low-contrast');
N('dash-arithmetic', 'a.tsx', 'const w = a >= b ? a - b : null;\nconst h = {\n  width: g.maxX - g.minX + pad * 2,\n};', 'punct-dash-separator');
N('colon-object-key', 'a.tsx', 'const o = {\n  HIGH: true,\n  Icon: IconCat,\n};', 'punct-colon-in-copy');
N('glass-supports-fallback', 'a.css', '@supports not (backdrop-filter: blur(1px)) {\n  .a { background: #fff; }\n}', 'frosted-glass');
N('glass-scrim-inline', 'a.tsx', 'const a = <div style={{ position: "fixed", inset: 0, background: "rgba(8,10,12,0.82)", backdropFilter: "blur(4px)" }} />;', 'frosted-glass');
P('glass-header-sticky', 'a.tsx', 'const a = <header className="sticky top-0 bg-white/80 backdrop-blur-md">x</header>;', 'frosted-glass:1');
P('glass-fixed-header', 'a.tsx', 'const a = <header className="fixed inset-x-0 top-0 bg-white/90 backdrop-blur-md">x</header>;', 'frosted-glass:1');

/* side-border-accent, right side (the left side cases are above) */
P('rborder-tailwind', 'a.tsx', 'const a = <div className="rounded-lg border-r-4 border-red-500 p-4" />;', 'side-border-accent:1');
P('rborder-css', 'a.css', '.card { border-right: 3px solid #ef4444; }', 'side-border-accent:1');
P('rborder-inline', 'a.tsx', 'const s = { borderRight: "4px solid #f59e0b" };', 'side-border-accent:1');
P('rborder-logical-end', 'a.tsx', 'const a = <div className="border-e-4 border-blue-500 ps-3" />;', 'side-border-accent:1');
N('rborder-divider-class', 'a.tsx', 'const a = <aside className="border-r border-zinc-200" />;', 'side-border-accent');
N('rborder-divider-css', 'a.css', '.nav { border-right: 1px solid #ddd; }', 'side-border-accent');
N('rborder-transparent-class', 'a.tsx', 'const a = <li className="border-r-4 border-transparent" />;', 'side-border-accent');
N('rborder-severity-ignored', 'a.tsx', 'const a = (\n  // ui-slop-ignore side-border-accent: encodes alert severity\n  <div className="border-r-4 border-red-500" />\n);', 'side-border-accent');
N('rborder-old-alias-ignored', 'a.tsx', 'const a = (\n  // ui-slop-ignore left-border-accent: encodes alert severity\n  <div className="border-l-4 border-red-500" />\n);', 'side-border-accent');

/* hard-offset-shadow */
P('offset-css', 'a.css', '.card { box-shadow: 6px 6px 0 #000; }', 'hard-offset-shadow:1');
P('offset-tailwind', 'a.tsx', 'const a = <div className="shadow-[6px_6px_0_#000] border-2" />;', 'hard-offset-shadow:1');
P('offset-inline', 'a.tsx', 'const s = { boxShadow: "4px 4px 0px #111" };', 'hard-offset-shadow:1');
N('offset-focus-ring', 'a.css', 'button:focus-visible { box-shadow: 0 0 0 2px var(--focus); }', 'hard-offset-shadow');
N('offset-soft', 'a.css', '.card { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }', 'hard-offset-shadow');
N('offset-hairline', 'a.css', '.row { box-shadow: 1px 1px 0 #ccc; }', 'hard-offset-shadow');
N('offset-bottom-edge', 'a.css', '.btn { box-shadow: 0 4px 0 #1f2937; }', 'hard-offset-shadow');
N('offset-inset', 'a.css', '.well { box-shadow: inset 4px 4px 0 #ddd; }', 'hard-offset-shadow');
N('offset-ignored', 'a.css', '/* ui-slop-ignore hard-offset-shadow: the product brand is neobrutalist */\n.card { box-shadow: 6px 6px 0 #000; }', 'hard-offset-shadow');

/* ghost-card */
P('ghost-css', 'a.css', '.card {\n  border: 1px solid #222;\n  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);\n}', 'ghost-card:1');
P('ghost-tailwind', 'a.tsx', 'const a = <div className="rounded-xl border border-zinc-800 shadow-xl p-4" />;', 'ghost-card:1');
P('ghost-tailwind-2xl', 'a.tsx', 'const a = <section className="rounded-xl border bg-white shadow-2xl">x</section>;', 'ghost-card:1');
N('ghost-dropdown', 'a.tsx', 'const a = <div className="absolute right-0 top-full rounded-md border bg-white shadow-xl" />;', 'ghost-card');
N('ghost-dialog-css', 'a.css', '.dialog {\n  border: 1px solid #ddd;\n  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.25);\n}', 'ghost-card');
N('ghost-small-shadow', 'a.tsx', 'const a = <div className="rounded-lg border shadow-sm" />;', 'ghost-card');
N('ghost-small-shadow-css', 'a.css', '.card { border: 1px solid #ddd; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08); }', 'ghost-card');
N('ghost-shadow-no-border', 'a.tsx', 'const a = <div className="rounded-xl bg-white shadow-xl" />;', 'ghost-card');
N('ghost-border-color-only', 'a.tsx', 'const a = <div className="rounded-xl border-zinc-200 shadow-xl" />;', 'ghost-card');
N('ghost-hover-only', 'a.tsx', 'const a = <div className="rounded-xl border hover:shadow-xl" />;', 'ghost-card');

/* radial-glow-background */
P('glow-css', 'a.css', '.hero { background: radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.35), transparent 60%); }', 'radial-glow-background:1');
P('glow-tailwind', 'a.tsx', 'const a = <div className="bg-[radial-gradient(ellipse_at_top,#0ea5e9_0%,transparent_70%)]" />;', 'radial-glow-background:1');
P('glow-hex-transparent-alpha', 'a.css', '.page { background-image: radial-gradient(60% 40% at 50% 0%, #22c55e, rgba(34, 197, 94, 0)); }', 'radial-glow-background:1');
N('glow-grey-scrim', 'a.css', '.scrim { background: radial-gradient(circle, rgba(0, 0, 0, 0.4), transparent); }', 'radial-glow-background');
N('glow-white-vignette', 'a.css', '.photo::after { background: radial-gradient(circle, #ffffff, transparent); }', 'radial-glow-background');
N('glow-two-opaque-stops', 'a.css', '.knob { background: radial-gradient(circle at 30% 30%, #fff, #cbd5e1); }', 'radial-glow-background');
N('glow-chart-file', 'chart.css', '.heat { background: radial-gradient(circle, #ef4444, transparent); }', 'radial-glow-background');
N('glow-ignored', 'a.css', '/* ui-slop-ignore radial-glow-background: marketing hero approved by brand */\n.hero { background: radial-gradient(circle, #6366f1, transparent); }', 'radial-glow-background');

/* grid-line-background */
P('grid-css', 'a.css', '.page {\n  background-image: linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px);\n  background-size: 24px 24px;\n}', 'grid-line-background:1');
P('grid-tailwind-class', 'a.tsx', 'const a = <div className="bg-grid min-h-screen" />;', 'grid-line-background:1');
P('grid-tailwind-arbitrary', 'a.tsx', 'const a = <div className="bg-[linear-gradient(#222_1px,transparent_1px),linear-gradient(90deg,#222_1px,transparent_1px)] bg-[size:24px_24px]" />;', 'grid-line-background:1');
N('grid-topology-file', 'topology.css', '.view {\n  background-image: linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px);\n  background-size: 24px 24px;\n}', 'grid-line-background');
N('grid-one-rule-line', 'a.css', '.ruled { background-image: linear-gradient(#ddd 1px, transparent 1px); background-size: 100% 24px; }', 'grid-line-background');
N('grid-two-gradients-no-lines', 'a.css', '.band { background-image: linear-gradient(#fff, #eee), linear-gradient(#eee, #ddd); background-size: 100% 50%; }', 'grid-line-background');
N('grid-layout-class', 'a.tsx', 'const a = <div className="grid grid-cols-3 gap-4" />;', 'grid-line-background');
N('grid-ignored', 'a.css', '/* ui-slop-ignore grid-line-background: the drawing area is a grid by design */\n.page {\n  background-image: linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px);\n  background-size: 24px 24px;\n}', 'grid-line-background');

/* stripes-gradient */
P('stripes-css', 'a.css', '.hero { background: repeating-linear-gradient(45deg, #111 0 10px, #181818 10px 20px); }', 'stripes-gradient:1');
P('stripes-tailwind', 'a.tsx', 'const a = <div className="bg-[repeating-linear-gradient(45deg,#111_0_10px,#181818_10px_20px)]" />;', 'stripes-gradient:1');
P('stripes-radial', 'a.css', '.dots { background: repeating-radial-gradient(circle, #222 0 2px, transparent 2px 8px); }', 'stripes-gradient:1');
N('stripes-progress', 'a.css', '.progress-bar {\n  background: repeating-linear-gradient(45deg, #3b82f6 0 8px, #60a5fa 8px 16px);\n}', 'stripes-gradient');
N('stripes-chart-hatch', 'a.css', '/* chart legend */\n.hatch { background: repeating-linear-gradient(45deg, #888 0 2px, transparent 2px 6px); }', 'stripes-gradient');
N('stripes-plain-linear', 'a.css', '.band { background: linear-gradient(#fff, #eee); }', 'stripes-gradient');
N('stripes-ignored', 'a.css', '/* ui-slop-ignore stripes-gradient: shows a disabled region */\n.off { background: repeating-linear-gradient(45deg, #eee 0 4px, #ddd 4px 8px); }', 'stripes-gradient');

/* pulsing-status-dot */
P('dot-pulse-tailwind', 'a.tsx', 'const a = <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />;', 'pulsing-status-dot:1');
P('dot-ping-tailwind', 'a.tsx', 'const a = <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />;', 'pulsing-status-dot:1');
P('dot-pulse-css', 'a.css', '.dot {\n  width: 8px;\n  height: 8px;\n  border-radius: 50%;\n  animation: pulse 2s infinite;\n}', 'pulsing-status-dot:1');
P('dot-size-utility', 'a.tsx', 'const a = <span className="size-2 rounded-full bg-red-500 animate-pulse" />;', 'pulsing-status-dot:1');
N('dot-skeleton-bar', 'a.tsx', 'const a = <div className="h-4 w-32 animate-pulse rounded bg-zinc-200" />;', 'pulsing-status-dot');
N('dot-skeleton-avatar', 'a.tsx', 'const a = <div className="h-12 w-12 animate-pulse rounded-full bg-zinc-200" />;', 'pulsing-status-dot');
N('dot-spinner', 'a.tsx', 'const a = <span className="h-4 w-4 animate-spin rounded-full border-2" />;', 'pulsing-status-dot');
N('dot-static', 'a.tsx', 'const a = <span className="h-2 w-2 rounded-full bg-green-500" />;', 'pulsing-status-dot');
N('dot-css-spinner', 'a.css', '.spinner { width: 12px; height: 12px; animation: spin 1s linear infinite; }', 'pulsing-status-dot');
N('dot-pulse-large-block', 'a.css', '.panel { width: 320px; height: 200px; animation: pulse 2s infinite; }', 'pulsing-status-dot');
N('dot-ignored', 'a.tsx', 'const a = (\n  // ui-slop-ignore pulsing-status-dot: heartbeat from the agent feed\n  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />\n);', 'pulsing-status-dot');

/* marquee */
P('marquee-element', 'a.html', '<marquee>Latest news</marquee>', 'marquee:1');
P('marquee-class', 'a.tsx', 'const a = <div className="animate-marquee flex gap-8">x</div>;', 'marquee:1');
P('marquee-keyframes', 'a.css', '@keyframes scroll {\n  to { transform: translateX(-50%); }\n}\n.track { animation: scroll 30s linear infinite; }', 'marquee:4');
P('marquee-named-animation', 'a.css', '.logos { animation: marquee 20s linear infinite; }', 'marquee:1');
N('marquee-progress', 'a.css', '.bar { transition: width 0.3s linear; }', 'marquee');
N('marquee-scroll-table', 'a.tsx', 'const a = <div className="overflow-x-auto"><table /></div>;', 'marquee');
N('marquee-spinner', 'a.css', '@keyframes spin { to { transform: rotate(360deg); } }\n.s { animation: spin 1s linear infinite; }', 'marquee');
N('marquee-slide-out-once', 'a.css', '@keyframes out { to { transform: translateX(-100%); } }\n.drawer { animation: out 0.3s ease-in forwards; }', 'marquee');
N('marquee-word-in-copy', 'a.tsx', 'const a = <p>Marquee theatre listings</p>;', 'marquee');
N('marquee-ignored', 'a.tsx', 'const a = (\n  // ui-slop-ignore marquee: user-requested ticker for a trading floor\n  <div className="animate-marquee" />\n);', 'marquee');

/* transition-all */
P('tall-css', 'a.css', '.btn { transition: all 0.3s ease; }', 'transition-all:1');
P('tall-tailwind', 'a.tsx', 'const a = <button className="transition-all duration-300">x</button>;', 'transition-all:1');
P('tall-variant', 'a.tsx', 'const a = <button className="hover:transition-all">x</button>;', 'transition-all:1');
P('tall-inline', 'a.tsx', 'const s = { transition: "all 0.2s" };', 'transition-all:1');
P('tall-property', 'a.css', '.btn { transition-property: all; }', 'transition-all:1');
N('tall-named', 'a.css', '.btn { transition: opacity 0.15s, transform 0.15s; }', 'transition-all');
N('tall-colors', 'a.tsx', 'const a = <button className="transition-colors">x</button>;', 'transition-all');
N('tall-opacity', 'a.tsx', 'const a = <button className="transition-opacity">x</button>;', 'transition-all');
N('tall-none', 'a.tsx', 'const a = <button className="transition-none">x</button>;', 'transition-all');
N('tall-allow-discrete', 'a.css', '.d { transition: display 0.2s allow-discrete; }', 'transition-all');
N('tall-ignored', 'a.css', '/* ui-slop-ignore transition-all: a one-off demo block */\n.btn { transition: all 0.3s ease; }', 'transition-all');

/* ease-in-ui */
P('easein-css', 'a.css', '.panel { transition: transform 0.2s ease-in; }', 'ease-in-ui:1');
P('easein-tailwind', 'a.tsx', 'const a = <div className="transition ease-in">x</div>;', 'ease-in-ui:1');
P('easein-bezier', 'a.css', '.panel { transition: transform 0.2s cubic-bezier(0.4, 0, 1, 1); }', 'ease-in-ui:1');
P('easein-motion-lib', 'a.tsx', 'const t = { duration: 0.2, ease: "easeIn" };', 'ease-in-ui:1');
N('easein-in-out', 'a.css', '.panel { transition: transform 0.2s ease-in-out; }', 'ease-in-ui');
N('easein-out', 'a.css', '.panel { transition: transform 0.2s ease-out; }', 'ease-in-ui');
N('easein-in-out-tailwind', 'a.tsx', 'const a = <div className="ease-in-out">x</div>;', 'ease-in-ui');
N('easein-enter-animation', 'a.css', '.a { animation: fadeIn 0.2s ease-out; }', 'ease-in-ui');
N('easein-exit-animation', 'a.css', '.a { animation: out 0.2s ease-in forwards; }', 'ease-in-ui');
N('easein-expo-out', 'a.css', '.a { transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); }', 'ease-in-ui');

/* scale-zero-entrance */
P('scale0-css', 'a.css', '.pop { transform: scale(0); }', 'scale-zero-entrance:1');
P('scale0-tailwind', 'a.tsx', 'const a = <div className="scale-0 group-hover:scale-100">x</div>;', 'scale-zero-entrance:1');
P('scale0-motion-lib', 'a.tsx', 'const a = <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} />;', 'scale-zero-entrance:1');
P('scale0-two-args', 'a.css', '.pop { transform: scale(0, 0); }', 'scale-zero-entrance:1');
N('scale0-95', 'a.tsx', 'const a = <div className="scale-95 opacity-0">x</div>;', 'scale-zero-entrance');
N('scale0-96-css', 'a.css', '.pop { transform: scale(0.96); }', 'scale-zero-entrance');
N('scale0-x-bar', 'a.tsx', 'const a = <div className="origin-left scale-x-0" />;', 'scale-zero-entrance');
N('scale0-scalex-css', 'a.css', '.bar { transform: scaleX(0); }', 'scale-zero-entrance');
N('scale0-small-fraction', 'a.css', '.x { transform: scale(0.05); }', 'scale-zero-entrance');
N('scale0-ignored', 'a.tsx', 'const a = (\n  // ui-slop-ignore scale-zero-entrance: point of origin is the clicked marker\n  <div className="scale-0" />\n);', 'scale-zero-entrance');

/* bounce-easing */
P('bounce-bezier-css', 'a.css', '.a { transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }', 'bounce-easing:1');
P('bounce-bezier-tailwind', 'a.tsx', 'const a = <div className="ease-[cubic-bezier(0.34,1.56,0.64,1)]">x</div>;', 'bounce-easing:1');
P('bounce-spring', 'a.tsx', 'const a = <motion.div transition={{ type: "spring", bounce: 0.6 }} />;', 'bounce-easing:1');
P('bounce-back-name', 'a.tsx', 'const t = { duration: 0.4, ease: "easeOutBack" };', 'bounce-easing:1');
N('bounce-expo', 'a.css', '.a { transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); }', 'bounce-easing');
N('bounce-material', 'a.css', '.a { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }', 'bounce-easing');
N('bounce-spring-none', 'a.tsx', 'const a = <motion.div transition={{ type: "spring", bounce: 0 }} />;', 'bounce-easing');
N('bounce-spring-light', 'a.tsx', 'const a = <motion.div transition={{ type: "spring", bounce: 0.2 }} />;', 'bounce-easing');
N('bounce-ease-out', 'a.css', '.a { transition: transform 0.3s ease-out; }', 'bounce-easing');
N('bounce-utility-covered-elsewhere', 'a.tsx', 'const a = <span className="animate-bounce">x</span>;', 'bounce-easing');
N('bounce-word-in-copy', 'a.tsx', 'const a = <p>Bounce rate by channel</p>;', 'bounce-easing');

/* extreme-negative-tracking */
P('track-em-css', 'a.css', '.h { letter-spacing: -0.08em; }', 'extreme-negative-tracking:1');
P('track-em-tailwind', 'a.tsx', 'const a = <h1 className="text-5xl tracking-[-0.07em]">x</h1>;', 'extreme-negative-tracking:1');
P('track-em-inline', 'a.tsx', 'const s = { letterSpacing: "-0.1em" };', 'extreme-negative-tracking:1');
P('track-px-with-size', 'a.css', '.h {\n  font-size: 40px;\n  letter-spacing: -4px;\n}', 'extreme-negative-tracking:1');
N('track-mild', 'a.css', '.h { letter-spacing: -0.02em; }', 'extreme-negative-tracking');
N('track-tight-utility', 'a.tsx', 'const a = <h1 className="tracking-tight">x</h1>;', 'extreme-negative-tracking');
N('track-tighter-utility', 'a.tsx', 'const a = <h1 className="text-6xl tracking-tighter">x</h1>;', 'extreme-negative-tracking');
N('track-boundary', 'a.tsx', 'const a = <h1 className="tracking-[-0.05em]">x</h1>;', 'extreme-negative-tracking');
N('track-px-large-type', 'a.css', '.h {\n  font-size: 48px;\n  letter-spacing: -1px;\n}', 'extreme-negative-tracking');
N('track-px-no-size', 'a.css', '.h { letter-spacing: -2px; }', 'extreme-negative-tracking');
N('track-positive', 'a.css', '.cap { letter-spacing: 0.08em; }', 'extreme-negative-tracking');

/* focus-ring-removed */
P('focus-css-none', 'a.css', 'button:focus { outline: none; }', 'focus-ring-removed:1');
P('focus-css-reset', 'a.css', '* { outline: 0; }', 'focus-ring-removed:1');
P('focus-tailwind', 'a.tsx', 'const a = <input className="rounded-md border px-3 outline-none" />;', 'focus-ring-removed:1');
P('focus-tailwind-variant', 'a.tsx', 'const a = <button className="px-4 focus:outline-none">Save</button>;', 'focus-ring-removed:1');
P('focus-inline', 'a.tsx', 'const a = <input style={{ outline: "none" }} />;', 'focus-ring-removed:1');
N('focus-tailwind-ring', 'a.tsx', 'const a = <button className="outline-none focus-visible:ring-2">Save</button>;', 'focus-ring-removed');
N('focus-css-box-shadow', 'a.css', 'button:focus { outline: none; box-shadow: 0 0 0 2px #2563eb; }', 'focus-ring-removed');
N('focus-css-replaced-elsewhere', 'a.css', '.btn { outline: none; }\n.btn:focus-visible { outline: 2px solid #2563eb; }', 'focus-ring-removed');
N('focus-css-not-visible', 'a.css', 'button:focus:not(:focus-visible) { outline: none; }', 'focus-ring-removed');
N('focus-tabindex-minus-one', 'a.tsx', 'const a = <main tabIndex={-1} className="outline-none">x</main>;', 'focus-ring-removed');
N('focus-menu-item-highlight', 'a.tsx', 'const a = <div className="flex cursor-default outline-none focus:bg-accent focus:text-accent-foreground">x</div>;', 'focus-ring-removed');
N('focus-wrapper-focus-within', 'a.tsx', 'const a = (\n  <label className="rounded-md border focus-within:ring-2">\n    <input className="w-full outline-none" />\n  </label>\n);', 'focus-ring-removed');
N('focus-multiline-class', 'a.tsx', 'const a = cn(\n  "rounded-md",\n  "outline-none",\n  "focus-visible:ring-2"\n);', 'focus-ring-removed');
N('focus-outline-hidden', 'a.tsx', 'const a = <button className="outline-hidden px-4">Save</button>;', 'focus-ring-removed');
N('focus-ignored', 'a.tsx', 'const a = (\n  // ui-slop-ignore focus-ring-removed: the wrapper draws the focus frame\n  <input className="outline-none" />\n);', 'focus-ring-removed');

/* missing-tabular-nums (project level) */
const TNUM_TABLE = 'const t = <table><tbody><tr><td className="text-right">{row.count}</td></tr></tbody></table>;';
project('tnum-missing-right-aligned', [{ name: 'a.tsx', code: TNUM_TABLE }, { name: 'a.css', code: 'body { font-family: Inter; }' }], ['missing-tabular-nums:1'], []);
project('tnum-missing-literal-figures', [{ name: 'a.tsx', code: 'const t = <table><tr><td>1,204</td></tr></table>;' }], ['missing-tabular-nums:1'], []);
project('tnum-missing-css-right-cells', [{ name: 'a.css', code: 'td.num {\n  text-align: right;\n}' }], ['missing-tabular-nums:1'], []);
project('tnum-present-css', [{ name: 'a.tsx', code: TNUM_TABLE }, { name: 'a.css', code: '.num { font-variant-numeric: tabular-nums; }' }], [], ['missing-tabular-nums']);
project('tnum-present-class-elsewhere', [{ name: 'a.tsx', code: TNUM_TABLE }, { name: 'b.tsx', code: 'const k = <b className="tabular-nums">{n}</b>;' }], [], ['missing-tabular-nums']);
project('tnum-text-only-table', [{ name: 'a.tsx', code: 'const t = <table><tr><td>{row.name}</td><td>{row.owner}</td></tr></table>;' }], [], ['missing-tabular-nums']);
project('tnum-mono-figures', [{ name: 'a.tsx', code: 'const t = <table><tr><td className="text-right font-mono">{row.count}</td></tr></table>;' }], [], ['missing-tabular-nums']);
project('tnum-no-table', [{ name: 'a.tsx', code: 'const k = <div className="text-right">{count}</div>;' }], [], ['missing-tabular-nums']);
project('tnum-font-feature-settings', [{ name: 'a.tsx', code: TNUM_TABLE }, { name: 'a.css', code: 'td { font-feature-settings: "tnum"; }' }], [], ['missing-tabular-nums']);
project('tnum-figure-face-config', [{ name: 'a.tsx', code: TNUM_TABLE }], [], ['missing-tabular-nums']);
cases[cases.length - 1].config = { options: { figureFace: 'mono' } };

/* cream-clay-palette */
P('cream-tokens', 'a.css', ':root { --bg: #faf7f2; --accent: #c2410c; }', 'cream-clay-palette:1');
P('cream-rgb-and-hex', 'a.css', 'body { background: rgb(245, 240, 230); }\n.cta { background: #b5532a; }', 'cream-clay-palette:1');
P('cream-tailwind-arbitrary', 'a.tsx', 'const a = <main className="bg-[#f5f0e6]"><button className="bg-[#c2410c]">x</button></main>;', 'cream-clay-palette:1');
N('cream-neutral-ground', 'a.css', ':root { --bg: #fafafa; --accent: #c2410c; }', 'cream-clay-palette');
N('cream-alone', 'a.css', ':root { --bg: #faf7f2; --accent: #2563eb; }', 'cream-clay-palette');
N('cream-clay-alone', 'a.css', ':root { --bg: #ffffff; --accent: #c2410c; }', 'cream-clay-palette');
N('cream-gold-on-obsidian', 'a.css', ':root { --bg: #0a0a0a; --accent: #c9a227; }', 'cream-clay-palette');
N('cream-amber-tint', 'a.css', '.note { background: #fffbeb; }\n.cta { background: #c2410c; }', 'cream-clay-palette');
N('cream-print-stylesheet', 'print.css', 'body { background: #faf7f2; }\n.link { color: #c2410c; }', 'cream-clay-palette');
N('cream-ignored', 'a.css', '/* ui-slop-ignore cream-clay-palette: matches the printed brand book */\n:root { --bg: #faf7f2; --accent: #c2410c; }', 'cream-clay-palette');

/* aphoristic-cadence */
P('aphor-three-pairs', 'a.tsx', 'const a = (\n  <section>\n    <h2>Not a dashboard. A command centre.</h2>\n    <p>No agents. No sidecars. No stress.</p>\n    <p>Less noise. More signal.</p>\n  </section>\n);', 'aphoristic-cadence:3');
P('aphor-string-literals', 'a.tsx', 'const copy = [\n  "Not a toolbox. The toolbox.",\n  "No setup. No login.",\n  "Less clicking. More shipping.",\n];', 'aphoristic-cadence:2');
P('aphor-markdown', 'a.md', 'Not a plugin. A platform.\n\nNo lock-in. No limits.\n\nLess overhead. More output.', 'aphoristic-cadence:1');
N('aphor-single', 'a.tsx', 'const a = <h2>Not a dashboard. A command centre.</h2>;', 'aphoristic-cadence');
N('aphor-two', 'a.tsx', 'const a = (\n  <section>\n    <h2>Not a dashboard. A command centre.</h2>\n    <p>Less noise. More signal.</p>\n  </section>\n);', 'aphoristic-cadence');
N('aphor-error-text', 'a.tsx', 'const a = <p>Not found. Check the URL.</p>;', 'aphoristic-cadence');
N('aphor-empty-states', 'a.tsx', 'const a = (\n  <div>\n    <p>No results. Try another filter.</p>\n    <p>No clusters. Connect one to start.</p>\n    <p>No alerts. You are up to date.</p>\n  </div>\n);', 'aphoristic-cadence');
N('aphor-in-comment-and-code', 'a.tsx', '// Not a hack. A workaround. No time. No budget. Less code. More tests.\nconst x = notAThing();', 'aphoristic-cadence');
N('aphor-ignored', 'a.tsx', '// ui-slop-ignore-file aphoristic-cadence: campaign copy approved by marketing\nconst a = (\n  <section>\n    <h2>Not a dashboard. A command centre.</h2>\n    <p>No agents. No sidecars.</p>\n    <p>Less noise. More signal.</p>\n  </section>\n);', 'aphoristic-cadence');

/* placeholder-person-data */
P('person-john-doe', 'a.tsx', 'const row = { owner: "John Doe", org: "Acme Inc" };', 'placeholder-person-data:1');
P('person-jane-smith-text', 'a.tsx', 'const a = <td>Jane Smith</td>;', 'placeholder-person-data:1');
P('person-address', 'a.tsx', 'const a = <p>123 Main Street, Springfield</p>;', 'placeholder-person-data:1');
P('person-firstname', 'a.tsx', 'const a = <span>Firstname Lastname</span>;', 'placeholder-person-data:1');
N('person-fixtures-dir', 'tests/fixtures/people.tsx', 'export const row = { owner: "John Doe", org: "Acme Inc" };', 'placeholder-person-data');
N('person-mocks-dir', 'src/mocks/user.tsx', 'export const row = { owner: "Jane Doe" };', 'placeholder-person-data');
N('person-input-placeholder', 'a.tsx', 'const a = <input placeholder="Jane Doe" />;', 'placeholder-person-data');
N('person-similar-words', 'a.tsx', 'const a = <p>Johnson Doe Acmeist Acme-free zone</p>;', 'placeholder-person-data');
N('person-comment-only', 'a.tsx', '// example owner John Doe\nconst a = <p>Owner</p>;', 'placeholder-person-data');
N('person-ignored', 'a.tsx', 'const a = (\n  // ui-slop-ignore placeholder-person-data: demo tenant for the sales sandbox\n  <td>Acme Inc</td>\n);', 'placeholder-person-data');

/* profiles: operate switches off landing-page rules and relaxes the caps limit */
const EYEBROW_SRC = 'const a = (\n  <div>\n    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs">New release</span>\n    <h1>Scans</h1>\n  </div>\n);';
N('operate-eyebrow-off', 'a.tsx', EYEBROW_SRC, 'eyebrow-pill');
withConfig({ profile: 'operate' });
N('operate-mono-heading-off', 'a.tsx', 'const a = <h2 className="font-mono">payments-api-7f9c</h2>;', 'mono-heading');
withConfig({ profile: 'operate' });
N('operate-icon-cards-off', 'a.tsx', 'const a = (\n  <div>\n    <div><Icon /><h3>One</h3><p>A</p></div>\n    <div><Icon /><h3>Two</h3><p>B</p></div>\n    <div><Icon /><h3>Three</h3><p>C</p></div>\n  </div>\n);', 'icon-card-row');
withConfig({ profile: 'operate' });
N('operate-override-by-path', 'app/console/page.tsx', EYEBROW_SRC, 'eyebrow-pill');
withConfig({ profile: 'persuade', profileOverrides: [{ paths: ['app/console/**'], profile: 'operate' }] });
P('persuade-override-by-path', 'app/home/page.tsx', EYEBROW_SRC, 'eyebrow-pill:3');
withConfig({ profile: 'operate', profileOverrides: [{ paths: ['app/home/**'], profile: 'persuade' }] });

/* regressions found while running the new rules on real dashboards */
N('scale0-function-call', 'a.tsx', 'const baselineY = scale(0) ?? innerHeight;', 'scale-zero-entrance');
P('scale0-transform-string', 'a.tsx', 'const s = { transform: "scale(0)" };', 'scale-zero-entrance:1');
N('dot-pulse-14px-utility', 'a.tsx', 'const a = <div className="h-3.5 w-3.5 animate-pulse rounded-full bg-zinc-300" />;', 'pulsing-status-dot');
N('ghost-toast', 'a.tsx', 'const a = <div className="toast pointer-events-auto flex w-80 rounded-lg border px-4 py-3 shadow-xl" />;', 'ghost-card');

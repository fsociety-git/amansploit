# amansploit.com — Portfolio

Premium security-engineering & full-stack freelance portfolio.
Next.js 16 · Tailwind v4 · Framer Motion. Static export-friendly, A+ security headers.

## Run locally
    npm install
    npm run dev        # http://localhost:3000

## Build
    npm run build && npm run start

## Edit your content
All copy lives in **`lib/data.ts`** — stats, services, case studies, process,
certs, tools, and contact links. Change text there; no component edits needed.

## Deploy
- **Vercel (recommended):** push to GitHub, import at vercel.com, add domain
  `amansploit.com`. Vercel gives you the DNS records.
- Then in Hostinger: switch nameservers off `dns-parking` to Hostinger DNS
  (or point A/CNAME per Vercel's instructions). Kills the parked-domain problem.

## Security
- CSP, HSTS, X-Frame-Options DENY, nosniff, Permissions-Policy in `next.config.ts`
- `/security.txt` + `/.well-known/security.txt` for responsible disclosure
- Add your PGP fingerprint to security.txt when ready

## The particle experience (Act I / Act III)

`components/experience/` holds the WebGL layer, adapted from the "New Era"
scene by Textura Agency (GetLayers, commercial licence):

- `ParticleCanvas.tsx` — fixed canvas, aurora + particle morph + bloom
- `particles.ts` / `background.ts` — GLSL shaders (recoloured to the acid palette)
- `progress.ts` — maps page scroll onto the shader's 0→1 timeline:
    Act I (#act1)      → 0.00–0.60  sphere → DNA → wave
    Act II (content)   → held, canvas faded to 14%
    Act III (#contact) → 0.60–1.00  tunnel → galaxy

**Tuning:** particle colours are two constants in `particles.ts`
(`cBottom` / `cTop`); aurora colours are the `color1` / `color2` uniforms in
`ParticleCanvas.tsx`. Act I length is the `h-[420vh]` on `#act1` in
`components/ActOne.tsx`.

**Performance:** particle density scales down on small screens / low core
counts; the canvas is `dynamic()`-imported so it never blocks first paint.

**Note:** `body` must stay transparent — the canvas sits at `-z-10`, above the
`html` background but below content. An opaque body background hides it.

## Mobile

Verified on a 390×664 viewport (iPhone 13): no horizontal overflow, hero fits
without clipping, all content sections stack cleanly.

- **Navigation on mobile is the command palette.** The header button shows `⌘K`
  on desktop and a menu icon on phones; tapping it opens the same palette, so
  there is one nav implementation, not two.
- Act I is `h-[300vh]` on phones vs `420vh` on desktop — less scroll fatigue and
  less time with the GPU busy.
- Hero uses `100svh` and drops to 4 cert chips + a shorter intro sentence below
  the `sm` breakpoint so nothing clips under the fixed header.
- Particle density and pixel ratio step down on small screens / low core counts
  (see `ParticleCanvas.tsx`).

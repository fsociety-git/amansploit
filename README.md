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

## Content Security Policy

The CSP is **nonce-based** and lives in `proxy.ts` (Next 16 renamed `middleware`
→ `proxy`), not in `next.config.ts` — two CSP headers would be intersected by
the browser and break the page. `next.config.ts` still owns the other headers
(HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy).

`script-src` uses `'nonce-…' 'strict-dynamic'` with no `'unsafe-inline'`, which
is what takes a Security Headers scan from A to A+. Next attaches the nonce to
its own framework and bundle scripts automatically.

`style-src` keeps `'unsafe-inline'` because React and Framer Motion emit real
`style="…"` attributes on first paint. That is a much smaller risk than inline
scripts and is not what scanners penalise. (CSSOM writes like
`el.style.opacity = …` are never affected by CSP.)

**Trade-off:** nonces require a per-request render, so `app/page.tsx` calls
`await connection()` and the route is now `ƒ` (dynamic) rather than statically
prerendered. On Vercel this is negligible for a page this size.

## Case studies, SEO, analytics

- `app/work/[slug]/page.tsx` renders long-form case studies from `CASES` in
  `lib/data.ts` (each has `slug` + `body: [{h, p}]`). Add a case study by adding
  an entry there — the route, sitemap, and card link all follow automatically.
- `app/opengraph-image.tsx` generates the 1200×630 share card at build time.
- JSON-LD (Person + ProfessionalService) is in `app/layout.tsx`.
- `@vercel/analytics` is mounted in the layout; it needs Web Analytics enabled
  in the Vercel project dashboard to record anything.

**CSP note:** `script-src` is `'self' 'nonce-…'` — deliberately *without*
`'strict-dynamic'`, because strict-dynamic makes the browser ignore `'self'`
and would block the Vercel Analytics beacon (it exposes no nonce prop). Inline
script injection is still forbidden, which is the attack that matters here.

## Commercial sections (Tier 1)

All copy and numbers live in `lib/data.ts`:

- `PACKAGES` — pricing cards. **The prices are starting anchors, not researched
  quotes. Set your real numbers before this goes in front of a buyer.**
- `ESTIMATOR` — drives the interactive scope estimator. It hands the finished
  scope to WhatsApp or email rather than posting to a backend, so there is no
  mail service, no inbox to secure, and no lead data at rest.
- `WHATSAPP` — country code + number, digits only.
- `BOOKING_URL` — set to a Cal.com/Calendly link to reveal the "Book a call"
  button; empty hides it.
- `CREDENTIALS` — add a public `verify` URL per cert and a "verify" link appears.
- `AFFILIATIONS` — text-only, no logo assets required.
- `TESTIMONIALS` — **empty by default and the section renders nothing while it
  is empty.** Only add real, permissioned quotes. A fabricated testimonial on a
  security consultant's site is the fastest way to lose a technical buyer.

`components/WorkingWithMe.tsx` carries the trust load that a photo and intro
video normally would — explicit guarantees and specifics instead of a face.

## Free tools (`/tools`)

Two passive, public checks that double as lead magnets:

- `/tools/email-spoofing` — SPF/DKIM/DMARC verdict. DMARC governs spoofability:
  no record or `p=none` means receivers were never told to reject forged mail.
- `/tools/security-headers` — grades HTTP response headers and gives exact fixes.

Server logic lives in `app/api/tools/*/route.ts` (Node runtime — needs `node:dns`).

### SSRF protection — read before adding another tool

`lib/safe-url.ts` guards every endpoint that touches a user-supplied host:
scheme allowlist, no credentials or odd ports, literal private-IP rejection,
A/AAAA resolution with private/loopback/link-local/CGNAT/metadata blocking,
manual redirect handling that re-validates every hop, hard timeout, and the
response body is never read. Verified against `127.0.0.1`, `localhost`,
`169.254.169.254`, `10.x`, `192.168.x`, `0.0.0.0`, `file://`,
`metadata.google.internal`, non-standard ports, and URL credentials.

Residual risk, documented honestly in the source: DNS rebinding between
resolution and connection is not fully closed, because Node's fetch will not
pin a socket to a validated address.

### Two correctness rules these tools follow

1. **Never grade a blocked response.** A WAF or bot-protection page carries none
   of the real site's headers; grading it would tell someone their site scores F
   when it may be fine. 401/403/405/406/429/503 return `blocked: true` instead.
2. **A DNS failure is not "no record".** Reporting a timeout as a missing SPF
   record would tell a visitor they are spoofable when they are not. Only
   `ENODATA`/`ENOTFOUND` count as definitive; anything else returns
   `inconclusive: true`.

Result renderers live in `components/tools/Results.tsx` as client components —
a Server Component cannot pass a render function to a Client Component.

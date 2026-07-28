Newest first. This records what actually shipped, not what was planned.

## 28 July 2026

- **Eight free tools.** Added a certificate-transparency attack surface check, a DNS hygiene checker (CAA, DNSSEC, nameserver resilience, wildcards, dangling CNAMEs), a TLS configuration checker, and three browser-only utilities — a JWT decoder, a CVSS 3.1 calculator and a hash identifier. The CVSS implementation is verified against published NVD vectors and implements the specification's round-up rule.
- **Result-aware next steps.** Every scan now ends with something that depends on what it found — including a path that offers nothing at all when a result comes back clean, and nothing when it is inconclusive.
- **Fixed-price fixes** at `/fix`, from ₹6,000. The pricing ladder previously started at ₹45,000 with nothing beneath it.
- **Printable scan results.** Free, no email wall, via a print stylesheet rather than a PDF library.
- **Live self-scan** on the homepage: the real Content-Security-Policy read off the request, plus live SPF and DMARC lookups on every load. Three states, so a resolver timeout shows amber rather than falsely announcing a failure.
- **A data-handling policy**, because the blog tells buyers to ask providers for one.
- **security.txt** with a PGP key and its fingerprint published alongside, so a downloaded key can be cross-checked.
- **Fixed deep-link scrolling.** `/#estimate` and similar links were landing visitors on the hero and leaving them to scroll blind — which mattered, because those links are published off-site.
- **Per-page Open Graph cards** for posts, case studies and every tool.
- **DNS on this domain**: SPF, DMARC at `p=reject`, CAA, and a null MX. Before this, the site's own spoofability checker reported the site's own domain as spoofable.
- A terminal-styled 404 that returns a real 404 rather than a soft 200.

## 27 July 2026

- **Blog engine** — plain markdown, RSS feed, reading time.
- **Sample penetration test report** published in full: a fictional target, real in every other respect.
- **Two free tools**: an HTTP security header grader and an email spoofability checker, both behind an SSRF guard tested against ten bypass attempts.
- **A+ on securityheaders.com**, using a per-request nonce CSP rather than `unsafe-inline`.
- Case studies, scope estimator, transparent pricing, and a command palette.
- First deploy to the custom domain.

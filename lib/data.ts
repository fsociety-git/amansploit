export const LINKS = {
  email: "aman.s.732002@gmail.com",
  linkedin: "https://www.linkedin.com/in/aman-sonkamble",
  github: "https://github.com/fsociety-git",
  // The source of this site. Publishing it is the point: a security engineer
  // whose own site can be read line by line is making a checkable claim.
  repo: "https://github.com/fsociety-git/amansploit",
  location: "Pune, India · Remote worldwide",
};

export const STATS = [
  { value: 1, suffix: "%", prefix: "Top ", label: "TryHackMe global ranking" },
  { value: 4, suffix: "+", prefix: "", label: "Security certifications" },
  { value: 500, suffix: "k+", prefix: "", label: "Log events/hr monitored" },
  { value: 1, suffix: " hr", prefix: "< ", label: "Failure detection time" },
];

export const CERTS = [
  "CEH Master",
  "CompTIA Security+",
  "Certified Network Defender",
  "ECSS",
  "Top 1% TryHackMe",
  "AWS Security (in progress)",
];

export const SERVICES = [
  {
    id: "01",
    title: "Web & API Penetration Testing",
    desc: "Full-scope offensive assessment of your web apps, REST APIs, and infrastructure — OWASP Top 10 and beyond: IDOR, auth/session flaws, injection, misconfigurations.",
    deliverables: ["Report-grade findings with reproduction steps", "Severity-ranked remediation guidance", "Free retest & verification round"],
    tag: "$ nmap -sV --script=vuln target",
  },
  {
    id: "02",
    title: "Security Automation & SIEM Tooling",
    desc: "Custom monitoring and detection engineering: log-pipeline health monitors, alert automation, dark-web exposure monitoring — the tooling that catches incidents before your clients do.",
    deliverables: ["Production Python tooling, documented", "Severity-classified alerting & reporting", "Least-privilege access design"],
    tag: "$ python monitor.py --interval 1h",
  },
  {
    id: "03",
    title: "Secure Full-Stack Development",
    desc: "Web applications built security-first: Next.js/TypeScript + Supabase/PostgreSQL with server-side authorization, Row Level Security, secret scanning in CI, and hardened deployments.",
    deliverables: ["Security-reviewed, production-ready code", "CI/CD with secret scanning (Gitleaks)", "Threat-modeled architecture"],
    tag: "$ next build && gitleaks detect",
  },
  {
    id: "04",
    title: "AI / ML Engineering",
    desc: "Applied machine learning with a security bent: malware classification, sequence models, embeddings, anomaly detection — built, evaluated, and shipped with honest metrics.",
    deliverables: ["Trained & evaluated models (AUC, CM)", "Clean data pipelines", "Deployment-ready inference"],
    tag: "$ python train.py --model bigru-attn",
  },
];

export type CaseStudy = (typeof CASES)[number];

export const CASES = [
  {
    kicker: "SOC AUTOMATION",
    title: "SIEM Log-Source Monitor",
    slug: "siem-log-source-monitor",
    body: [
      { h: "The problem, precisely", p: "An MSSP watches log feeds for many clients at once. The failure mode nobody budgets for is not a noisy alert — it is silence. When a log source dies, the dashboard simply stops mentioning it, and everything looks calm. In practice that meant dead feeds were discovered during an investigation, days later, when someone went looking for evidence that was never collected." },
      { h: "Why it is harder than it sounds", p: "“Is this input alive?” has no single answer. An input can be running but receiving nothing. It can be receiving a trickle when it should be receiving thousands. It can be perfectly healthy but belong to a client whose office is closed for the weekend. A naive zero-message check produces so many false positives that people mute it — which is worse than no monitoring at all." },
      { h: "How I built it", p: "A Python service runs hourly against each client's SIEM over its REST API. For every input it pulls the cluster-wide state, counts messages in the last 60 minutes and the 60 minutes before that, and fetches the timestamp of the most recent message across a 7-day lookback. Those three signals together separate dead from merely quiet far better than any one of them alone." },
      { h: "Classification", p: "CRITICAL covers an unreachable instance, a stopped input, a zero-message window, or an expected input that has vanished from the configuration entirely. WARNING covers a volume drop of more than 80% against the previous window — but only when the baseline was meaningful, which kills the false positives that come from low-traffic sources. Every threshold is tunable per client, with ignore lists and expected-input assertions." },
      { h: "Access model", p: "This is the part most monitoring tools get wrong. Rather than a shared admin credential, each client gets a dedicated service account with a custom role scoped to read-only input monitoring — nothing else. Authentication is by API token, and instances that are not directly reachable are reached through Cloudflare Access service tokens rather than a VPN. The monitoring system cannot read log contents; it can only ask whether logs arrived." },
      { h: "What happened in the pilot", p: "On the first client, within the first day, it caught a Domain Controller feed that fell from 26,548 messages per hour to zero in the middle of a working day. It also surfaced two Check Point inputs that had been silently dead long enough that nobody remembered them being alive. Detection time for failed log feeds went from days to under an hour." },
      { h: "Where it is now", p: "Rolling out across the remaining clients. Reports are severity-sorted HTML and Excel, emailed to the IT team, with monitoring-friendly exit codes and an only-on-issues mode so it stays quiet when everything is healthy. The package ships with a mock SIEM server for demos and regression testing." },
    ],
    problem: "An MSSP's client log feeds were failing silently — dead log sources went unnoticed for days, discovered only mid-investigation.",
    build: "Python platform verifying hourly, per client, that every SIEM log source is alive: REST API interrogation, sliding-window volume analysis, severity classification, and emailed HTML/Excel reports. Least-privilege service accounts with Cloudflare Zero Trust reachability.",
    result: "Detection cut from days to under one hour. First pilot caught a live Domain Controller feed outage (26,548 msgs/hr → 0) the same day it happened.",
    stack: ["Python", "REST APIs", "SIEM", "Cloudflare Access", "SMTP"],
  },
  {
    kicker: "THREAT INTELLIGENCE",
    title: "dwcollector — Dark-Web Exposure Monitor",
    slug: "dwcollector",
    body: [
      { h: "The problem, precisely", p: "A client wants to know whether their data — corporate domains, employee emails, API keys, customer card numbers — has leaked onto Tor hidden services or is being sold on a criminal marketplace. Commercial platforms answer that question as a service, which means your watchlist — a list of exactly what you are most afraid of losing — lives on someone else's infrastructure. dwcollector answers it as infrastructure the client runs and controls." },
      { h: "Evidence-only by design", p: "It stores the fact of a match plus roughly sixty characters of surrounding context — never the leaked dataset itself. Secrets and PII are masked at the moment of capture, not at display time. If the monitoring system is ever compromised, it holds no leaked data to lose. That constraint shaped every other decision in the tool." },
      { h: "The clone problem", p: "The dark web is thick with phishing mirrors — pixel-perfect copies of real marketplaces built to steal deposits. A naive crawler that finds a client's email on some onion that merely looks like a known forum produces an alert an analyst cannot act on, because nobody knows whether that site is real or a scammer's replica. Solving this is the architectural spine of the whole tool." },
      { h: "Fingerprinting and clustering", p: "Every live page gets a 64-bit simhash over word tokens. Pages within a Hamming distance of 3 are unioned into clusters using union-find, so single-linkage transitivity holds: if A matches B and B matches C, all three cluster even when A and C are not directly similar. Pages with an empty fingerprint are deliberately never unioned, which prevents every untokenizable page from collapsing into one bogus cluster." },
      { h: "Trust flows only from anchors", p: "Each cluster elects a canonical member by strict precedence: an operator allowlist wins; failing that, a page whose scraped PGP fingerprint matches a known-good key; failing that, the earliest seen; last, the most inbound links. An allowlisted canonical becomes verified. A PGP-matched canonical becomes probable. Anything elected by the fallback routes becomes unknown — explicitly not trusted. Every non-canonical member becomes a suspected clone. The safety property this buys: a phishing clone whose genuine original was never crawled sits alone, becomes its own canonical by first-seen, and lands at unknown. It cannot be mistaken for legitimate merely by standing alone." },
      { h: "The safety cutout", p: "Every cycle, each trusted anchor is re-fetched and — for PGP-anchored sites — its advertised fingerprint re-checked. On mismatch the code bails before that URL is ever added to the covered set. That ordering does two jobs at once: the client's watchlist is never transmitted to a hijacked or impersonated site, and existing findings stay open rather than falsely resolving." },
      { h: "Matching and validation", p: "Five term modes: literal, regex, defang-aware fuzzy (bracket notation, dot and at spellings, zero-width characters, Cyrillic homoglyph folding), encoded (base64, hex, percent), and credential-pair — which records the identifier and masks the secret. PII detectors validate rather than pattern-match: Luhn for cards, mod-97 for IBANs, area/group/serial rules for SSNs. Each produces one finding per site per detector with an occurrence count, so a dump of ten thousand cards does not generate ten thousand alerts." },
      { h: "The analyst layer", p: "Findings carry a machine-owned status and an analyst-owned disposition, and no reconciler ever writes the latter. Detection is the machine's job; judgment is the analyst's. Dispositions are sticky across the open and resolved lifecycle, so a finding dismissed once stays dismissed when it reopens months later. Above that sit triage queues, incident cases with append-only timelines, and per-client reports." },
      { h: "Engineering notes", p: "All egress goes through a containerised Tor SOCKS5 proxy — there is no clearnet path anywhere in the code, including seed harvesting. The crawler recovers from being killed mid-flight by resetting stranded rows on startup, which is what lets it survive OOM and reboots in a 24/7 loop. Alert emission is wrapped per-sink so no webhook or database failure can propagate into the supervisor loop." },
    ],
    problem: "Commercial dark-web monitoring platforms cost six figures and hold your watchlist data. Clients wanted the capability — self-hosted, evidence-only.",
    build: "24/7 async Tor crawler with a clone-detection trust model: simhash fingerprinting, union-find clustering, PGP/allowlist trust anchoring. Five matching modes, checksum-validated PII detectors, secrets masked at capture. Full analyst triage layer with findings, dispositions, and cases.",
    result: "Live infrastructure crawling thousands of onion URLs — a phishing mirror can never be mistaken for a real marketplace, and leaked secrets are never stored.",
    stack: ["Python", "asyncio", "Tor", "SQLite", "simhash"],
  },
  {
    kicker: "SECURE SDLC",
    title: "ACS FRAT — Flight Risk Assessment Platform",
    slug: "acs-frat",
    body: [
      { h: "The problem, precisely", p: "An aviation team needed pre-flight risk assessment digitised — a questionnaire that produces a GO, Caution, or NO-GO decision before a flight. The stakes make the threat model unusual: this is not a system where a tampered value costs money. A forged score means a flight departs that should not have." },
      { h: "Trust nothing from the client", p: "The entire scoring calculation happens server-side. The client submits answers, not scores. That single decision removes a whole class of attack — you cannot manipulate a risk score, tamper with the questionnaire, select an aircraft or pilot you are not entitled to, or alter a final decision, because none of those values are ever accepted from the browser." },
      { h: "Access separation", p: "Pilots and administrators have genuinely separate workflows: a shared pilot access gateway on one side, full administrator authentication on the other, with protected routes, secure sessions, and server-side authorisation on every request rather than UI-level hiding." },
      { h: "What I reviewed it for", p: "IDOR, privilege escalation, authentication bypass, insecure direct database access, exposed secrets, stored XSS, SQL injection, and unauthorised access to generated PDF reports — the realistic attack surface for a role-separated web application handling operational data." },
      { h: "The secret audit", p: "I ran a repository-wide sweep for secrets and sensitive data across both the working tree and the full Git history, using automated detection alongside manual review, and confirmed no production credentials had ever been committed. Real crew information in tracked demo data was replaced with synthetic records, sample PDF reports were sanitised, and controls were added to stop operational personnel data from entering source control again." },
      { h: "Making it stay fixed", p: "A one-off audit decays. A GitHub Actions secret-scanning workflow now runs on every push with redacted output and least-privilege workflow permissions, so the guarantee is continuous rather than a moment in time. Alongside it: hardened environment-variable handling, service-role separation, private report storage, and tightened production configuration." },
      { h: "Requirements I set for the team", p: "Row Level Security at the database layer, rate limiting and brute-force protection, access-code rotation, session revocation, audit logging, and immutable historical assessment records — so that what a flight was cleared on can never be quietly rewritten after the fact." },
    ],
    problem: "An aviation team needed pre-flight risk assessment digitized — where a tampered score could mean a wrong GO decision.",
    build: "Security lead on a Next.js/Supabase platform: server-calculated GO/Caution/NO-GO decisions, role-separated access control, server-side validation against score manipulation, Row Level Security, Git-history secret audits, and Gitleaks CI scanning.",
    result: "A production safety platform where the risk decision cannot be forged from the client side — and no secret or crew record ever entered source control.",
    stack: ["Next.js", "TypeScript", "Supabase", "GitHub Actions", "Gitleaks"],
  },
  {
    kicker: "APPLIED ML",
    title: "Dynamic Malware Detection",
    slug: "dynamic-malware-detection",
    body: [
      { h: "The premise", p: "Static signatures miss novel malware, because changing a file's bytes is trivial while changing what it does is not. Behaviour is the more honest signal — so the question becomes how to model a sequence of actions rather than a file." },
      { h: "The pipeline", p: "Samples execute in a sandbox, and their API call sequences are logged with timestamps. Sequences are cleaned and padded to a fixed length, with class imbalance handled through SMOTE and class weighting rather than being ignored — malware datasets are almost never balanced, and accuracy on an imbalanced set is a meaningless number." },
      { h: "Why embeddings", p: "API calls are treated like words: Word2Vec and API2Vec turn each call into a vector, so calls that appear in similar contexts end up near each other. That gives the model a notion of similarity between operations it has never seen in that exact order — which is the whole point when the threat is novel." },
      { h: "The model", p: "A Bidirectional GRU with an attention layer, feeding a dense sigmoid head. Bidirectional because malicious intent is often only obvious in hindsight — a benign-looking call early in a sequence reads differently once you know what followed. Attention because it surfaces which calls drove a verdict, which matters if an analyst has to defend the classification." },
      { h: "Evaluation", p: "Scored on accuracy, AUC, confusion matrix, and a full classification report, with the reporting flow designed for analyst consumption rather than a single headline number." },
    ],
    problem: "Static signatures miss novel malware. Behavior doesn't lie — but API-call sequences need real sequence modeling.",
    build: "End-to-end pipeline: sandboxed execution, API-call sequence logging, Word2Vec/API2Vec embeddings, and a Bidirectional GRU with attention. SMOTE for class imbalance; evaluated on accuracy, AUC, and confusion matrix.",
    result: "A working behavioral classifier separating malicious from benign executions — the AI capability, proven on a security problem.",
    stack: ["Python", "Word2Vec", "BiGRU", "Attention", "SMOTE"],
  },
];

export const PROCESS = [
  { step: "01", title: "Scope", desc: "A short call. We define targets, rules of engagement, and what success looks like. You get a fixed quote — no surprises." },
  { step: "02", title: "Execute", desc: "The work happens: testing, building, or both. You get progress updates in plain language, not jargon." },
  { step: "03", title: "Report", desc: "Findings with reproduction steps and prioritized fixes — or shipped code with documentation. Deliverables you can hand to your team as-is." },
  { step: "04", title: "Verify", desc: "I retest what you fixed, free. The engagement ends when the risk is actually gone, not when the invoice is sent." },
];

export const TOOLS = [
  "Burp Suite", "Nmap", "Metasploit", "Wireshark", "Kali Linux", "Python",
  "Next.js", "TypeScript", "Supabase", "PostgreSQL", "GitHub Actions",
  "Docker", "Tor", "Cloudflare Zero Trust", "AWS", "Terraform",
];

/* ─────────────────────────────────────────────────────────────────────────────
 * CLIENT-FACING COMMERCIALS
 * Everything below is meant to be edited by hand. The prices are sensible
 * starting anchors, not researched quotes — set your real numbers before this
 * goes in front of a buyer.
 * ────────────────────────────────────────────────────────────────────────── */

export const WHATSAPP = "919209279973"; // country code + number, digits only
export const BOOKING_URL = "https://cal.com/amansploit";

/** Engagement packages. `from` values are INR; `usd` is the rough equivalent. */
export const PACKAGES = [
  {
    name: "Web App Assessment",
    from: 45000,
    usd: 530,
    duration: "4–6 days",
    best: "A single web application or dashboard",
    includes: [
      "Manual testing — not an automated scan",
      "Full OWASP Top 10 coverage",
      "Authentication & authorisation testing",
      "Report with reproduction steps and fixes",
      "One free retest after you fix things",
    ],
  },
  {
    name: "Web + API Assessment",
    from: 85000,
    usd: 1000,
    duration: "7–10 days",
    best: "A product with a REST API and multiple user roles",
    featured: true,
    includes: [
      "Everything in Web App Assessment",
      "REST API testing (authz, IDOR, rate limits)",
      "Role-matrix and privilege-escalation testing",
      "Business-logic abuse cases",
      "Executive summary for non-technical stakeholders",
      "One free retest after you fix things",
    ],
  },
  {
    name: "Security Engineering",
    from: 9000,
    usd: 105,
    unit: "/ day",
    duration: "Retainer or project",
    best: "Tooling, automation, SIEM work, or secure builds",
    includes: [
      "Custom detection & monitoring tooling",
      "SIEM/log-pipeline engineering",
      "Secure full-stack development",
      "CI/CD hardening & secret scanning",
      "Documented, handover-ready code",
    ],
  },
];

/** Drives the estimator. Multipliers apply to the base package price. */
export const ESTIMATOR = {
  scope: [
    { id: "web", label: "Web app", base: 45000, usd: 530 },
    { id: "webapi", label: "Web app + API", base: 85000, usd: 1000 },
    { id: "mobile", label: "Mobile app", base: 65000, usd: 765 },
    { id: "infra", label: "Network / infrastructure", base: 55000, usd: 650 },
  ],
  size: [
    { id: "s", label: "Small (a few screens, 1 role)", mult: 1 },
    { id: "m", label: "Medium (several modules, 2–3 roles)", mult: 1.5 },
    { id: "l", label: "Large (complex product, many roles)", mult: 2.2 },
  ],
  extras: [
    { id: "retest", label: "Extra retest round", add: 8000, usd: 95 },
    { id: "threat", label: "Threat model & architecture review", add: 15000, usd: 175 },
    { id: "rush", label: "Rush (start within a week)", mult: 1.2 },
  ],
};

/**
 * Real client quotes only. Leave this empty until you have permission to
 * publish one — the section renders nothing while the array is empty.
 * Never place invented testimonials here.
 */
export const TESTIMONIALS: {
  quote: string;
  name: string;
  role: string;
}[] = [];

/** Credentials. Add the public verification URL as you collect them. */
export const CREDENTIALS = [
  { name: "CEH Master", issuer: "EC-Council", verify: "" },
  { name: "CompTIA Security+", issuer: "CompTIA", verify: "" },
  { name: "Certified Network Defender", issuer: "EC-Council", verify: "" },
  { name: "ECSS", issuer: "EC-Council", verify: "" },
  { name: "Top 1% — TryHackMe", issuer: "TryHackMe", verify: "" },
];

/** Places the work has happened. Text-only, no logo assets needed. */
export const AFFILIATIONS = [
  "LTS",
  "InLighnX Global",
  "Coventry University",
  "EC-Council University",
  "PSB Academy",
];

/**
 * Organisations, with the relationship stated.
 *
 * Deliberately NOT labelled "trusted by". None of these are clients — they are
 * an employer, an internship, two universities and a certifying body. A strip
 * of institution names under a "trusted by" heading reads as a customer list,
 * and on a site whose entire argument is that it doesn't overstate things, that
 * would be the most expensive sentence on the page. Each entry carries its own
 * relationship label so the claim is exactly true.
 *
 * `mark` is a typographic monogram rendered in the site's own fonts, not the
 * organisation's logo. Shipping third-party trademark files on a commercial
 * site needs permission nobody has asked for, and a set of mismatched logos
 * looks like a scrapbook. A designed monogram set looks intentional and is
 * entirely ours to use.
 */
export interface Org {
  name: string;
  mark: string;
  relationship: string;
  detail: string;
}

export const ORGS: Org[] = [
  { name: "LTS", mark: "LTS", relationship: "Employer", detail: "Security Analyst — SOC tooling and automation" },
  { name: "InLighnX Global", mark: "iX", relationship: "Internship", detail: "Offensive security — web, API, mobile, thick client" },
  { name: "EC-Council", mark: "EC", relationship: "Certifying body", detail: "CEH Master · CND · ECSS" },
  { name: "CompTIA", mark: "C+", relationship: "Certifying body", detail: "Security+" },
  { name: "Coventry University", mark: "CU", relationship: "Degree", detail: "BSc (Hons) Cybersecurity" },
  { name: "EC-Council University", mark: "ECU", relationship: "In progress", detail: "MSc Cyber Security" },
];

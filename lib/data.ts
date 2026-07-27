export const LINKS = {
  email: "aman.s.732002@gmail.com",
  linkedin: "https://www.linkedin.com/in/aman-sonkamble",
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

export const CASES = [
  {
    kicker: "SOC AUTOMATION",
    title: "SIEM Log-Source Monitor",
    problem: "An MSSP's client log feeds were failing silently — dead log sources went unnoticed for days, discovered only mid-investigation.",
    build: "Python platform verifying hourly, per client, that every SIEM log source is alive: REST API interrogation, sliding-window volume analysis, severity classification, and emailed HTML/Excel reports. Least-privilege service accounts with Cloudflare Zero Trust reachability.",
    result: "Detection cut from days to under one hour. First pilot caught a live Domain Controller feed outage (26,548 msgs/hr → 0) the same day it happened.",
    stack: ["Python", "REST APIs", "SIEM", "Cloudflare Access", "SMTP"],
  },
  {
    kicker: "THREAT INTELLIGENCE",
    title: "dwcollector — Dark-Web Exposure Monitor",
    problem: "Commercial dark-web monitoring platforms cost six figures and hold your watchlist data. Clients wanted the capability — self-hosted, evidence-only.",
    build: "24/7 async Tor crawler with a clone-detection trust model: simhash fingerprinting, union-find clustering, PGP/allowlist trust anchoring. Five matching modes, checksum-validated PII detectors, secrets masked at capture. Full analyst triage layer with findings, dispositions, and cases.",
    result: "Live infrastructure crawling thousands of onion URLs — a phishing mirror can never be mistaken for a real marketplace, and leaked secrets are never stored.",
    stack: ["Python", "asyncio", "Tor", "SQLite", "simhash"],
  },
  {
    kicker: "SECURE SDLC",
    title: "ACS FRAT — Flight Risk Assessment Platform",
    problem: "An aviation team needed pre-flight risk assessment digitized — where a tampered score could mean a wrong GO decision.",
    build: "Security lead on a Next.js/Supabase platform: server-calculated GO/Caution/NO-GO decisions, role-separated access control, server-side validation against score manipulation, Row Level Security, Git-history secret audits, and Gitleaks CI scanning.",
    result: "A production safety platform where the risk decision cannot be forged from the client side — and no secret or crew record ever entered source control.",
    stack: ["Next.js", "TypeScript", "Supabase", "GitHub Actions", "Gitleaks"],
  },
  {
    kicker: "APPLIED ML",
    title: "Dynamic Malware Detection",
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

/**
 * Engagement paperwork, as a single source of truth.
 *
 * The web page renders this and the .docx generator reads the same structure,
 * so the downloadable file cannot quietly drift from the published version —
 * which matters more than usual here, because these are documents people sign.
 *
 * On the legal disclaimer: it is prominent and it is meant literally. A rules
 * of engagement document is operational and squarely within a tester's
 * competence to draft. An NDA is a contract, and publishing one is providing a
 * starting point, not legal advice. Both say so on the page and in the file.
 */

export interface Clause {
  h: string;
  /** Paragraphs. `[]` placeholders are meant to be filled in. */
  p: string[];
  /** Optional bullets under the paragraphs. */
  items?: string[];
}

export interface Template {
  slug: string;
  title: string;
  short: string;
  blurb: string;
  /** Shown as a banner on the page and at the top of the document. */
  caveat: string;
  clauses: Clause[];
}

export const ROE: Template = {
  slug: "rules-of-engagement",
  title: "Rules of Engagement",
  short: "Rules of engagement",
  blurb:
    "The document that says exactly what will be tested, when, by whom, and what happens when something goes wrong. Agreed before any testing starts — including on engagements that feel too small to need one.",
  caveat:
    "This is a working template, not legal advice. It covers the operational agreement between a tester and a client. Where it touches liability or indemnity, have your own counsel look at it.",
  clauses: [
    {
      h: "1. Parties and authorisation",
      p: [
        "This document is between [CLIENT LEGAL NAME] (\"the Client\") and [TESTER NAME] (\"the Tester\"), and covers security testing performed between the dates set out in section 3.",
        "The Client confirms it owns the systems listed in section 2, or holds written authorisation from their owner to permit testing. The Tester is entitled to rely on that confirmation and will stop immediately if it turns out to be wrong.",
        "Where systems are hosted by a third party whose terms require notification or consent before testing — cloud providers, managed hosting, SaaS platforms — obtaining that consent is the Client's responsibility, and testing of those systems will not begin until the Client confirms it is in place.",
      ],
    },
    {
      h: "2. Scope",
      p: [
        "In scope. Only the following are authorised for testing. Anything not listed here is out of scope, including systems discovered during testing that appear to belong to the Client.",
      ],
      items: [
        "[DOMAIN / APPLICATION URL] — [description, environment: production or staging]",
        "[API BASE URL] — [description]",
        "[IP RANGE, in CIDR] — [description]",
        "Test accounts: [ROLE] / [ROLE] — supplied by the Client before the window opens",
      ],
    },
    {
      h: "3. Out of scope",
      p: [
        "The following are explicitly excluded and will not be tested under this agreement:",
      ],
      items: [
        "Denial-of-service and resource-exhaustion testing of any kind",
        "Social engineering of Client staff, including phishing and pretexting, unless separately agreed in writing",
        "Physical access and physical security controls",
        "Third-party services the Client does not own, even where they are reachable from an in-scope host",
        "Any host or domain not named in section 2",
        "[ADD ANY CLIENT-SPECIFIC EXCLUSIONS: payment processor, production database, particular business hours]",
      ],
    },
    {
      h: "4. Testing window",
      p: [
        "Testing will take place between [START DATE, TIME, TIMEZONE] and [END DATE, TIME, TIMEZONE].",
        "Automated traffic will be limited to [RATE] requests per second against any single host. If the Client requires testing to be confined to particular hours, those are: [HOURS].",
        "Testing will originate from the following addresses, so the Client can allowlist or attribute traffic: [SOURCE IPs].",
      ],
    },
    {
      h: "5. Permitted and prohibited techniques",
      p: [
        "Permitted: reconnaissance, enumeration, authentication and authorisation testing, injection testing, business-logic testing, and manual exploitation to the minimum extent needed to demonstrate impact.",
        "Prohibited without separate written agreement: any action intended to degrade availability; modification or deletion of Client data; installation of persistence; pivoting to systems outside section 2; and extraction of production data at volume.",
        "Where proving a finding would require extracting data at scale, the Tester will stop at the point the issue is demonstrated and describe the remaining path rather than walking it.",
      ],
    },
    {
      h: "6. Contacts and escalation",
      p: [
        "Client technical contact: [NAME, PHONE, EMAIL]. Available during the testing window.",
        "Client escalation contact: [NAME, PHONE, EMAIL]. For anything urgent outside working hours.",
        "Tester: [NAME, PHONE, EMAIL].",
        "Both parties confirm these contacts are reachable during the window. An engagement where nobody answers the phone at 9pm is an engagement where a mistake becomes an incident.",
      ],
    },
    {
      h: "7. Critical findings and incidents",
      p: [
        "On discovering a finding assessed as critical — remote code execution, authentication bypass, or exposure of personal data at scale — the Tester will stop testing that component and notify the Client's technical contact within [2] hours rather than waiting for the report.",
        "On discovering evidence of a prior or ongoing compromise by a third party, the Tester will notify the Client immediately, preserve what has already been observed, and take no further action on that system without instruction.",
        "If testing appears to have caused an outage, data loss, or any unintended change, the Tester will notify the Client immediately — before establishing whether the Tester was in fact the cause.",
      ],
    },
    {
      h: "8. Evidence and data handling",
      p: [
        "Evidence will be limited to what is needed to prove a finding exists and allow the Client's engineers to reproduce it. Where a finding exposes personal data, the minimum will be recorded, with identifying fields masked at the point of capture.",
        "Evidence is stored encrypted on hardware controlled by the Tester, is not processed by any third-party service including AI tools, and is deleted [30] days after the retest concludes or immediately on the Client's request.",
        "Credentials issued for testing are stored in a password manager, are never committed to a repository or reused across engagements, and are to be revoked by the Client at the end of the engagement.",
      ],
    },
    {
      h: "9. Deliverables",
      p: [
        "The Client will receive a written report containing: an executive summary in business terms; an explicit statement of what was not tested and why; findings ranked by assessed impact with reproduction steps sufficient for the Client's own engineers to verify each one; remediation guidance; and a record of controls found to be working.",
        "Delivery: within [5] working days of the testing window closing.",
        "One retest of the reported findings is included, to be used within [90] days of delivery. A finding is closed when the original reproduction steps no longer work, not when a fix is deployed.",
      ],
    },
    {
      h: "10. Confidentiality and disclosure",
      p: [
        "Findings are the Client's. The Tester will not publish, present, or otherwise disclose them — including in anonymised form — without the Client's written permission.",
        "Where testing discovers a vulnerability in third-party software rather than in the Client's own systems, the Tester may wish to report it to that vendor. This will be raised with the Client first, and any such report will describe the flaw without identifying the Client.",
      ],
    },
    {
      h: "11. Acceptance",
      p: [
        "Both parties agree to the scope, window, exclusions and contacts set out above. Changes to scope must be agreed in writing before the affected testing begins.",
        "",
        "Client: [NAME]    Role: [ROLE]    Signature: ____________________    Date: __________",
        "",
        "Tester: [NAME]    Signature: ____________________    Date: __________",
      ],
    },
  ],
};

export const NDA: Template = {
  slug: "nda",
  title: "Mutual Non-Disclosure Agreement",
  short: "Mutual NDA",
  blurb:
    "A short, plain-English mutual NDA covering a security engagement. Mutual because the tester sees the client's systems and the client sees the tester's methods — one-way NDAs in this context are usually a sign nobody read it.",
  caveat:
    "This is a starting point, not legal advice, and I am not a lawyer. It is deliberately short and readable rather than exhaustive. Have your own counsel review it before signing, particularly the governing law and liability clauses, and particularly if either party is outside India.",
  clauses: [
    {
      h: "1. Parties",
      p: [
        "This agreement is made between [PARTY A LEGAL NAME], of [ADDRESS], and [PARTY B LEGAL NAME], of [ADDRESS], and takes effect from [DATE].",
        "It applies to information disclosed by either party to the other in connection with [DESCRIPTION OF ENGAGEMENT].",
      ],
    },
    {
      h: "2. What is confidential",
      p: [
        "Confidential Information means non-public information disclosed by one party (the Discloser) to the other (the Recipient), in any form, that is either marked confidential or that a reasonable person would understand to be confidential given its nature and the circumstances of disclosure.",
        "It includes, without limiting the above: system architecture and configuration; source code; credentials; security findings and vulnerability details; business plans, pricing and customer information; and the testing methodology, tooling and report formats of the Tester.",
      ],
    },
    {
      h: "3. What is not confidential",
      p: ["This agreement does not apply to information that:"],
      items: [
        "was already lawfully known to the Recipient without an obligation of confidence, and the Recipient can show it;",
        "is or becomes public through no act or omission of the Recipient;",
        "is lawfully received from a third party who is free to disclose it;",
        "was independently developed by the Recipient without reference to the Confidential Information.",
      ],
    },
    {
      h: "4. Obligations",
      p: [
        "The Recipient will use the Confidential Information only for the purpose described in section 1, will protect it with at least the care it applies to its own confidential information and in no case less than reasonable care, and will not disclose it to anyone except employees, contractors or advisers who need it for that purpose and are bound by obligations no less protective than these.",
        "The Recipient remains responsible for any breach by a person it discloses to.",
      ],
    },
    {
      h: "5. Required disclosure",
      p: [
        "If the Recipient is required by law, regulation or court order to disclose Confidential Information, it may do so — but will, where lawful and practicable, notify the Discloser first and in enough time for the Discloser to seek protection, and will disclose only what is required.",
      ],
    },
    {
      h: "6. Security findings",
      p: [
        "Vulnerability details disclosed under this agreement are Confidential Information and will not be published, presented or shared without the Discloser's written permission.",
        "This does not prevent either party from reporting a vulnerability in third-party software to that software's vendor, provided the report does not identify the Discloser or its systems.",
      ],
    },
    {
      h: "7. Term",
      p: [
        "The obligations in this agreement begin on the date in section 1 and continue for [3] years after the engagement ends, except for information that constitutes a trade secret under applicable law, where they continue for as long as it remains one.",
      ],
    },
    {
      h: "8. Return and destruction",
      p: [
        "On written request, the Recipient will return or destroy the Confidential Information in its possession and confirm in writing that it has done so, except for copies retained automatically by routine backup systems and copies it is required by law to keep — which remain subject to this agreement for as long as they are held.",
      ],
    },
    {
      h: "9. No licence, no obligation",
      p: [
        "Nothing here transfers ownership of, or grants any licence to, any intellectual property. Nothing here obliges either party to disclose anything, or to enter into any further agreement.",
      ],
    },
    {
      h: "10. General",
      p: [
        "This agreement is governed by the laws of [JURISDICTION], and the courts of [JURISDICTION] have exclusive jurisdiction over any dispute arising from it.",
        "It is the entire agreement between the parties on this subject and replaces any prior understanding about it. Any change must be in writing and signed by both parties. If any provision is found unenforceable, the rest continues to apply.",
        "",
        "[PARTY A]    Name: ____________________    Signature: ____________________    Date: __________",
        "",
        "[PARTY B]    Name: ____________________    Signature: ____________________    Date: __________",
      ],
    },
  ],
};

export const TEMPLATES: Template[] = [ROE, NDA];
export const templateBySlug = (s: string) => TEMPLATES.find((t) => t.slug === s);

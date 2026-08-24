/**
 * Legal citations used in the evidence pack and the escalation drafts.
 *
 * Verified 24 Aug 2026. Two cautions for whoever maintains this:
 *
 * 1. The BNS 2023 replaced the IPC, and a great deal of material online still
 *    cites the old sections. IPC 419 → BNS 319 is the provision that actually
 *    fits a fake social-media account; most impersonation guides still lead with
 *    defamation, which is the weaker claim.
 * 2. Rule 3(2)(b) was confirmed against secondary analysis rather than the
 *    gazette notification. Before this text goes in front of a police officer,
 *    check it against the official MeitY notification.
 *
 * Nothing here is legal advice and the drafts say so.
 */

export type Citation = {
  ref: string;
  title: string;
  what: string;
  /** Which severity levels this provision actually bears on. */
  applies: ReadonlyArray<"existing" | "posting_photos" | "messaging_contacts" | "asking_money">;
};

export const CITATIONS: readonly Citation[] = [
  {
    ref: "Section 66C, Information Technology Act 2000",
    title: "Identity theft",
    what:
      "Fraudulently or dishonestly using the electronic signature, password or any other unique identification feature of another person. Punishable with imprisonment up to three years and a fine up to one lakh rupees.",
    applies: ["existing", "posting_photos", "messaging_contacts", "asking_money"],
  },
  {
    ref: "Section 66D, Information Technology Act 2000",
    title: "Cheating by personation using a computer resource",
    what:
      "Cheating by personation by means of any communication device or computer resource. Punishable with imprisonment up to three years and a fine up to one lakh rupees.",
    applies: ["messaging_contacts", "asking_money"],
  },
  {
    ref: "Section 319, Bharatiya Nyaya Sanhita 2023",
    title: "Cheating by personation",
    what:
      "Pretending to be another person, including through a fake email address, website or social media account, in order to cheat. This replaced Section 419 of the Indian Penal Code and is the provision that most directly fits a fake profile.",
    applies: ["existing", "posting_photos", "messaging_contacts", "asking_money"],
  },
  {
    ref: "Section 318, Bharatiya Nyaya Sanhita 2023",
    title: "Cheating",
    what:
      "Cheating, including where carried out through online means such as payment fraud. Replaced Section 420 of the Indian Penal Code.",
    applies: ["asking_money"],
  },
  {
    ref: "Section 356, Bharatiya Nyaya Sanhita 2023",
    title: "Defamation",
    what:
      "Publishing material that harms another person's reputation, including on social media. Replaced Sections 499 and 500 of the Indian Penal Code.",
    applies: ["posting_photos", "messaging_contacts", "asking_money"],
  },
  {
    ref: "Section 78, Bharatiya Nyaya Sanhita 2023",
    title: "Stalking",
    what:
      "Monitoring a woman's use of the internet or electronic communication, or repeatedly contacting her against her wishes. Replaced Section 354D of the Indian Penal Code.",
    applies: ["messaging_contacts"],
  },
  {
    ref: "Rule 3(2)(b), IT (Intermediary Guidelines and Digital Media Ethics Code) Rules 2021",
    title: "24-hour removal obligation",
    what:
      "On receiving a complaint about content that is prima facie in the nature of impersonation of a person, including artificially morphed images, an intermediary must take all reasonable and practicable measures to remove or disable access to it within 24 hours. Impersonation sits in the expedited category, not the general 15-day track.",
    applies: ["existing", "posting_photos", "messaging_contacts", "asking_money"],
  },
  {
    ref: "Rule 3(2)(a), IT Rules 2021",
    title: "Grievance Officer duties",
    what:
      "Every significant social media intermediary must publish the name and contact details of a Grievance Officer, acknowledge a complaint within 24 hours, and dispose of it within 15 days.",
    applies: ["existing", "posting_photos", "messaging_contacts", "asking_money"],
  },
  {
    ref: "Rule 3A, IT Rules 2021",
    title: "Grievance Appellate Committee",
    what:
      "Where the intermediary's Grievance Officer does not resolve a complaint within 15 days, or the decision is unsatisfactory, the user may appeal to the Grievance Appellate Committee at gac.gov.in, which must dispose of the appeal within 30 days.",
    applies: ["existing", "posting_photos", "messaging_contacts", "asking_money"],
  },
];

export function citationsFor(severity: string): readonly Citation[] {
  return CITATIONS.filter((c) =>
    c.applies.includes(severity as (typeof c.applies)[number]),
  );
}

export const CONTACTS = {
  helpline: "1930",
  portal: "https://cybercrime.gov.in",
  gac: "https://gac.gov.in",
  // TODO — verify against Meta's current India grievance page before shipping.
  // Platforms rotate these addresses and a bounced escalation email costs the
  // victim the 15-day clock.
  metaGrievanceUrl: "https://www.facebook.com/help/instagram/contact/383679321740945",
  metaGrievancePage: "https://help.instagram.com/519522125107875",
  stopNCII: "https://stopncii.org",
} as const;

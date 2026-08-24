export type Rung = {
  day: number;
  title: string;
  body: string;
  draftKey?: string;
};

/**
 * The escalation ladder, keyed off how old the case is.
 *
 * Sequencing matters more than the contents. The single biggest mistake victims
 * make is doing everything on day one and then nothing — reporting once, waiting,
 * and assuming silence means it is being handled. Each rung exists because the
 * previous one has a defined clock that has now expired, which is also what makes
 * the later escalations credible: you can point at the deadline that was missed.
 */
export const LADDER: readonly Rung[] = [
  {
    day: 0,
    title: "Friend swarm and the official report",
    body:
      "Send your case link everywhere you have people — class groups, work groups, family. Volume from distinct real accounts in a short window is the strongest signal available to you. File the official impersonation form yourself at the same time; a form filed by the person being impersonated carries weight the crowd reports do not.",
    draftKey: "meta_form",
  },
  {
    day: 1,
    title: "Check the 24-hour acknowledgement",
    body:
      "Rule 3(2)(a) requires the platform to acknowledge your complaint within 24 hours. If nothing has arrived, note that — a missed statutory acknowledgement is the first thing worth citing in every later escalation.",
  },
  {
    day: 2,
    title: "Re-report under harassment",
    body:
      "Report the account a second time, choosing the harassment or bullying category rather than impersonation. It routes to a different review queue with different reviewers. This is not gaming the system; the same account genuinely breaches both policies, and impersonation queues are heavily backlogged.",
  },
  {
    day: 3,
    title: "Grievance Officer, citing the 24-hour rule",
    body:
      "Escalate in writing. Most templates online cite the 15-day resolution period, which is the weaker obligation. Impersonation sits in Rule 3(2)(b) — the 24-hour removal category — and that deadline has already passed. Say so.",
    draftKey: "grievance",
  },
  {
    day: 5,
    title: "File on the cybercrime portal",
    body:
      "File at cybercrime.gov.in regardless of whether the account has come down. It creates a record with a reference number, and the request to preserve logs matters most while those logs still exist.",
    draftKey: "cybercrime",
  },
  {
    day: 7,
    title: "FIR at the cyber cell",
    body:
      "Take printed evidence, your ID, and copies of every complaint you have filed. An FIR is what gives police the standing to compel the platform for subscriber data — a portal complaint alone usually does not.",
    draftKey: "fir",
  },
  {
    day: 16,
    title: "Appeal to the Grievance Appellate Committee",
    body:
      "The 15-day disposal period under Rule 3(2)(a) has now expired. Appeal at gac.gov.in under Rule 3A. The Committee must dispose of the appeal within 30 days, and platforms treat a live GAC appeal very differently from an unanswered email.",
    draftKey: "gac",
  },
];

export function rungsFor(createdAt: string): Array<Rung & { due: boolean; ageDays: number }> {
  const ageDays = Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000);
  return LADDER.map((r) => ({ ...r, due: ageDays >= r.day, ageDays }));
}

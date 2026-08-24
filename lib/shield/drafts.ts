import { CONTACTS, citationsFor } from "./legal";
import { profileUrl } from "./handles";

export type DraftCase = {
  id: string;
  platform: string;
  fake_handle: string;
  real_handle: string | null;
  display_name: string;
  severity: string;
  created_at: string;
};

export type Draft = {
  key: string;
  title: string;
  hint: string;
  body: string;
  /** Where this text is meant to be pasted or spoken. */
  destination?: { label: string; url: string };
};

const istDate = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "long", timeStyle: "short" });

const SEVERITY_HARM: Record<string, string> = {
  existing:
    "The account has copied my name and photographs and is presenting itself as me. It has not, to my knowledge, contacted anyone yet, but it is visible to anyone who searches for my name.",
  posting_photos:
    "The account is publishing my personal photographs as though they were its own. These images were taken from my genuine account without my knowledge or permission.",
  messaging_contacts:
    "The account is contacting my friends, family and colleagues while pretending to be me. People known to me have received messages they believed came from me.",
  asking_money:
    "The account is contacting my friends, family and colleagues while pretending to be me, and is asking them to send money. This is an ongoing financial fraud being committed in my name.",
};

/**
 * The formal documents are generated in English.
 *
 * This is a decision rather than an omission. Complaints on cybercrime.gov.in,
 * grievance escalations to a platform, and FIR annexures are filed in English in
 * practice, and a Hindi legal draft would need a lawyer's review before anyone
 * should put their name on it. What Shield translates instead is everything a
 * person *says or sends themselves* — the helpline script and the message
 * warning their contacts — because those are spoken under stress and being able
 * to read them in your own language matters far more there.
 */
export function buildDrafts(c: DraftCase, locale: "en" | "hi"): Draft[] {
  const fakeUrl = profileUrl(c.platform, c.fake_handle);
  const real = c.real_handle ? `@${c.real_handle}` : "(my genuine account)";
  const when = istDate(c.created_at);
  const platformName = c.platform.charAt(0).toUpperCase() + c.platform.slice(1);
  const cites = citationsFor(c.severity).map((x) => `  • ${x.ref} — ${x.title}`).join("\n");

  const drafts: Draft[] = [];

  drafts.push({
    key: "cybercrime",
    title: "Cybercrime portal complaint",
    hint: "Paste into the complaint description field at cybercrime.gov.in. Read it once and correct anything that does not match your situation.",
    destination: { label: "cybercrime.gov.in", url: CONTACTS.portal },
    body: `COMPLAINT REGARDING ONLINE IMPERSONATION

1. COMPLAINANT
   Name: ${c.display_name}
   Genuine ${platformName} account: ${real}

2. THE IMPERSONATING ACCOUNT
   Platform: ${platformName}
   Username: @${c.fake_handle}
   Profile URL: ${fakeUrl}

3. WHEN IT WAS DISCOVERED
   ${when} (IST)

4. WHAT IS HAPPENING
   ${SEVERITY_HARM[c.severity] ?? SEVERITY_HARM.existing}

   The account uses my name and my photographs. It was created without my
   knowledge or consent. I have no association with the person operating it.

5. HARM CAUSED
   People who know me are being deceived into believing they are communicating
   with me. This has caused damage to my reputation and distress to me and to
   the people contacted.${
     c.severity === "asking_money"
       ? "\n   Financial loss is being caused or attempted to persons known to me."
       : ""
   }

6. PROVISIONS APPEARING TO BE ATTRACTED
${cites}

7. RELIEF SOUGHT
   a) Direction to the platform to remove the impersonating account.
   b) Preservation of subscriber information, access logs and IP records
      relating to the account, before they are lost to retention limits.
   c) Investigation and appropriate action against the person operating it.

8. EVIDENCE
   Screenshots of the impersonating profile, captured with timestamps and
   cryptographic hashes, are attached. Case reference: ${c.id}

I declare that the above is true to the best of my knowledge and belief.`,
  });

  if (c.severity === "asking_money") {
    drafts.push({
      key: "helpline",
      title: locale === "hi" ? "1930 हेल्पलाइन — क्या कहना है" : "1930 helpline — what to say",
      hint:
        locale === "hi"
          ? "यह पढ़कर बोलें। अगर किसी ने पैसे भेज दिए हैं तो शुरुआती घंटे ही सबसे अहम हैं।"
          : "Read this out. If anyone has already paid, the first few hours decide whether the money can be frozen.",
      destination: { label: "Call 1930", url: "tel:1930" },
      body:
        locale === "hi"
          ? `नमस्ते, मुझे ऑनलाइन धोखाधड़ी की शिकायत दर्ज करानी है।

मेरा नाम ${c.display_name} है।

कोई व्यक्ति ${platformName} पर मेरे नाम से नकली अकाउंट चला रहा है। उसका
यूज़रनेम @${c.fake_handle} है। वह मेरे दोस्तों और परिवार से मेरा नाम लेकर
पैसे माँग रहा है।

मेरा असली अकाउंट ${real} है।

अगर किसी ने पैसे भेजे हैं तो मैं लेन-देन की जानकारी दे सकता/सकती हूँ।

कृपया मुझे शिकायत संख्या दे दीजिए।`
          : `Hello, I need to report an online financial fraud.

My name is ${c.display_name}.

Someone has created a fake ${platformName} account using my name and
photographs. The username is @${c.fake_handle}. They are contacting my
friends and family, pretending to be me, and asking them to send money.

My genuine account is ${real}.

If any transaction has already taken place I can provide the details.

Please give me a complaint reference number.`,
    });

    drafts.push({
      key: "warn",
      title: locale === "hi" ? "अपने संपर्कों को भेजने का संदेश" : "Message to send your contacts",
      hint:
        locale === "hi"
          ? "इसे अपने सभी ग्रुप्स में तुरंत भेजें। सबसे ज़रूरी काम यही है।"
          : "Send this to all your groups now. It is the single most useful thing you can do.",
      body:
        locale === "hi"
          ? `⚠️ ज़रूरी सूचना

किसी ने मेरे नाम और फ़ोटो से ${platformName} पर नकली अकाउंट बनाया है
(@${c.fake_handle}) और उससे लोगों से पैसे माँगे जा रहे हैं।

कृपया कोई पैसा न भेजें। कोई UPI, कोई ट्रांसफ़र नहीं।

मेरा असली अकाउंट ${real} है। अगर आपको मेरे नाम से पैसे का मैसेज आया है,
तो पहले मुझे फ़ोन करके पूछ लें।`
          : `⚠️ Important

Someone has made a fake ${platformName} account using my name and photos
(@${c.fake_handle}) and is asking people for money through it.

Please do not send anything. No UPI, no transfers.

My real account is ${real}. If you get a message from "me" asking for money,
call me first.`,
    });
  }

  drafts.push({
    key: "meta_form",
    title: `${platformName} impersonation report — what to enter`,
    hint: "The official form asks for these fields. Copy each answer across as you go.",
    destination: { label: "Official impersonation form", url: CONTACTS.metaGrievanceUrl },
    body: `WHO IS BEING IMPERSONATED?
  Me

FULL NAME
  ${c.display_name}

USERNAME OF THE IMPERSONATING ACCOUNT
  ${c.fake_handle}

LINK TO THE IMPERSONATING ACCOUNT
  ${fakeUrl}

YOUR OWN ACCOUNT
  ${c.real_handle ?? "(your genuine account username)"}

ADDITIONAL INFORMATION
  This account was created without my knowledge or consent. It uses my name
  and photographs taken from my genuine account ${real}.
  ${SEVERITY_HARM[c.severity] ?? SEVERITY_HARM.existing}
  Under Rule 3(2)(b) of the Information Technology (Intermediary Guidelines
  and Digital Media Ethics Code) Rules 2021, content in the nature of
  impersonation must be removed within 24 hours of a complaint being received.

NOTE
  You may be asked for a photo of government-issued ID. That is normal for an
  impersonation report and it goes to the platform, not to the public.`,
  });

  drafts.push({
    key: "grievance",
    title: "Grievance Officer escalation",
    hint: "Send this if the account is still up after 48 hours. It cites the 24-hour obligation, not the 15-day one.",
    destination: { label: "Meta India grievance channel", url: CONTACTS.metaGrievancePage },
    body: `Subject: Rule 3(2)(b) complaint — impersonation account @${c.fake_handle} — action required within 24 hours

To the Grievance Officer,

I am writing under the Information Technology (Intermediary Guidelines and
Digital Media Ethics Code) Rules, 2021.

An account on your platform is impersonating me:

  Impersonating account : @${c.fake_handle}
  Profile URL           : ${fakeUrl}
  My genuine account    : ${real}
  My name               : ${c.display_name}
  Reported to you on    : [DATE YOU FILED THE IN-APP REPORT]
  Your report reference : [PASTE IF YOU HAVE ONE]

${SEVERITY_HARM[c.severity] ?? SEVERITY_HARM.existing}

Rule 3(2)(b) requires an intermediary, on receiving a complaint about content
that is prima facie in the nature of impersonation of a person, to take all
reasonable and practicable measures to remove or disable access to that content
within twenty-four hours. Impersonation falls within the expedited category
under that rule; it is not subject to the general fifteen-day disposal period.

Rule 3(2)(a) additionally requires acknowledgement of this complaint within
twenty-four hours and its disposal within fifteen days.

I therefore request:

  1. Removal of, or disabling of access to, the account identified above.
  2. Written acknowledgement of this complaint within 24 hours.
  3. Preservation of subscriber information and access logs relating to that
     account pending law enforcement request.

Should this complaint not be disposed of within the statutory period, I will
appeal to the Grievance Appellate Committee constituted under Rule 3A.

Evidence, with capture timestamps and cryptographic hashes, is attached.
Case reference: ${c.id}

${c.display_name}
[YOUR EMAIL]  ·  [YOUR PHONE]`,
  });

  drafts.push({
    key: "gac",
    title: "Grievance Appellate Committee appeal",
    hint: "Only after 15 days have passed with no resolution. The Committee must decide within 30 days.",
    destination: { label: "gac.gov.in", url: CONTACTS.gac },
    body: `APPEAL UNDER RULE 3A, IT RULES 2021

Appellant            : ${c.display_name}
Intermediary         : ${platformName} (Meta)
Complaint made on    : [DATE YOU EMAILED THE GRIEVANCE OFFICER]
Intermediary's ref   : [PASTE IF YOU HAVE ONE]
Outcome              : [No response received / Complaint rejected]

GROUNDS OF APPEAL

An account impersonating me — @${c.fake_handle}, at ${fakeUrl} — was reported
to the intermediary. Under Rule 3(2)(b) impersonation content must be removed
within 24 hours of a complaint. Under Rule 3(2)(a) the complaint must in any
event be disposed of within 15 days. Neither obligation has been met.

${SEVERITY_HARM[c.severity] ?? SEVERITY_HARM.existing}

RELIEF SOUGHT

A direction to the intermediary to remove or disable access to the account, and
to confirm compliance in writing.

Evidence, with capture timestamps and hashes, is attached.
Case reference: ${c.id}`,
  });

  drafts.push({
    key: "fir",
    title: "FIR — text to hand the cyber cell",
    hint: "For the police station or cyber cell counter. Take printed evidence and a photo ID.",
    body: `To the Station House Officer / Cyber Crime Cell,

I, ${c.display_name}, wish to lodge a complaint regarding online impersonation.

An account on ${platformName}, username @${c.fake_handle} (${fakeUrl}), has been
created using my name and photographs without my knowledge or consent. I first
became aware of it on ${when} (IST).

${SEVERITY_HARM[c.severity] ?? SEVERITY_HARM.existing}

The following provisions appear to be attracted:
${cites}

I have reported the account to the platform and escalated to its Grievance
Officer under the IT Rules 2021. The account remains active.

I request registration of an FIR, and that the platform be directed to preserve
subscriber information, access logs and IP records relating to the account
before they are lost to retention limits.

Enclosed: screenshots of the impersonating profile with capture timestamps and
cryptographic hashes; copies of my complaints to the platform.

Case reference: ${c.id}

${c.display_name}
[ADDRESS]  ·  [PHONE]  ·  [DATE]`,
  });

  return drafts;
}

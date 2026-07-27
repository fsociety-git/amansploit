---
title: "Your domain is probably spoofable — and you can check in ten seconds"
description: "Most companies have SPF and think they are protected. Without an enforcing DMARC policy, anyone on the internet can send email that appears to come from your CEO."
date: "2026-07-26"
tags: ["email security", "DMARC", "SPF", "phishing"]
draft: false
---

Here is an uncomfortable experiment. Ask whoever runs your DNS whether someone could send an email that appears to come from your CEO's address, right now, to your finance team.

Most people say no. Most people are wrong, and the reason is a specific and very common misunderstanding about how the three email authentication standards fit together.

[Check your own domain here](/tools/email-spoofing) — it takes about ten seconds and asks for nothing.

## The three records, and what each actually does

**SPF** publishes a list of servers allowed to send mail for your domain. That is all it does. It does not tell a receiving server what to *do* when mail arrives from somewhere else.

**DKIM** cryptographically signs outgoing messages so a receiver can verify they were not altered and genuinely came from your infrastructure. Also does not tell anyone what to do about failures.

**DMARC** is the one that matters. It is the instruction: *if a message claiming to be from my domain fails SPF and DKIM, here is what I want you to do about it.* Without DMARC, a receiving server has been given a way to detect forgery and no policy to act on it.

This is the crux. **SPF and DKIM are detection. DMARC is enforcement.** Publishing the first two and not the third is like installing an alarm and never connecting it to anything.

## The three ways this goes wrong

### No DMARC record at all

The most common case. SPF is present, often DKIM too, and there is no `_dmarc` record. Everything is detected; nothing is refused.

### DMARC set to `p=none`

Nearly as common, and more insidious because it looks like a control. `p=none` is monitoring mode — it asks receivers to send you reports but explicitly instructs them *not* to reject anything. Many domains are set to `p=none` during rollout and simply never move on. Years pass.

If your record says `p=none`, you are, in practical terms, unprotected.

### SPF that ends in `+all` or `?all`

The last mechanism in an SPF record tells receivers how to treat everything not listed. `-all` means reject. `~all` means treat as suspicious. `+all` means **allow anything**, which affirmatively authorises the entire internet to send as you. It appears surprisingly often, usually from someone debugging a delivery problem and never reverting.

## Why this matters more than it sounds

Business email compromise works because the sender looks right. An invoice redirect from a spoofed CFO address, a credential request from a spoofed IT address — these do not need a technical exploit, only a domain that never told receivers to reject forgeries.

It also affects domains that send no mail at all. A parked marketing domain with no DMARC is a free, credible identity for anyone who wants one. **If you own a domain, publish a DMARC record on it, even if — especially if — nothing sends from it.**

## How to fix it, in the right order

Do not jump straight to `p=reject`. You will break legitimate mail you had forgotten about — the CRM, the invoicing tool, the ticketing system.

**Step 1 — start monitoring.** Publish this and change nothing else:

```
_dmarc.yourdomain.com  TXT  "v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com; pct=100"
```

**Step 2 — read the reports.** They will show every source sending as you. Expect surprises. Work through until every legitimate sender passes SPF or DKIM.

**Step 3 — move to quarantine.** Change `p=none` to `p=quarantine`. Forged mail now goes to spam. Watch for a couple of weeks.

**Step 4 — enforce.** `p=reject`. Forged mail is refused outright.

Typical timeline for an organisation of any size is four to eight weeks, most of it spent in step 2. That step is the actual work; the DNS changes take minutes.

## For domains that send no mail

Much simpler — one pass, no monitoring period:

```
yourdomain.com         TXT  "v=spf1 -all"
_dmarc.yourdomain.com  TXT  "v=DMARC1; p=reject;"
```

That publishes: nothing is authorised to send as this domain, and forgeries should be rejected.

## Check yours

The [email spoofability checker](/tools/email-spoofing) reads your public DNS and gives a plain-English verdict, the records it found, and the exact record to publish. It is passive — public DNS lookups only, nothing scanned, nothing stored.

If it comes back SPOOFABLE, the fix above is genuinely an afternoon's work for whoever runs your DNS, and it closes one of the cheapest attack paths into your organisation.

---

*Full disclosure: when I first built this tool, it reported that my own domain was spoofable. It was right.*

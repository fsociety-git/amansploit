---
title: "How to prepare for your first penetration test"
description: "Most of the friction in a first engagement comes from decisions nobody made in advance. Here is everything to sort out before the testing window opens, in the order it matters."
date: "2026-07-28"
tags: ["buying security", "pentesting", "preparation"]
draft: false
---

The awkward thing about a first penetration test is that the preparation matters more than the testing, and nobody tells you what the preparation is. You sign off a quote, a date appears in the calendar, and then a week beforehand somebody asks whether the tester should have admin access and the whole thing stalls.

None of what follows is difficult. It is just a set of decisions that have to be made by someone, and making them a fortnight early is the difference between an engagement that produces useful findings and one that spends its first two days waiting for a password.

## Decide what you actually want to know

Start here, before scope, before dates. What question is this test supposed to answer?

"Can someone on the internet get into our customer data" is a different engagement from "does our new payments flow have a logic flaw" which is different again from "we need a report for a client's security questionnaire." All three are legitimate. They lead to different scopes, different durations and different prices, and a tester who does not know which one you are asking will default to the broadest and slowest.

If the honest answer is the third one — you need a document to satisfy a procurement process — say so. It is not embarrassing and it changes what a good provider recommends. There is no point paying for deep business-logic testing to satisfy a checkbox, and no point buying a checkbox when you genuinely want to know whether you are exposed.

## Choose the environment, and know how it differs

Production or staging is the single most consequential choice you will make, and both answers are defensible.

Testing production tells you the truth about the thing your customers use. It also means real data, real integrations sending real emails, and a real risk that something breaks during business hours.

Testing staging is safer and tells you slightly less. The gap is where the surprises live: staging usually has a different WAF configuration, sometimes no WAF at all, often weaker authentication, occasionally a different database schema, and frequently a copy of production data that nobody remembers is there.

Whichever you pick, write down how the two environments differ. That list belongs in the report, because a finding that only exists in staging and a finding that was masked in staging are very different pieces of information, and neither can be assessed without knowing what changed between them.

## Get the accounts sorted early

This is the most common cause of a wasted first day.

You will need at least one account per role that matters — a standard user, an administrator, and anything in between that has meaningfully different permissions. Two accounts per role is better, because a great many real flaws only appear when user A can reach user B's data, and demonstrating that needs two users.

Create them yourself rather than sharing existing ones. A tester logged in as your actual head of finance is a tester who cannot safely try anything.

Have them ready before the window opens, and check they work. "The credentials arrived on day one but the account was locked" is a sentence I have heard more than once described to me by people who have been through this.

## Decide about the WAF

If you have a web application firewall, someone needs to decide whether it stays on.

Leaving it on tests what an attacker actually faces. Turning it off, or allowlisting the tester's source addresses, tests what your application is actually like underneath — which is what you have to fix, since the WAF is a mitigation rather than a repair.

The usual recommendation is to allowlist. A WAF that blocks a scanner is doing its job, but it also means the engagement measures your WAF vendor rather than your code, and you will pay the same money for less information. If you want to know how the WAF performs, that is worth testing deliberately and separately.

Either way, tell the tester which you chose. A report that grades an application it never actually reached is worse than no report.

## Work out who needs to know

At minimum: whoever watches your alerts, whoever is on call, and whoever answers the phone if a customer reports something odd.

You do not necessarily want the whole engineering team to know, and there is a reasonable argument for keeping it quiet to see whether anyone notices — but that only works if the people who might notice have somewhere to escalate to who is in on it. An engagement where the on-call engineer wakes up at 2am and starts an incident response against your own tester is expensive for everyone.

Give the tester a name and a phone number for out-of-hours. Give your on-call the tester's source addresses. Neither of those is a formality.

## Take a backup, and know how to restore it

Not because a competent tester will destroy your data — they will not, and the rules of engagement should prohibit destructive testing outright — but because the cost of being wrong is asymmetric. A backup you did not need costs an hour. A backup you needed and did not have ends companies.

Verify you can restore it. An untested backup is a belief, not a control.

## Agree what happens when something goes wrong

Two scenarios, and both should be written down before anyone starts.

If testing appears to cause an outage or data loss, the tester should tell you immediately — before working out whether they were actually the cause. The instinct to investigate first is natural and wrong; the ten minutes spent confirming it costs you ten minutes of not knowing.

If the tester finds something critical, they should stop and call rather than saving it for the report. A remote code execution finding sitting in a draft document for four days is a genuine risk you were unaware of, and any provider who treats "critical" as a severity label rather than an interrupt is telling you something about how they think.

## Understand what you will get, and when

Ask for a sample report before the engagement, not after. If a provider cannot show you one, that is your answer. [Mine is published in full](/sample-penetration-test-report.pdf) — a fictional target, real in every other respect.

Ask when the report arrives, whether a retest is included, and how long you have to use it. A finding is not closed because a fix was deployed; it is closed because the original reproduction steps stop working. If retesting is an upsell, the engagement ends with your risk documented rather than reduced.

## A short checklist

Two weeks out: decide the question, choose the environment, write down how it differs from production.

One week out: create and test the accounts, decide the WAF question, brief the on-call, exchange contact details and source addresses.

Two days out: take a backup and verify the restore. Confirm the scope in writing, including what is explicitly excluded.

The day before: nothing. If you are still making decisions the day before, the engagement will be shorter than you paid for.

---

*If you are working through this and something is unclear, the [rules of engagement template](/templates/rules-of-engagement) covers most of it in a form you can fill in. Or [ask](/#contact) — it costs nothing to answer a question about a document I published for free.*

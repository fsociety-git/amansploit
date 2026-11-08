---
title: "What makes a security alert actionable"
description: "Most alerts in a typical security pipeline get ignored, and the reason is usually design, not laziness. Here is what separates an alert a human can act on from noise that trains people to look away."
date: "2026-11-08"
tags: ["detection-engineering", "security-operations", "monitoring", "buyer-education"]
draft: false
---

The failure mode of most security monitoring is not that it misses attacks. It is that it fires so often, with so little to act on, that the people reading it stop reading it. An alert that nobody acts on is worse than no alert, because it costs money to produce, costs attention to dismiss, and quietly teaches the team that this signal is safe to ignore. When something real finally lands in the same channel, it looks like all the rest.

So the useful question is not "how do we detect more". It is "what does an alert need to contain for a tired person at 2am to know what to do with it". That is a design problem, and it has a fairly concrete answer.

## An alert is a message to a specific reader

Every alert has a reader. Sometimes it is a dedicated analyst, often it is a developer on call who touches the security console twice a year. The alert has to work for whoever will actually open it, not for the person who wrote the rule.

That reader needs three things before they can act: what happened, whether it matters, and what to do next. Most alerts give the first, imply the second, and skip the third entirely. "Multiple failed logins for user jsmith" tells you what happened. It does not tell you whether fifty failures from one address in ten seconds is a password-spray attempt or a misconfigured service account retrying a stale credential. And it certainly does not tell you whether to lock the account, call the user, or close the ticket.

The fix is not more data in the alert. It is the right data, chosen because it answers one of those three questions. A good login-anomaly alert includes the source address and its reputation, whether this user has signed in from that location before, how many accounts the same source touched, and whether any attempt succeeded. Each of those fields exists to move the reader toward a decision. Everything else is padding, and padding is where the real signal goes to hide.

## Severity has to mean something

Most alerting systems ship with severity levels — low, medium, high, critical — and most teams never define them. Severity then becomes a feeling the rule author had on the day they wrote it, and six months later half the "high" alerts are routine and a genuinely critical one is sitting at "medium" because nobody wanted to be the person crying wolf.

Severity is only useful if it maps to a response. If "critical" means someone gets paged out of bed, then an alert is critical when, and only when, a correct response to it cannot wait until morning. If it can wait, it is not critical, however scary it sounds. Tie the level to the action and the whole queue becomes legible: critical means wake someone, high means handle today, medium means review this week, low means we are keeping this for context and correlation, not for a human to read one by one.

The discipline this imposes is healthy. It forces you to ask, for every rule, what you would actually do if it fired. If the honest answer is "nothing, probably", that rule should not be generating individual alerts. It can still log. It can still feed a dashboard or a weekly review. It just should not interrupt anyone.

## The cost of a false positive is paid in attention

There is a tempting line of reasoning that goes: this detection might catch something, it does no harm to leave it on, so leave it on. The harm is real, it is just not on the same ledger as the rule. Every false positive spends a small amount of the team's trust in the system. Spend enough and you reach alert fatigue, which is not a personal failing but a predictable result of asking people to evaluate signals that are almost always nothing.

This is why tuning matters more than coverage for a small team. A detection that is right one time in fifty will be muted, filtered, or ignored within a month, and then it is catching nothing regardless of what the rule says it catches. A detection that is right one time in three gets read every time. Precision buys you attention, and attention is the scarce resource, not detections.

Tuning is unglamorous. It means allow-listing the vulnerability scanner that sets off your intrusion rules every Tuesday. It means suppressing the backup job that looks like data exfiltration because it moves gigabytes at 3am on schedule. It means knowing your own environment well enough to tell normal-but-unusual from genuinely wrong. None of this is exciting and all of it is the actual work.

## Context belongs in the alert, not three tabs away

When an alert requires the reader to open four other tools to understand it — pull the asset owner from a spreadsheet, check the address against a reputation service, look up whether this host is a production database or a test box — most of the time, under load, they will not. They will make a snap judgement on partial information, and snap judgements under fatigue skew toward "probably fine, close it".

The alerts that get acted on correctly are the ones that bring the context to the reader. Enrich at the point of alerting: attach what this host is and who owns it, whether the account is privileged, whether the source has been seen before, whether there is a related alert from the same source in the last hour. The pipeline can do this automatically, once, at a known cost, far more reliably than a human can do it manually, five times, at 2am, while deciding whether to escalate.

```
Alert: outbound connection to new external host
  host:        db-prod-07 (production, customer data)
  owner:       payments team
  process:     unexpected — not in baseline for this host
  destination: 203.0.113.44, no prior history, hosting-provider range
  related:     2 similar alerts, same host, last 20 min
```

That is a message someone can act on. It is also the same underlying event as a bare "outbound connection detected", which is a message someone will dismiss.

## What this means if you are buying monitoring

If you are paying for detection — a managed service, a tool, a consultant to build rules — the thing to evaluate is not how many detections it ships with. Anyone can ship thousands. The thing to ask is: what is the expected precision of these alerts in our environment, who tunes them as our environment changes, and does each alert tell our on-call engineer what to do, or just that something happened.

A pipeline that produces a hundred high-precision, well-enriched alerts a week is more valuable than one that produces ten thousand raw ones, even though the second sounds more thorough. Thoroughness that nobody reads is theatre. The goal of a detection programme is not maximum coverage on paper. It is that when something real happens, a human sees it, understands it, and does the right thing before it gets worse. Everything else is in service of that, or it is noise with a logo.

You do not need to hire anyone to start fixing this, by the way. Pick your ten noisiest alert rules, and for each one ask what you would actually do if it fired. That single question, honestly answered, will quiet most of the queue.

*If you want somewhere to start, the free tools at [/tools](/tools) are built around this kind of signal-over-noise thinking.*

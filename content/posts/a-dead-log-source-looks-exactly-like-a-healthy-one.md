---
title: "A dead log source looks exactly like a healthy one"
description: "A SIEM alerts on events, not on their absence. When a log source dies quietly, the dashboard stays green — and the gap gets discovered during an investigation, which is the worst possible time."
date: "2026-10-25"
tags: ["detection engineering", "SIEM", "logging", "monitoring"]
draft: false
---

Here is an uncomfortable property of almost every security monitoring setup: a log source that dies produces exactly the same output as a log source with nothing to report. Zero events. No alerts fire, because alerts fire on events. The dashboard stays green, because green means "no detections", and a dead source generates no detections by definition.

So the failure is invisible at the exact layer built to make things visible. Nobody notices until someone needs those logs — usually during an incident, when the question "what did this host do on the 14th?" comes back with a three-week hole. That is the worst possible moment to learn your pipeline broke, and it is the most common moment people learn it.

This post is about why log pipelines fail silently, why attackers like that property, and how to monitor for absence — which turns out to be a different problem from monitoring for events, and one a small team can solve with an inventory and a scheduled query.

## Why pipelines fail silently

Nothing dramatic has to happen. Most of the ways a source goes quiet are mundane, and none of them announce themselves.

The forwarding agent crashes, or worse, hangs — the process is still listed as running, so service monitoring sees nothing wrong, but it stopped shipping events hours ago. A credential rotates: cloud and SaaS logs are usually pulled over an API, and when the token or client secret expires, the collector simply starts receiving authentication errors that nobody reads. A TLS certificate on the ingestion endpoint expires and every agent in the fleet quietly refuses to connect. A disk fills on an intermediate forwarder and it drops what it cannot buffer. A firewall rule changes during unrelated network work and the syslog port is no longer reachable from one segment.

Then there is the subtler class: events that still arrive but stop meaning anything. A vendor upgrade changes the log format, the parser no longer matches, and events either land unparsed — invisible to every rule that queries structured fields — or get dropped at the pipeline stage. A daily ingestion quota caps out at 14:00 and everything after that is discarded, every day, with the morning's data masking the gap. A timestamp or timezone bug indexes events hours into the past or future, where no real-time rule evaluates them.

In every one of these, the platform is working as designed. There is no error on the SIEM side, because from the SIEM's point of view nothing failed. The world just went quiet.

## Attackers know this too

Silence is not only an operations problem. Disabling or tampering with logging is a catalogued adversary technique — MITRE ATT&CK tracks it as [Disable or Modify Windows Event Log (T1685.001)](https://attack.mitre.org/techniques/T1685/001/), and the broader family covers audit policies, Linux audit subsystems and cloud trail logging. An intruder who can stop a host reporting has, in a monitoring setup that does not watch for absence, switched that host's camera off without tripping anything.

Which reframes the problem usefully. A source going quiet is not just a gap in coverage — it is itself a signal worth alerting on. The event "this domain controller stopped sending security logs" deserves the same priority as a detection, because one of its possible causes *is* an intrusion. You do not get to know which cause it was until someone looks, and the looking only happens if something fires.

## Why nobody notices

Three design habits keep this failure invisible.

First, alerting is built on positive signals. Rules match events; no event, no match. Very few teams ever write the inverse rule.

Second, volume dashboards aggregate. If you watch total events per day across the estate, one host dying in a fleet of four hundred moves the line by a quarter of a percent — well inside normal variation. The aggregate chart that is supposed to prove the pipeline is healthy is precisely the view in which a single dead source cannot be seen.

Third, transport health and content health get conflated. "The agent is connected" and "useful events are arriving and parsing" are different claims, checked at different layers. A broken parser passes every connectivity check there is.

## Monitoring for absence

The fix is conceptually simple: know what should be arriving, and alert when it does not. In practice that means three things.

**An inventory of sources with expected behaviour.** Not every source is equally chatty. A firewall logs every few seconds; a domain controller's audit log should never be quiet for long during working hours; a VPN concentrator for a rarely-used contractor account might legitimately say nothing for days. So a single global threshold — "alert if any source is silent for an hour" — produces either noise or blindness depending on where you set it. Group sources into classes with an expected maximum silence per class, record an owner for each, and keep the inventory somewhere versioned, because it *is* your coverage map and it will drift.

**A scheduled absence query.** The core of it fits in a few lines on any platform that can group by source and take a maximum timestamp. Generically:

```sql
-- sources seen this week that have gone quiet
SELECT source, MAX(event_time) AS last_seen
FROM events
WHERE event_time > NOW() - INTERVAL '7 days'
GROUP BY source
HAVING MAX(event_time) < NOW() - INTERVAL '6 hours';
```

The seven-day window matters: it compares each source against its own recent existence, so the check discovers sources automatically rather than depending on the inventory being perfect. The inventory then refines the threshold per class. Run it on a schedule, route the result like a detection, and you have converted silence into an event — the one thing your alerting already knows how to handle.

**Watching drops, not just zeros.** A dead source is the easy case. A source running at 30% of its normal volume — because one log format broke parsing, or one of three nodes behind a load balancer stopped reporting — never hits zero. Compare today's per-source volume against the same source's trailing baseline and alert on large negative deltas. And track the parse-failure rate separately, because "arriving but unparsed" is invisible to both of the other checks. If the pipeline supports it, an end-to-end canary — a synthetic event injected at the edge that must appear, parsed, within a few minutes — checks the whole chain at once.

## What this costs

Almost nothing, which is why it is worth writing about. There is no product to buy. An inventory is a file. The absence check is one scheduled query per source class; the volume check is a second. The expensive part is the habit: when a new system is onboarded, its logging gets added to the inventory with an expected interval and an owner, in the same change that connects it. Do that, and the question "would we notice if this went quiet?" has the answer "yes, within six hours" — instead of "whenever we next have an incident", which is the answer most environments are living with now.

None of this requires hiring anyone. It requires an afternoon, and the willingness to accept that your monitoring is itself a system that needs monitoring.

---

*The [free tools](/tools) on this site check the externally visible parts of a security posture — headers, email authentication, TLS, DNS. If you want a scoped look at the rest, the [estimator](/#estimate) gives you a price without a phone call.*

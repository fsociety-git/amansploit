---
title: "How I built this site, and the parts I got wrong first"
description: "A security engineer's site is a claim about competence. This one is open source, so here is what is in it — including the bugs found along the way and the two features deliberately not built."
date: "2026-07-28"
tags: ["engineering", "web security", "Next.js"]
draft: false
---

A security engineer's personal site is an unusual object. It is marketing, but it is also evidence — the one artefact a prospective client can inspect before deciding whether you know what you are doing. Publishing one that grades badly on its own subject would be a peculiar decision.

So this one is [open source](https://github.com/fsociety-git/amansploit), and this is what is in it. Including the parts that were wrong to begin with, because a write-up that presents everything as having worked first time is not describing engineering.

## The stack, briefly

Next.js on the App Router, TypeScript, Tailwind, Framer Motion, and Three.js for the particle field in the header. Deployed on Vercel. The blog is plain markdown files processed with remark and rehype — no CMS, no database, nothing to keep patched.

That last choice is deliberate. The most reliable way to avoid a vulnerability in your content management system is not to have one. A post is a file; publishing is a commit.

## Getting to A+ on the headers, and why it was fiddly

The site scores A+ on securityheaders.com, and the interesting part is the last step.

Getting to A is straightforward — set `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` and `Permissions-Policy`, all of which are one line each in the framework config. The grade caps at A because of one thing: a Content-Security-Policy containing `'unsafe-inline'` in `script-src`.

Almost every CSP in the wild contains it, because removing it means every inline script needs either a hash or a per-request nonce, and frameworks emit inline scripts. The fix is to generate a nonce for each request, put it on the CSP header, and let the framework attach it to the scripts it renders.

Two things worth knowing if you do this.

The policy has to live in exactly one place. Setting a CSP in both the framework config and the request middleware does not merge them — the browser intersects two policies, and the result is usually a page that refuses to load its own JavaScript with an error message that does not obviously say why.

And I deliberately did not use `'strict-dynamic'`, which is usually recommended alongside nonces. It changes the meaning of the policy: browsers that understand it ignore `'self'` entirely, trusting only nonced scripts and whatever those load. That is stricter, and it would have blocked the analytics beacon, which is same-origin but has no way to receive a nonce. `'self'` plus a nonce still forbids injected inline script, which is the attack that actually matters here — this site has no user uploads and no user-generated content to smuggle one into. The reasoning is in a comment in the file, because the version of me that reads it in a year will otherwise assume it was an oversight.

## The tools are the interesting attack surface

There are eight free tools on the site. Five take a domain from a stranger and make a request to it from my server. That is a server-side request forgery vector in the shape of a feature, and it would be an awkward thing to get wrong here of all places.

The guard resolves the hostname first and checks every returned address against private ranges, loopback, link-local, carrier-grade NAT and the cloud metadata endpoints — the last of which is the one that matters, since `169.254.169.254` is how a naive fetch-a-URL feature becomes credential disclosure on most cloud providers. Redirects are followed manually so each hop is re-validated rather than trusted, and response bodies are never read.

It is tested against ten bypass attempts and blocks all of them. It also documents the residual risk it does not solve: DNS rebinding, where a hostname resolves to a public address during validation and a private one when the connection is made. Closing that properly means resolving once and connecting to the address rather than the name, which is on the list. Writing down what a control does *not* do is the part most security documentation skips.

## Three tools that make no request at all

The JWT decoder, CVSS calculator and hash identifier run entirely in the browser.

That is the whole reason to use them. People paste live session tokens into JWT decoders, and a great many of those decoders send the token to a server before showing anything. A JWT is a credential; pasting it into a stranger's website is handing over a live session.

So these do the work locally and say so on the page — and the claim is checkable, which is the point. Open the network tab and watch nothing happen. A promise you can verify in five seconds is worth more than a privacy policy.

The CVSS calculator was the one that needed care. The specification defines its own rounding procedure, and a naive `Math.ceil` on floating-point values produces scores that differ from the official calculator by 0.1. It is verified against published vectors.

While writing those tests I set an expected score from memory rather than from a source, and it failed. Working the formula through by hand showed the implementation was right and my expected value was invented. An invented number in a test is exactly as bad as an invented statistic in an article — it just fails more quietly.

## The section that argues against the rest of the site

Everything on a marketing page is the author's word for it. So there is a section on the homepage that is not.

It reads the Content-Security-Policy off the header set attached to that specific request — the actual policy your browser is enforcing, nonce included — and performs live SPF and DMARC lookups on every page load. Whatever comes back is printed, including a failure I have not noticed yet.

Two decisions made it honest rather than decorative.

It has three states, not two. The first version had pass and fail, and a test against another domain returned a failure that turned out to be a DNS timeout rather than a missing record. On a real deployment that would mean one slow resolver makes the homepage announce that something is broken — crying wolf on the one component whose entire value is being trustworthy. An inconclusive lookup now shows amber and says so.

And it does not scan the site from itself. The host answers scanner-shaped requests with an interstitial, so a self-fetch would grade the edge network rather than the application: a confident number about the wrong thing. The header tool refuses to grade blocked responses for exactly that reason, and making an exception for my own site would be the kind of small dishonesty that is hard to stop at one.

## The bug I am least proud of

For a while, the free email-spoofability checker reported that this domain was spoofable.

It was right. The domain had no SPF record and no DMARC record, which is the exact failure the tool was built to find, on the site hosting the tool. It is fixed — `v=spf1 -all`, `p=reject`, CAA records naming the only authorities permitted to issue certificates, and a null MX declaring that the domain accepts no mail — but it sat there for a while, and the tool found it before I did.

There is a lesson in that beyond the embarrassment. The reason it was wrong is the reason most domains are wrong: nobody had ever run the check. Building the tool was what caused it to be run.

## Two things deliberately not built

**No email wall on the tools.** The page promises no signup and nothing stored, and gating the results would make the most credible sentence on it a lie for the sake of a few addresses.

**No service worker.** Offline support means caching pages, and the self-scan claims to be running its checks at the moment you load it. A cached copy would keep making that claim while showing yesterday's answer — turning the most honest feature on the site into a false one. Every tool needs the network to function anyway, so "works offline" would mean "shows a shell that cannot do anything."

Both of those are in code comments as well as here, because the failure mode for a decision like this is somebody adding the feature later without knowing why it was left out.

## What it is worth

A site is not a substitute for the work. But the argument for hiring someone to find flaws in your systems is stronger when their own systems can be inspected — headers, DNS, dependencies, the [source itself](https://github.com/fsociety-git/amansploit), and a [changelog](/transparency) of what has actually changed.

That is checkable, which is more than most of this industry offers.

---

*Every claim above can be verified: the [live self-scan](/#self-scan) on the homepage, the [dependency list and status checks](/transparency), or the repository. If you find something wrong in any of it, [security.txt](/.well-known/security.txt) has a PGP key and I would genuinely like to know.*

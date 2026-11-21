---
title: "Why scanners miss access control bugs, and how to test for them"
description: "Broken access control tops the OWASP rankings, yet automated tools find almost none of it. Here is why the class exists, how to test for it properly, and what that tells a buyer about an assessment."
date: "2026-11-15"
tags: ["access-control", "methodology", "appsec", "pentesting"]
draft: false
---

The most common serious weakness on the web is one that scanners find almost none of. Broken access control sits at the top of the OWASP Top 10 for 2021, with more occurrences in the contributed dataset than any other category — over 318,000, spread across 34 distinct weakness types. Its API-specific form, broken object level authorisation, is ranked first in the OWASP API Security Top 10 for 2023. Automated tools catch very little of either.

That gap matters whether you build software, test it, or pay someone else to test it. This post explains why the gap exists, how to test for the class in a structured way, and what the presence or absence of this work in a report tells you about the assessment you bought.

## Why a scanner struggles here

A scanner finds flaws by recognising signatures. SQL injection throws database errors or produces measurable timing differences. Cross-site scripting reflects an injected string back into a response. In both cases the evidence of the flaw lives in the traffic itself, so a tool can match a pattern and raise a finding.

Access control works differently. The question is not "did the server return something malformed?" but "was this user supposed to receive this response at all?" Nothing in the bytes answers that. A request for `/api/orders/1004` that returns an order looks identical whether or not order 1004 belongs to the person asking. The response is well-formed either way. To know it is a flaw, you have to know who the user is, what they are entitled to, and whether this particular object falls inside that entitlement. A scanner has none of that context. It sees a 200 and moves on.

This is why the OWASP entry describes the category as resistant to automation and leaning on manual testing and human awareness. The judgement a person brings — knowing that *this* account should never see *that* record — is the whole test. You cannot buy it in a tool licence.

## The shape of the bug

Almost every access control flaw is a missing or misplaced check. The code fetches the thing the user asked for, then either checks the wrong condition or forgets to check at all. The common forms are worth naming, because testing is mostly a matter of walking through them deliberately.

The clearest is the insecure direct object reference, or IDOR. An endpoint exposes an identifier — a number in a path, a UUID in a query string, a value in a header — and the server returns the matching object without confirming it belongs to the caller. Change the identifier, get someone else's data. OWASP's API guidance gives the plain version: attackers manipulate the ID of an object in the request, and when the server does not check ownership, they read or modify records that are not theirs.

A subtler version is the server that checks the wrong thing. It confirms the user is logged in, which is authentication, and treats that as permission, which is authorisation. The two are not the same. A valid session proves who you are; it says nothing about whether you may touch this specific record. OWASP is explicit that checking the session user against the requested object is not sufficient on its own — the check has to be against a policy that knows which objects that user owns.

Then there is function-level access control. The user interface hides the admin button, so a regular account never sees it, but the underlying endpoint is still reachable. Nothing stops a user from sending the request the button would have sent. Hiding a control in the front end is not enforcing it in the back end.

Finally there are the write operations. Teams often test that users cannot *read* data they shouldn't, and forget the POST, PUT and DELETE paths. An endpoint that correctly refuses to show you another user's record may still happily let you delete it.

## How to test for it

The method is unglamorous and it works. You need at least two accounts and a clear idea of what each one owns.

Start by mapping the application as a normal user. Click through every feature while recording the traffic. Each request that carries an identifier — an order number, a document ID, an account reference — is a candidate. Build a list of them.

Now take the request that returned *your* resource and replace the identifier with one belonging to the *other* account. Nothing else changes: same session, same headers, same everything but the ID. If the second user's data comes back, you have a broken object level authorisation finding. Do this for reads first, then repeat it for every write verb the endpoint accepts. A hypothetical order API that filters results in the user interface but fetches by raw ID on the server is the textbook case — the data is right there in the response, the filtering was only ever cosmetic.

Then test vertically. Log in as a low-privilege user and try the actions a higher-privilege user can perform. Send the admin-only request from the ordinary account. Walk the hidden endpoints the interface never offered you. Change a role field in a request body or a token and see whether the server honours it.

A note on identifiers. Sequential integers make this trivial — an attacker counts upward. Random, unguessable identifiers such as GUIDs raise the cost of discovery, and OWASP recommends them, but they are a speed bump, not a fix. An unpredictable ID that still returns data to anyone who presents it is just harder to stumble on. The authorisation check is the control. The ID format is not.

If this sounds like something you could do yourself for a small application, you are right — for a two-account app with a handful of endpoints it is worth doing before you pay anyone. The value of a professional assessment is the systematic coverage: hundreds of endpoints, roles that interact in non-obvious ways, and the discipline to test every object-and-verb combination rather than the few that come to mind.

## Designing it out

For anyone building rather than testing, the structural fix is to stop scattering authorisation checks through the code and let individual developers remember to write them. OWASP's guidance points the same way each time: deny by default, and enforce ownership in one place that every data access passes through.

Concretely, the layer which fetches an object also checks that the current user is allowed to have it, and no path to the data skips that layer. The check lives with the query, not in a controller that may or may not call it. Build authorisation around explicit user policies and roles rather than ad-hoc conditionals, and write automated tests that assert a user *cannot* reach another user's objects — then refuse to ship when those tests fail. A failing authorisation test should break the build exactly as a failing unit test does.

```
# the weak pattern: fetch, then hope the caller checked
order = db.get_order(order_id)
return order

# the stronger pattern: ownership is part of the fetch
order = db.get_order(order_id, owner=current_user.id)
if order is None:
    return 404   # not found and not authorised look the same
return order
```

Returning the same response for "does not exist" and "exists but isn't yours" is deliberate. It denies an attacker the ability to map which identifiers are real.

## What this tells a buyer

If you are commissioning a test, access control is a useful lens for judging what you got back. A report built on a scanner will be thorough about injection and transport security and nearly silent on authorisation, because that is what tools can see. A report from someone who tested properly will describe accounts, roles, and specific attempts to reach one user's data as another — "as a standard user, requested document 8842 belonging to the admin account, received full contents". That second kind of finding cannot be produced by a tool, so its presence is a reasonable signal that a person actually worked through the application.

The reverse is also fair. If a web application assessment comes back with no access control testing described, it is worth asking how the authorisation logic was exercised. Sometimes the honest answer is that it wasn't.

*If you want to try some of this yourself first, the free tools at [/tools](/tools) and the scope estimator at [/#estimate](/#estimate) are a reasonable place to start.*

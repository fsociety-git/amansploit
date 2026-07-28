import type { Metadata } from "next";
import { connection } from "next/server";
import UtilityPage, { Section } from "@/components/tools/UtilityPage";
import { CvssCalculator } from "@/components/tools/Utilities";
import type { QA } from "@/components/tools/ToolContent";

const URL = "https://amansploit.com/tools/cvss";
const DESCRIPTION =
  "Calculate a CVSS 3.1 base score and vector string. Runs in your browser, with an honest note on where CVSS stops being useful.";

export const metadata: Metadata = {
  title: "CVSS 3.1 Calculator — Base Score and Vector String | amansploit",
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { title: "CVSS 3.1 calculator", description: DESCRIPTION, url: URL, siteName: "amansploit", type: "website" },
  twitter: { card: "summary_large_image" },
};

const FAQ: QA[] = [
  {
    q: "Should I report findings using the CVSS base score?",
    a: "As an input, yes. As the headline number, no. The base score describes the flaw in isolation, with no knowledge of what the affected system holds or what sits in front of it. A base 9.8 on an internal service behind three other controls is not a 9.8 to that organisation, and a base 5.3 that exposes every customer record is emphatically not a 5.3. Report the base score for comparability, then state your adjusted severity and your reasoning, so the reader can disagree with the reasoning rather than the arithmetic.",
  },
  {
    q: "What does Scope actually mean? I always get it wrong.",
    a: "Scope changes when exploiting the vulnerable component lets you affect resources beyond it — a different security authority. Escaping a container to the host is a scope change. A cross-site scripting flaw is usually a scope change, because the vulnerable component is the server but the impact lands in the victim's browser. Reading a file you shouldn't from the same application is not. When unsure, ask whether the thing you compromised and the thing you affected are governed by the same permissions.",
  },
  {
    q: "Why does my score differ by 0.1 from another calculator?",
    a: "Almost always rounding. CVSS 3.1 defines a specific round-up procedure that a naive ceiling function gets wrong on floating-point values. This calculator implements the specified integer method, so it matches NVD. If you see a difference larger than 0.1, the metrics selected are different rather than the maths.",
  },
  {
    q: "What about temporal and environmental scores?",
    a: "Deliberately not included. Temporal metrics decay and are rarely maintained after a report is written; environmental metrics require the client's context, which means they belong in a conversation with the client rather than in a form on a stranger's website. In practice, a base score plus a written justification communicates more than an environmental score nobody can reconstruct.",
  },
];

export default async function Page() {
  await connection();
  return (
    <UtilityPage
      kicker="// FREE TOOL"
      title="CVSS 3.1 calculator"
      intro="Pick the metrics, get the base score and the vector string. Implemented against the specification, including the round-up rule that trips up most calculators."
      url={URL} name="CVSS 3.1 calculator" description={DESCRIPTION} faq={FAQ}
      tool={<CvssCalculator />}
    >
      <Section h="The honest caveat">
        <p>
          CVSS answers &ldquo;how bad is this flaw in the abstract&rdquo;. Nobody actually needs
          that answer. What they need is &ldquo;how bad is this for us, and what should we fix
          first&rdquo; — which depends on what the system holds, who can reach it, and what else
          is in the way.
        </p>
        <p>
          Use the number for comparability across reports, and put your reasoning next to it.
          A severity you can argue for is worth more than one you calculated.
        </p>
      </Section>
    </UtilityPage>
  );
}

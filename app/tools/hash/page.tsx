import type { Metadata } from "next";
import { connection } from "next/server";
import UtilityPage, { Section } from "@/components/tools/UtilityPage";
import { HashIdentifier } from "@/components/tools/Utilities";
import type { QA } from "@/components/tools/ToolContent";

const URL = "https://amansploit.com/tools/hash";
const DESCRIPTION =
  "Identify a hash format by its length and character set — MD5, SHA family, bcrypt, Argon2, NTLM and Unix crypt. Runs in your browser.";

export const metadata: Metadata = {
  title: "Hash Identifier — What Type Of Hash Is This? | amansploit",
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { title: "Hash identifier", description: DESCRIPTION, url: URL, siteName: "amansploit", type: "website" },
  twitter: { card: "summary_large_image" },
};

const FAQ: QA[] = [
  {
    q: "Why does it list several possibilities instead of one answer?",
    a: "Because length and character set are all any identifier has to work with, and several formats share a shape. A 32-character hex string is equally consistent with MD5, NTLM and MD4 — nothing in the string itself distinguishes them. Tools that name one confidently are guessing, and a confident wrong answer costs hours of work in the wrong direction. Where the shape is ambiguous, this lists everything it could be and says what usually decides.",
  },
  {
    q: "Does this crack the hash?",
    a: "No, and it never sends it anywhere either. It looks at the string's shape in your browser and tells you what format it resembles. Nothing is looked up, submitted to a rainbow table service, or stored.",
  },
  {
    q: "I found MD5 password hashes in an application. How bad is that?",
    a: "Bad, and the reason is speed rather than any single break. MD5 is designed to be fast, which is exactly wrong for passwords — commodity hardware computes billions of candidates per second, so an offline attacker works through common passwords almost immediately. Unsalted MD5 is worse again, because identical passwords produce identical hashes and one lookup breaks every account that shared it. The fix is bcrypt or Argon2, which are deliberately slow and individually salted.",
  },
  {
    q: "What should password hashes look like?",
    a: "They should be visibly slow and salted. bcrypt starts $2b$ with a cost factor you can read; Argon2 starts $argon2id$ with memory and time parameters. Both encode their own salt, so identical passwords produce different hashes. If you find bare hex in a password column, that is a finding regardless of which algorithm produced it.",
  },
];

export default async function Page() {
  await connection();
  return (
    <UtilityPage
      kicker="// FREE TOOL"
      title="Hash identifier"
      intro="Paste a hash to see what format it is likely to be, and what that implies. Where several formats share the same shape, all of them are listed — guessing one would be worse than saying so."
      url={URL} name="Hash identifier" description={DESCRIPTION} faq={FAQ}
      tool={<HashIdentifier />}
    >
      <Section h="What the format tells you">
        <p>
          For password storage, the format <em>is</em> the finding. bcrypt and Argon2 are slow
          and salted by design. Bare MD5, SHA-1 or SHA-256 are fast and usually unsalted, which
          means an attacker with the database works offline at billions of guesses a second.
        </p>
      </Section>
    </UtilityPage>
  );
}

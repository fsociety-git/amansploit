import type { Metadata } from "next";
import { connection } from "next/server";
import UtilityPage, { Section } from "@/components/tools/UtilityPage";
import { JwtDecoder } from "@/components/tools/Utilities";
import type { QA } from "@/components/tools/ToolContent";

const URL = "https://amansploit.com/tools/jwt";
const DESCRIPTION =
  "Decode and inspect a JSON Web Token entirely in your browser. Nothing is uploaded. Flags alg:none, missing expiry, over-long lifetimes and missing audience.";

export const metadata: Metadata = {
  title: "JWT Decoder — Runs In Your Browser, Nothing Uploaded | amansploit",
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { title: "JWT decoder", description: DESCRIPTION, url: URL, siteName: "amansploit", type: "website" },
  twitter: { card: "summary_large_image" },
};

const FAQ: QA[] = [
  {
    q: "Is it safe to paste a real token here?",
    a: "Safer than almost anywhere else, because the decoding happens in JavaScript on your machine and there is no request to send it anywhere. You can verify that rather than trust it: open your browser's network tab and watch nothing leave. That said, the habit is worth keeping — a JWT is usually a live credential, and most online decoders POST it to a server before showing you anything. Prefer a local tool, and if a token has been pasted somewhere you are unsure about, rotate it.",
  },
  {
    q: "Why can't it verify the signature?",
    a: "Verification needs the signing secret or public key, and this page deliberately never asks for one. A site that collects both your token and your signing key is collecting everything needed to forge tokens for your service. Decoding shows you the claims; verification belongs in your own code or a local library.",
  },
  {
    q: "What does alg:none mean and why is it flagged so hard?",
    a: "It means the token declares it has no signature. The header is attacker-controlled, so if a library trusts it, anyone can strip the signature, set alg to none, edit the claims to say they are an administrator, and be believed. Every mature JWT library refuses this by default now, but the flaw reappears whenever someone writes their own verification or passes an empty algorithm list.",
  },
  {
    q: "Is HS256 a problem?",
    a: "Not inherently, but it is symmetric — the same secret both signs and verifies. That is fine for one service talking to itself. It becomes a problem when several services need to validate tokens, because every one of them then holds a key that can also mint tokens. If more than one party verifies, asymmetric algorithms let you distribute a public key that cannot forge anything.",
  },
  {
    q: "The payload has personal data in it. Is that bad?",
    a: "Worth knowing about, at least. A JWT payload is base64, not encryption — anyone holding the token can read every claim, including the user, their email, their roles and anything else in there. Treat the payload as public, and keep anything genuinely sensitive server-side behind an opaque identifier.",
  },
];

export default async function Page() {
  await connection();
  return (
    <UtilityPage
      kicker="// FREE TOOL"
      title="JWT decoder"
      intro="Paste a JSON Web Token to read its header and claims, with the expiry rendered as a real date and the common configuration mistakes called out. Everything happens in your browser — the token is never sent anywhere."
      url={URL} name="JWT decoder" description={DESCRIPTION} faq={FAQ}
      tool={<JwtDecoder />}
    >
      <Section h="What to look at first">
        <p>
          The algorithm, then the lifetime. <code>alg</code> tells you whether the token can be
          trusted at all; <code>exp</code> tells you how long a stolen one stays useful. Almost
          every real-world JWT problem is one of those two, not something exotic.
        </p>
      </Section>
    </UtilityPage>
  );
}

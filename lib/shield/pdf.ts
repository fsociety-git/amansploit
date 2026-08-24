import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { citationsFor } from "./legal";

const A4: [number, number] = [595.28, 841.89];
const M = 52;
const ACID = rgb(0.176, 0.878, 0.702);
const INK = rgb(0.09, 0.11, 0.13);
const DIM = rgb(0.42, 0.46, 0.5);
const LINE = rgb(0.85, 0.87, 0.89);

export type PdfCase = {
  id: string; platform: string; fake_handle: string; real_handle: string | null;
  display_name: string; severity: string; status: string; report_count: number;
  created_at: string; verified_at: string | null;
};
export type PdfArtifact = {
  kind: string; sha256: string; bytes: number | null;
  capture_method: string; captured_at: string; storage_path: string;
  meta: Record<string, unknown>;
};
export type PdfEvent = { type: string; created_at: string };

const bothZones = (iso: string) => {
  const d = new Date(iso);
  const utc = d.toISOString().replace("T", " ").replace(/\.\d+Z$/, " UTC");
  const ist = d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "medium" });
  return `${utc}  /  ${ist} IST`;
};

/**
 * A 64-character hex digest has no spaces, so the wrapper cannot break it and it
 * runs off the page. Grouping in eights fixes that and also makes the value
 * checkable by eye, which is the point of printing it — someone comparing this
 * against `sha256sum` output is reading it in chunks anyway.
 */
export const groupHash = (h: string): string => (h.match(/.{1,8}/g) ?? [h]).join(" ");

/** Greedy wrap; pdf-lib has no text layout engine. */
function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const out: string[] = [];
  for (const para of text.split("\n")) {
    if (!para.trim()) { out.push(""); continue; }
    let line = "";
    for (const word of para.split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) > width && line) { out.push(line); line = word; }
      else line = next;
    }
    if (line) out.push(line);
  }
  return out;
}

export async function buildEvidencePack(
  c: PdfCase, artifacts: PdfArtifact[], events: PdfEvent[], images: Array<{ bytes: Uint8Array; type: string; a: PdfArtifact }>,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Shield evidence pack — case ${c.id}`);
  doc.setProducer("Shield by amansploit");
  doc.setCreationDate(new Date());

  const body = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const mono = await doc.embedFont(StandardFonts.Courier);

  let page: PDFPage = doc.addPage(A4);
  let y = A4[1] - M;
  const W = A4[0] - M * 2;

  const newPage = () => { page = doc.addPage(A4); y = A4[1] - M; };
  const need = (h: number) => { if (y - h < M + 30) newPage(); };

  const text = (s: string, opts: { font?: PDFFont; size?: number; color?: typeof INK; gap?: number } = {}) => {
    const f = opts.font ?? body, size = opts.size ?? 10.5;
    for (const line of wrap(s, f, size, W)) {
      need(size + 4);
      if (line) page.drawText(line, { x: M, y, size, font: f, color: opts.color ?? INK });
      y -= size + 3.5;
    }
    y -= opts.gap ?? 6;
  };

  const heading = (s: string) => {
    need(34);
    y -= 8;
    page.drawText(s, { x: M, y, size: 13, font: bold, color: INK });
    y -= 6;
    page.drawLine({ start: { x: M, y }, end: { x: M + W, y }, thickness: 0.8, color: ACID });
    y -= 16;
  };

  const kv = (k: string, v: string) => {
    need(16);
    page.drawText(k, { x: M, y, size: 9.5, font: bold, color: DIM });
    const vx = M + 150;
    for (const line of wrap(v, mono, 9.5, W - 150)) {
      page.drawText(line, { x: vx, y, size: 9.5, font: mono, color: INK });
      y -= 13;
    }
    y -= 3;
  };

  // ---------- cover ----------
  page.drawText("SHIELD", { x: M, y, size: 26, font: bold, color: INK });
  page.drawText("by amansploit", { x: M + 96, y: y + 2, size: 10, font: mono, color: DIM });
  y -= 30;
  page.drawText("EVIDENCE PACK", { x: M, y, size: 13, font: mono, color: ACID });
  y -= 34;
  page.drawLine({ start: { x: M, y }, end: { x: M + W, y }, thickness: 1.2, color: ACID });
  y -= 26;

  kv("Case reference", c.id);
  kv("Pack generated", bothZones(new Date().toISOString()));
  kv("Case opened", bothZones(c.created_at));
  kv("Subject (complainant)", c.display_name);
  kv("Genuine account", c.real_handle ? `@${c.real_handle}` : "not supplied");
  kv("Impersonating account", `@${c.fake_handle}`);
  kv("Platform", c.platform);
  kv("Ownership verified", c.verified_at ? bothZones(c.verified_at) : "not verified");
  kv("Independent reports", String(c.report_count));
  kv("Artifacts in this pack", String(artifacts.length));

  y -= 10;
  text(
    "This document was assembled automatically from records held by Shield. It is an evidence compilation, not legal advice, and it has not been reviewed by a lawyer. Every artifact listed carries the SHA-256 digest computed at the moment of capture; recomputing the digest of a supplied file and comparing it to the value printed here will show whether that file has changed since.",
    { size: 9.5, color: DIM },
  );

  // ---------- methodology ----------
  newPage();
  heading("1.  How this evidence was captured");
  text(
    "Two capture routes are used and they are distinguished throughout, because they carry different weight.",
  );
  text(
    "Server capture. Shield requests the public profile URL directly and stores the HTML exactly as served, together with the metadata parsed from it. A SHA-256 digest is computed over the received bytes before anything is written to storage, so the digest attests to what was received rather than to what is in the archive now. The HTTP status and the capture instant are recorded.",
  );
  text(
    "Complainant upload. Screenshots supplied by the complainant from their own device are hashed on receipt and stored unmodified. Shield does not alter, crop or recompress them.",
  );
  text(
    "Where a platform served a login page instead of the profile, Shield records the failure and stores nothing. A screenshot of a login page inside an evidence pack would suggest a capture that did not occur, so no such artifact is retained.",
    { color: DIM, size: 9.5 },
  );

  // ---------- artifacts ----------
  heading("2.  Artifact register");
  if (!artifacts.length) {
    text("No artifacts were captured for this case.", { color: DIM });
  } else {
    artifacts.forEach((a, i) => {
      need(90);
      page.drawText(`${i + 1}.  ${a.kind}`, { x: M, y, size: 10.5, font: bold, color: INK });
      y -= 15;
      kv("Captured", bothZones(a.captured_at));
      kv("Method", a.capture_method === "victim_upload" ? "complainant upload" : "server capture");
      kv("Size", a.bytes ? `${a.bytes} bytes` : "unknown");
      kv("SHA-256", groupHash(a.sha256));
      const src = (a.meta?.url as string) ?? (a.meta?.originalName as string);
      if (src) kv("Source", src);
      y -= 6;
    });
  }

  // ---------- extracted profile data ----------
  const meta = artifacts.find((a) => a.kind === "metadata")?.meta;
  if (meta) {
    heading("3.  Profile data extracted at capture");
    for (const [k, label] of [
      ["title", "Profile title"], ["description", "Profile description"],
      ["followers", "Followers"], ["following", "Following"], ["posts", "Posts"],
      ["httpStatus", "HTTP status"],
    ] as const) {
      const v = meta[k];
      if (v !== null && v !== undefined) kv(label, String(v));
    }
  }

  // ---------- images ----------
  for (const img of images) {
    newPage();
    heading("Complainant screenshot");
    kv("Captured", bothZones(img.a.captured_at));
    kv("SHA-256", groupHash(img.a.sha256));
    y -= 8;
    try {
      const embedded = img.type === "image/png"
        ? await doc.embedPng(img.bytes)
        : await doc.embedJpg(img.bytes);
      const maxW = W, maxH = y - M - 20;
      const scale = Math.min(maxW / embedded.width, maxH / embedded.height, 1);
      const w = embedded.width * scale, h = embedded.height * scale;
      page.drawImage(embedded, { x: M, y: y - h, width: w, height: h });
      page.drawRectangle({ x: M, y: y - h, width: w, height: h, borderColor: LINE, borderWidth: 0.7 });
      y -= h + 12;
    } catch {
      text("This image could not be embedded and is retained in the case archive.", { color: DIM });
    }
  }

  // ---------- activity ----------
  newPage();
  heading("4.  Case activity log");
  const LABELS: Record<string, string> = {
    created: "Case opened",
    verified: "Complainant proved control of the genuine account",
    verify_failed: "Ownership check could not be completed",
    evidence_captured: "Evidence captured",
    capture_failed: "Server capture blocked by the platform",
    meta_form_filed: "Complainant filed the platform's impersonation report",
    complaint_filed: "Complainant filed on the national cybercrime portal",
    grievance_sent: "Complainant escalated to the Grievance Officer",
    fir_filed: "Complainant reported to police",
    disputed: "A third party disputed this case",
  };
  for (const e of events) {
    need(15);
    page.drawText(bothZones(e.created_at), { x: M, y, size: 8.5, font: mono, color: DIM });
    y -= 11;
    page.drawText(LABELS[e.type] ?? e.type, { x: M + 12, y, size: 10, font: body, color: INK });
    y -= 16;
  }
  y -= 6;
  text(
    `${c.report_count} independent report${c.report_count === 1 ? " was" : "s were"} recorded against the impersonating account through this case. Reports are de-duplicated per device, so this figure understates rather than overstates the number of people who acted.`,
    { size: 9.5, color: DIM },
  );

  // ---------- law ----------
  newPage();
  heading("5.  Annexure — provisions appearing to be attracted");
  text(
    "Compiled from published Indian law on the basis of what the complainant reported. Which provisions actually apply is a matter for the investigating authority.",
    { size: 9.5, color: DIM },
  );
  for (const cit of citationsFor(c.severity)) {
    need(60);
    page.drawText(cit.ref, { x: M, y, size: 10, font: bold, color: INK });
    y -= 14;
    page.drawText(cit.title, { x: M, y, size: 9.5, font: body, color: ACID });
    y -= 14;
    text(cit.what, { size: 9.5, color: DIM, gap: 10 });
  }

  // ---------- disclaimer ----------
  newPage();
  heading("6.  Limitations of this document");
  text(
    "Shield is an automated tool. It compiles records it holds; it does not investigate, and it cannot confirm that the account named here is operated by any particular person.",
  );
  text(
    "Ownership verification confirms only that, at the time stated, the genuine account displayed a code issued by Shield. It establishes that the complainant controlled that account. It does not establish authorship of the impersonating account.",
  );
  text(
    "The report count records confirmations submitted through this case page. Shield cannot observe whether a report was in fact submitted to the platform.",
  );
  text(
    "The legal annexure is a compilation of published provisions, not legal advice. No lawyer has reviewed it for this matter.",
  );
  text(
    "Records are deleted 90 days after the case is opened. A pack generated after deletion cannot be reproduced, so retain this document.",
    { color: DIM, size: 9.5 },
  );

  // ---------- footers ----------
  const pages = doc.getPages();
  pages.forEach((p, i) => {
    p.drawText(`Shield by amansploit  ·  case ${c.id}  ·  page ${i + 1} of ${pages.length}`, {
      x: M, y: 30, size: 8, font: mono, color: DIM,
    });
  });

  return doc.save();
}

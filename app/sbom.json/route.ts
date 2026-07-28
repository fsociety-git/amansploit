import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Machine-readable software bill of materials, in CycloneDX 1.5.
 *
 * Generated from the manifest on this deployment rather than committed as a
 * file, for the same reason the human-readable list is: a static SBOM is a
 * document about a build that has since been replaced, and a stale SBOM is
 * worse than none because it invites decisions based on versions that are no
 * longer running.
 *
 * Scope is stated honestly in the metadata: these are the direct declared
 * dependencies, not the resolved transitive graph. Anyone who needs the full
 * tree should take the lockfile from the repository, which is authoritative.
 */
export async function GET() {
  let pkg: {
    name?: string;
    version?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  } = {};

  try {
    pkg = JSON.parse(await fs.readFile(path.join(process.cwd(), "package.json"), "utf8"));
  } catch {
    return NextResponse.json({ error: "manifest unavailable" }, { status: 503 });
  }

  const component = (name: string, range: string, scope: "required" | "optional") => ({
    type: "library",
    "bom-ref": `pkg:npm/${name}@${range}`,
    name,
    version: range,
    scope,
    purl: `pkg:npm/${encodeURIComponent(name)}@${encodeURIComponent(range)}`,
  });

  const components = [
    ...Object.entries(pkg.dependencies ?? {}).map(([n, v]) => component(n, v, "required")),
    ...Object.entries(pkg.devDependencies ?? {}).map(([n, v]) => component(n, v, "optional")),
  ];

  return NextResponse.json(
    {
      bomFormat: "CycloneDX",
      specVersion: "1.5",
      version: 1,
      metadata: {
        component: {
          type: "application",
          name: pkg.name ?? "amansploit-site",
          version: pkg.version ?? "0.0.0",
          purl: `pkg:generic/${pkg.name ?? "amansploit-site"}@${pkg.version ?? "0.0.0"}`,
        },
        properties: [
          {
            name: "amansploit:scope",
            value:
              "Direct declared dependencies only. The resolved transitive graph is in the lockfile at github.com/fsociety-git/amansploit and is authoritative.",
          },
          { name: "amansploit:generated", value: "at request time from the running deployment's manifest" },
        ],
      },
      components,
    },
    {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "public, max-age=0, s-maxage=300",
      },
    },
  );
}

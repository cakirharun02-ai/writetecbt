/**
 * scripts/translate.ts
 *
 * Reads lib/i18n.tr.ts (TR source-of-truth), produces lib/i18n.en.json by:
 *   1) honoring manual overrides in lib/i18n.en.overrides.json
 *   2) re-using cached translations whose TR source has not changed (SHA-1 hash)
 *   3) calling MyMemory (free public translation API) for everything else
 *
 * Run with:  npm run translate
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { tr } from "../lib/i18n.tr.ts";

const PROJECT_ROOT = resolve(import.meta.dirname, "..");
const OUTPUT_PATH = resolve(PROJECT_ROOT, "lib/i18n.en.json");
const OVERRIDES_PATH = resolve(PROJECT_ROOT, "lib/i18n.en.overrides.json");
const HASH_PATH = resolve(PROJECT_ROOT, "lib/i18n.en.hashes.json");
const CONTACT_EMAIL = "writetecbt@gmail.com";
const REQUEST_DELAY_MS = 1200;

type StringMap = Record<string, string>;

function flatten(obj: unknown, prefix = "", out: StringMap = {}): StringMap {
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const path = prefix ? `${prefix}.${k}` : k;
      if (typeof v === "string") {
        out[path] = v;
      } else if (v && typeof v === "object") {
        flatten(v, path, out);
      }
    }
  }
  return out;
}

function unflatten(flat: StringMap): Record<string, unknown> {
  const root: Record<string, unknown> = {};
  for (const [path, value] of Object.entries(flat)) {
    const parts = path.split(".");
    let cursor = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]!;
      if (typeof cursor[part] !== "object" || cursor[part] === null) {
        cursor[part] = {};
      }
      cursor = cursor[part] as Record<string, unknown>;
    }
    cursor[parts[parts.length - 1]!] = value;
  }
  return root;
}

function readJson<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function sha1(input: string): string {
  return createHash("sha1").update(input).digest("hex");
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function translateOne(source: string): Promise<string> {
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", source);
  url.searchParams.set("langpair", "tr|en");
  url.searchParams.set("de", CONTACT_EMAIL);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`MyMemory HTTP ${res.status} for "${source}"`);
  const json = (await res.json()) as {
    responseData?: { translatedText?: string };
    responseStatus?: number;
  };
  const text = json.responseData?.translatedText;
  if (!text) throw new Error(`MyMemory empty response for "${source}"`);
  return decodeHtmlEntities(text).trim();
}
/** ksknefl */
async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const flat = flatten(tr);
  const overrides = (readJson<StringMap>(OVERRIDES_PATH) ?? {}) as StringMap;
  const existing = (readJson<Record<string, unknown>>(OUTPUT_PATH) ?? {}) as Record<
    string,
    unknown
  >;
  const existingFlat = flatten(existing);
  const hashes = (readJson<StringMap>(HASH_PATH) ?? {}) as StringMap;

  const result: StringMap = {};
  const nextHashes: StringMap = {};
  let translatedCount = 0;
  let cachedCount = 0;
  let overrideCount = 0;
  let totalKeys = 0;

  for (const [key, trValue] of Object.entries(flat)) {
    totalKeys++;
    const h = sha1(trValue);
    nextHashes[key] = h;

    if (key in overrides) {
      result[key] = overrides[key]!;
      overrideCount++;
      continue;
    }

    const cached = existingFlat[key];
    if (cached && hashes[key] === h) {
      result[key] = cached;
      cachedCount++;
      continue;
    }

    process.stdout.write(`  → translating ${key} ... `);
    try {
      const translated = await translateOne(trValue);
      result[key] = translated;
      translatedCount++;
      process.stdout.write(`"${translated.slice(0, 60)}"\n`);
    } catch (err) {
      console.warn(`\n  ✖ translation failed for ${key}; keeping TR fallback`);
      console.warn(`     reason: ${(err as Error).message}`);
      result[key] = trValue;
    }
    await sleep(REQUEST_DELAY_MS);
  }

  const tree = unflatten(result);
  writeFileSync(OUTPUT_PATH, JSON.stringify(tree, null, 2) + "\n", "utf8");
  writeFileSync(HASH_PATH, JSON.stringify(nextHashes, null, 2) + "\n", "utf8");

  console.log("\n────────────────────────────────────────");
  console.log(`✓ Translation complete.`);
  console.log(`  total keys:    ${totalKeys}`);
  console.log(`  translated:    ${translatedCount}`);
  console.log(`  cached:        ${cachedCount}`);
  console.log(`  overrides:     ${overrideCount}`);
  console.log(`  output:        lib/i18n.en.json`);
}

main().catch((err) => {
  console.error("Translation failed:", err);
  process.exit(1);
});

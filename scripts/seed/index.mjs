#!/usr/bin/env node
/**
 * Seeds the Intyoza backend with starter content through the admin API.
 *
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run seed            # dry run: shows what would be created
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run seed -- --apply # creates it
 *   npm run seed -- --learning --apply                         # categories and articles only
 *   npm run seed -- --community --apply                        # community spaces only
 *   npm run seed -- --learning --no-media --apply              # articles without images/videos
 *   npm run seed -- --media --apply                            # add images/videos that could not be downloaded earlier
 *   npm run seed -- --learning --update --apply                # also rewrite live articles whose text changed
 *   npm run seed -- --myths --apply                            # myth checks only
 *
 * Instead of environment variables, ADMIN_EMAIL and ADMIN_PASSWORD can go in .env.seed (git-ignored).
 *
 * API_URL defaults to the production backend. Anything that already exists (same category slug,
 * article title, myth text or space name) is skipped, so running it again is safe.
 *
 * Not seeded: health facilities (real, verified data only — use the Import button in Services),
 * users, referrals and reports (these come from people using the app).
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { articles, categories, myths, spaces } from "./data.mjs";

// Credentials can also live in .env.seed at the project root (git-ignored), as KEY=value lines.
if (existsSync(".env.seed")) {
  for (const line of readFileSync(".env.seed", "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}

const API_URL = (process.env.API_URL || "https://intyoza-backend.onrender.com/api/v1").replace(/\/$/, "");
const APPLY = process.argv.includes("--apply");
// --learning and --community pick sections (categories + articles, spaces + welcome posts); none means all.
const ONLY_LEARNING = process.argv.includes("--learning");
const ONLY_COMMUNITY = process.argv.includes("--community");
/** Adds missing images and videos to articles that already exist. */
const ONLY_MEDIA = process.argv.includes("--media");
/** Creates articles without their images and videos (add them later with --media). */
const NO_MEDIA = process.argv.includes("--no-media");
/** With --learning: also rewrites the text of articles that already exist when it differs from data.mjs. */
const UPDATE = process.argv.includes("--update");
/** Myth checks only. */
const ONLY_MYTHS = process.argv.includes("--myths");
const ALL = !ONLY_LEARNING && !ONLY_COMMUNITY && !ONLY_MEDIA && !ONLY_MYTHS;
const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

let token = "";

async function call(method, path, body) {
  // Form data (articles) is sent as is; the runtime sets its multipart Content-Type.
  const isForm = body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body && !isForm ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`${method} ${path} → ${response.status} ${data?.error?.message || data?.message || ""}`.trim());
  }
  return data;
}

/** The list inside a response, whether it is wrapped in `data` or not. */
const list = (result, key) => (result?.data ?? result)?.[key] ?? [];
/** A created record, whether it is wrapped in `data` or not. */
const created = (result, key) => result?.[key] ?? result?.data?.[key] ?? result?.data ?? result;

/** Articles are created with multipart form data (the backend also accepts an optional media file). */
function articleForm(fields, media) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.append(key, String(value));
  if (media) form.append("media", media.blob, media.name);
  return form;
}

const MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm", "video/quicktime"];

const MEDIA_CACHE = process.env.SEED_MEDIA_CACHE || ".seed-media";
const EXT_TYPES = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif", mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime" };

/** The cached file name for a Commons file (SVG diagrams are stored as their PNG rendering). */
const cacheName = (name) => name.replace(/.svg$/i, ".png");

/**
 * An image or video from Wikimedia Commons, by file name. It is read from the local cache (.seed-media/)
 * when there, otherwise downloaded from the Commons file server and cached. Returns null when it cannot be
 * downloaded (for example while Commons is rate-limiting), so the article can be created without it.
 */
async function commonsMedia(name) {
  const cached = join(MEDIA_CACHE, cacheName(name));
  const isVideo = /.(webm|ogv|mp4|mov)$/i.test(name);
  let bytes;
  let type;
  if (existsSync(cached)) {
    bytes = readFileSync(cached);
    type = EXT_TYPES[cached.split(".").pop().toLowerCase()];
  } else {
    const file = name.replace(/ /g, "_");
    const hash = createHash("md5").update(file).digest("hex");
    const dir = `${hash[0]}/${hash.slice(0, 2)}`;
    const url = file.toLowerCase().endsWith(".svg")
      ? `https://upload.wikimedia.org/wikipedia/commons/thumb/${dir}/${encodeURIComponent(file)}/1280px-${encodeURIComponent(file)}.png`
      : `https://upload.wikimedia.org/wikipedia/commons/${dir}/${encodeURIComponent(file)}`;
    // Commons asks scripts to go slowly, so pause before each download and back off once when rate-limited.
    let response;
    for (let attempt = 1; attempt <= 2; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, attempt === 1 ? 3000 : 30000));
      response = await fetch(url, { headers: { "User-Agent": "intyoza-seed/1.0 (learning content seed)" } });
      if (response.status !== 429) break;
    }
    type = (response.headers.get("content-type") || "").split(";")[0].trim();
    if (!response.ok || !MEDIA_TYPES.includes(type)) {
      console.log(`          media not available yet: ${name} (${response.status}); run with --media later`);
      return null;
    }
    bytes = Buffer.from(await response.arrayBuffer());
    mkdirSync(MEDIA_CACHE, { recursive: true });
    writeFileSync(cached, bytes);
  }
  if (!MEDIA_TYPES.includes(type)) throw new Error(`${name} is ${type || "an unknown type"}, which the backend does not accept`);
  if (bytes.length > (isVideo ? 100 : 10) * 1024 * 1024) throw new Error(`${name} is too large to upload`);
  return { blob: new Blob([bytes], { type }), name: cacheName(name) };
}

const counts = { created: 0, skipped: 0, failed: 0 };

async function step(label, exists, create) {
  if (exists) {
    console.log(`  skip    ${label} (already exists)`);
    counts.skipped++;
    return null;
  }
  if (!APPLY) {
    console.log(`  create  ${label}`);
    counts.created++;
    return null;
  }
  try {
    const result = await create();
    console.log(`  created ${label}`);
    counts.created++;
    return result;
  } catch (error) {
    console.log(`  FAILED  ${label}: ${error.message}`);
    counts.failed++;
    return null;
  }
}

async function main() {
  console.log(`${APPLY ? "Seeding" : "Dry run against"} ${API_URL}\n`);

  // A dry run only reads public lists, so it can run without a login.
  if (APPLY && (!ADMIN_EMAIL || !ADMIN_PASSWORD)) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD.");
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    const login = await call("POST", "/auth/login", { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    if (login?.user?.role !== "ADMIN") throw new Error("This account is not an admin.");
    token = login.token;
  }

  if (ALL || ONLY_LEARNING) await seedLearning();
  if (ALL || ONLY_MYTHS) await seedMyths();
  if (ALL || ONLY_COMMUNITY) await seedCommunity();
  if (ONLY_MEDIA) await seedMedia();
  summary();
}

async function seedLearning() {
  console.log("Learning categories");
  const existingCategories = list(await call("GET", "/learning/categories"), "categories");
  const categoryIds = Object.fromEntries(existingCategories.map((c) => [c.slug, c.id]));
  for (const category of categories) {
    const result = await step(category.nameEn, !!categoryIds[category.slug], () =>
      call("POST", "/admin/learning/categories", category)
    );
    if (result) categoryIds[category.slug] = created(result, "category").id;
  }

  console.log("\nLearning articles");
  const existingTitles = new Set(list(await call("GET", "/learning/articles"), "articles").map((a) => a.title));
  for (const { category, media, ...article } of articles) {
    const categoryId = categoryIds[category];
    if (!categoryId && APPLY) {
      console.log(`  FAILED  ${article.title}: category "${category}" was not created`);
      counts.failed++;
      continue;
    }
    const label = media && !NO_MEDIA ? `${article.title} (with ${article.format === "VIDEO" ? "video" : "image"})` : article.title;
    await step(label, existingTitles.has(article.title), async () =>
      call("POST", "/admin/learning/articles", articleForm({ ...article, categoryId, published: true }, media && !NO_MEDIA && (await commonsMedia(media))))
    );
  }

  if (UPDATE) await updateArticles();
}

/** Rewrites the text (and format) of live articles whose content differs from data.mjs. */
async function updateArticles() {
  console.log("\nArticle updates");
  if (!token) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD (or .env.seed) to update articles.");
  const live = list(await call("GET", "/admin/learning/articles"), "articles");
  for (const article of articles) {
    const existing = live.find((a) => a.title === article.title);
    if (!existing) continue;
    // The admin list may leave the content out; the single-article read has it.
    const current = existing.content ?? created(await call("GET", `/learning/articles/${existing.id}`), "article")?.content;
    // Form uploads turn line breaks into \r\n, so compare with line breaks normalised.
    const normalise = (text) => String(text ?? "").replace(/\r\n/g, "\n");
    const changed = normalise(current) !== normalise(article.content) || existing.format !== article.format;
    if (!changed) {
      console.log(`  same    ${article.title}`);
      counts.skipped++;
      continue;
    }
    if (!APPLY) {
      console.log(`  update  ${article.title}`);
      counts.created++;
      continue;
    }
    try {
      await call("PATCH", `/admin/learning/articles/${existing.id}`, articleForm({ content: article.content, format: article.format }));
      console.log(`  updated ${article.title}`);
      counts.created++;
    } catch (error) {
      console.log(`  FAILED  ${article.title}: ${error.message}`);
      counts.failed++;
    }
  }
}

async function seedMedia() {
  console.log("\nArticle media");
  if (!token) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD (or .env.seed) to check article media.");
  const live = list(await call("GET", "/admin/learning/articles"), "articles");
  for (const article of articles.filter((a) => a.media)) {
    const existing = live.find((a) => a.title === article.title);
    if (!existing) {
      console.log(`  skip    ${article.title} (article not created yet)`);
      continue;
    }
    await step(`media for ${article.title}`, !!existing.mediaUrl, async () => {
      const media = await commonsMedia(article.media);
      if (!media) throw new Error("still not available from Wikimedia Commons");
      return call("PATCH", `/admin/learning/articles/${existing.id}`, articleForm({}, media));
    });
  }
}

async function seedMyths() {
  console.log("\nMyth checks");
  const existingMyths = new Set(list(await call("GET", "/myths"), "myths").map((m) => m.mythText));
  for (const myth of myths) {
    await step(myth.mythText, existingMyths.has(myth.mythText), () => call("POST", "/admin/myths", myth));
  }
}

async function seedCommunity() {
  console.log("\nCommunity spaces");
  let existingSpaces = new Set();
  if (token) {
    existingSpaces = new Set(list(await call("GET", "/community/spaces"), "spaces").map((s) => s.name));
  } else {
    console.log("  (sign in to check which spaces already exist)");
  }
  for (const { welcome, ...space } of spaces) {
    const result = await step(space.name, existingSpaces.has(space.name), () => call("POST", "/community/spaces", space));
    const spaceId = result && created(result, "space")?.id;
    if (spaceId) {
      await step(`  welcome post in ${space.name}`, false, () =>
        call("POST", `/community/spaces/${spaceId}/posts`, { content: welcome })
      );
    } else if (!APPLY && !existingSpaces.has(space.name)) {
      console.log(`  create    welcome post in ${space.name}`);
      counts.created++;
    }
  }
}

function summary() {
  const verb = APPLY ? "Created" : "Would create";
  console.log(`\n${verb} ${counts.created}, skipped ${counts.skipped}${counts.failed ? `, failed ${counts.failed}` : ""}.`);
  if (!APPLY) console.log("Nothing was written. Run again with --apply to create it.");
  if (counts.failed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`\n${error.message}`);
  process.exit(1);
});

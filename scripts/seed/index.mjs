#!/usr/bin/env node
/**
 * Seeds the Intyoza backend with starter content through the admin API.
 *
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run seed            # dry run: shows what would be created
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run seed -- --apply # creates it
 *
 * API_URL defaults to the production backend. Anything that already exists (same category slug,
 * article title, myth text or space name) is skipped, so running it again is safe.
 *
 * Not seeded: health facilities (real, verified data only — use the Import button in Services),
 * users, referrals and reports (these come from people using the app).
 */
import { articles, categories, myths, spaces } from "./data.mjs";

const API_URL = (process.env.API_URL || "https://intyoza-backend.onrender.com/api/v1").replace(/\/$/, "");
const APPLY = process.argv.includes("--apply");
const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

let token = "";

async function call(method, path, body) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
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
  for (const { category, ...article } of articles) {
    const categoryId = categoryIds[category];
    if (!categoryId && APPLY) {
      console.log(`  FAILED  ${article.title}: category "${category}" was not created`);
      counts.failed++;
      continue;
    }
    await step(article.title, existingTitles.has(article.title), () =>
      call("POST", "/admin/learning/articles", { ...article, categoryId })
    );
  }

  console.log("\nMyth checks");
  const existingMyths = new Set(list(await call("GET", "/myths"), "myths").map((m) => m.mythText));
  for (const myth of myths) {
    await step(myth.mythText, existingMyths.has(myth.mythText), () => call("POST", "/admin/myths", myth));
  }

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

  const verb = APPLY ? "Created" : "Would create";
  console.log(`\n${verb} ${counts.created}, skipped ${counts.skipped}${counts.failed ? `, failed ${counts.failed}` : ""}.`);
  if (!APPLY) console.log("Nothing was written. Run again with --apply to create it.");
  if (counts.failed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`\n${error.message}`);
  process.exit(1);
});

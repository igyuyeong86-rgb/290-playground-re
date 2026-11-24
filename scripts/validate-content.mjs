#!/usr/bin/env node
// Validates Markdown metadata, asset references and internal links in CI.
import { readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { readContent } from "../lib/read-content.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const errors = [];
const fail = (message) => errors.push(message);

function load(kind) {
  try {
    return readContent(root, kind);
  } catch (error) {
    fail(error.message);
    return [];
  }
}

const work = load("work");
const blog = load("blog");
const experience = load("experience");
const slugs = {
  work: new Set(work.map((post) => post.slug)),
  blog: new Set(blog.map((post) => post.slug)),
  experience: new Set(experience.map((post) => post.slug)),
};

function publicAsset(path) {
  if (!path.startsWith("/") || path.startsWith("//")) return false;
  const local = new URL(path, "https://site.invalid");
  const file = join(root, "public", decodeURIComponent(local.pathname));
  return existsSync(file) && statSync(file).isFile();
}

function* nodes(node) {
  yield node;
  for (const child of node.children ?? []) yield* nodes(child);
}

function checkArticle(id, tree) {
  const elements = [...nodes(tree)];
  const definitions = new Map(elements.filter((node) => node.type === "definition").map((node) => [node.identifier, node.url]));
  for (const node of elements) {
    const url = node.url ?? definitions.get(node.identifier);
    if (!url) continue;
    if ((node.type === "image" || node.type === "imageReference") && url.startsWith("/") && !url.startsWith("//")) {
      if (!publicAsset(url)) fail(`${id}: image missing on disk (${url})`);
    }
    if (node.type !== "link" && node.type !== "linkReference") continue;
    const match = /^\/(work|blog|experience)\/([^/?#]+)\/?(?:[?#].*)?$/.exec(url);
    if (match && !slugs[match[1]].has(match[2])) fail(`${id}: broken internal link ${url}`);
  }
}

function checkEntries(kind, articles) {
  for (const article of articles) {
    const id = `content/${kind}/${article.slug}.md`;
    if (kind === "work" && !publicAsset(article.cover)) fail(`${id}: cover missing on disk (${article.cover})`);
    checkArticle(id, article.tree);
  }
}

checkEntries("work", work);
checkEntries("blog", blog);
checkEntries("experience", experience);

const data = readFileSync(join(root, "lib/data.ts"), "utf8");
for (const match of data.matchAll(/caseStudy:\s*"\/work\/([\w-]+)"/g)) {
  if (!slugs.work.has(match[1])) fail(`lib/data.ts: caseStudy /work/${match[1]} has no Markdown file`);
}
for (const match of data.matchAll(/\barticleSlug:\s*["']([^"']+)["']/g)) {
  if (!slugs.experience.has(match[1])) fail(`lib/data.ts: articleSlug ${match[1]} has no Markdown file in content/experience/`);
}
for (const match of data.matchAll(/(?:image|avatar|avatarLight):\s*"(\/img\/[^"]+)"/g)) {
  if (!publicAsset(match[1])) fail(`lib/data.ts: missing asset ${match[1]}`);
}

if (errors.length) {
  console.error("Content validation failed:\n" + errors.map((error) => "  - " + error).join("\n"));
  process.exit(1);
}
console.log(`Content OK: ${work.length} case studies, ${blog.length} posts, ${experience.length} experience articles`);

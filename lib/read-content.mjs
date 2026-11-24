import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";

const markdown = remark().use(remarkGfm);
const publicImagePrefix = /^(?:\/|(?:\.\.?\/)*)public\/img\//;
const imageLabel = String.raw + ""; 

/** @param {string} date */
export const toISO = (date) => new Date(`${date} UTC`).toISOString();

/** @param {import('mdast').Nodes} node */
function plainText(node) {
  if ("value" in node && node.type !== "html") return String(node.value);
  if ("children" in node) return node.children.map(plainText).join(" ");
  return "";
}

/** @param {string} root @param {'blog' | 'work'} kind */
export function readContent(root, kind) {
  const directory = join(root, "content", kind);
  if (!existsSync(directory)) return [];

  const articles = readdirSync(directory, { withFileTypes: true })
    .filter((file) => file.isFile() && file.name.endsWith(".md"))
    .map((file) => {
      const slug = file.name.slice(0, -3);
      /** @param {string} message */
      const fail = (message) => { throw new Error(`content/${kind}/${file.name}: ${message}`); };
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) fail("use a lowercase slug with letters, numbers and hyphens");

      const source = readFileSync(join(directory, file.name), "utf8").replace(/^\uFEFF/, "");
      // Only YAML front matter is accepted, with a plain delimiter on its own line.
      if (!/^---[ \t]*\r?\n/.test(source) || !/^---[ \t]*\r?$/m.test(source.slice(source.indexOf("\n") + 1))) {
        fail("expected a YAML metadata header between two --- lines");
      }
      let parsed;
      try {
        parsed = matter(source, { language: "yaml" });
      } catch (error) {
        throw new Error(`content/${kind}/${file.name}: invalid YAML metadata`, { cause: error });
      }
      const { data, content } = parsed;

      /** @param {string} name */
      const required = (name) => {
        const value = data[name];
        if (typeof value !== "string" || !value.trim()) return fail(`missing or invalid ${name}`);
        return value.trim();
      };
      const title = required("title");
      const category = required("category");
      const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : required("date");
      if (Number.isNaN(Date.parse(`${date} UTC`))) fail(`invalid date "${date}"`);
      const body = content.trim();
      if (!body) fail("the Markdown body is empty");

      const tree = markdown.parse(body);
      const paragraph = tree.children.find((node) => node.type === "paragraph" && plainText(node).trim());
      const summary = paragraph ? plainText(paragraph).trim() : undefined;
      const wordCount = plainText(tree).trim().split(/\s+/).filter(Boolean).length;
      const cover = kind === "work" ? required("cover") : "";
      const tags = kind === "work" ? data.tags : [];
      if (!Array.isArray(tags) || tags.some((tag) => typeof tag !== "string" || !tag.trim())) {
        fail("tags must be a list of strings");
      }
      return { slug, title, category, date, body, cover, tags: /** @type {string[]} */ (tags), summary, wordCount, tree };
    });

  return articles.sort((a, b) => toISO(b.date).localeCompare(toISO(a.date)) || a.slug.localeCompare(b.slug));
}

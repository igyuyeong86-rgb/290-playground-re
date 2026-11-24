import { readContent } from "./read-content.mjs";

export { toISO } from "./read-content.mjs";

export const caseStudies = readContent(process.cwd(), "work");
export const posts = readContent(process.cwd(), "blog");
export const experiencePosts = readContent(process.cwd(), "experience");

export const getCaseStudy = (slug: string) => caseStudies.find((c) => c.slug === slug);
export const getPost = (slug: string) => posts.find((p) => p.slug === slug);
export const getExperiencePost = (slug: string) => experiencePosts.find((p) => p.slug === slug);

/** Split "Name: subtitle" titles. */
export function splitTitle(title: string) {
  const i = title.indexOf(": ");
  return i === -1 ? { name: title, sub: "" } : { name: title.slice(0, i), sub: title.slice(i + 2) };
}

export const readingTime = (wordCount: number) => Math.max(1, Math.round(wordCount / 220));

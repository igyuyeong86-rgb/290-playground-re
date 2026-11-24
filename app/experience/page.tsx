import type { Metadata } from "next";
import Link from "next/link";
import ArticleShell from "@/components/ArticleShell";
import { experiencePosts, toISO } from "@/lib/content";
import { plainDescription } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Experience",
  alternates: { canonical: absoluteUrl("/experience") },
};

export default function ExperiencePage() {
  return (
    <ArticleShell back="/#experience" backLabel="Back to home">
      <h1 className="section-title">Experience</h1>
      <ul className="divide-y divide-line">
        {experiencePosts.map((post) => (
          <li key={post.slug}>
            <Link href={`/experience/${post.slug}`} className="group block px-6 py-5 transition-colors hover:bg-[var(--hover)]">
              <time dateTime={toISO(post.date)} className="font-mono text-[11px] text-soft">{post.date}</time>
              <h2 className="mt-1.5 font-serif text-2xl group-hover:underline group-hover:underline-offset-4">{post.title}</h2>
              {post.summary && <p className="mt-2 line-clamp-2 text-[14px] text-muted">{plainDescription(post.summary, 220)}</p>}
            </Link>
          </li>
        ))}
      </ul>
    </ArticleShell>
  );
}

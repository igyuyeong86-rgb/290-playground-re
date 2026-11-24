import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleBody from "@/components/ArticleBody";
import ArticleShell from "@/components/ArticleShell";
import { experiencePosts, getExperiencePost, toISO } from "@/lib/content";
import { plainDescription } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export const dynamicParams = false;
export const generateStaticParams = () => experiencePosts.map((post) => ({ slug: post.slug }));

export async function generateMetadata({ params }: PageProps<"/experience/[slug]">): Promise<Metadata> {
  const post = getExperiencePost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: plainDescription(post.summary),
    alternates: { canonical: absoluteUrl(`/experience/${post.slug}`) },
  };
}

export default async function ExperienceDetail({ params }: PageProps<"/experience/[slug]">) {
  const post = getExperiencePost((await params).slug);
  if (!post) notFound();

  return (
    <ArticleShell back="/experience" backLabel="All experiences">
      <article>
        <header className="space-y-3 border-b border-line px-6 py-9">
          <time dateTime={toISO(post.date)} className="font-mono text-[11px] text-soft">{post.date}</time>
          <h1 className="font-serif text-3xl leading-tight sm:text-4xl">{post.title}</h1>
        </header>
        <ArticleBody body={post.body} />
      </article>
    </ArticleShell>
  );
}

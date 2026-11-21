import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { withBase } from "@/lib/paths";

const headingId = (text: string) =>
  text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/(^-|-$)/g, "");

export default function ArticleBody({ body }: { body: string }) {
  return (
    <div className="article-body px-6 py-8 text-[15px] leading-[1.75] text-muted">
      <Markdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          h2({ children }) {
            const title = typeof children === "string" ? children : "";
            return <h2 id={headingId(title) || undefined}>{children}</h2>;
          },
          a({ href, children }) {
            const external = /^https?:\/\//i.test(href ?? "");
            const url = href?.startsWith("/") && !href.startsWith("//") ? withBase(href) : href;
            return <a href={url} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>{children}</a>;
          },
          img({ src, alt }) {
            if (typeof src !== "string" || !src) return null;
            const url = src.startsWith("/") && !src.startsWith("//") ? withBase(src) : src;
            // Markdown image dimensions are not known at build time.
            // eslint-disable-next-line @next/next/no-img-element
            return <img src={url} alt={alt ?? ""} loading="lazy" className="max-w-full rounded-lg border border-line" />;
          },
          table({ children }) {
            return <div className="overflow-x-auto"><table>{children}</table></div>;
          },
        }}
      >
        {body}
      </Markdown>
    </div>
  );
}

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { experience } from "@/lib/data";

export default function Experience() {
  return (
    <section id="experience">
      <h2 className="section-title">
        <Link href="/experience" className="inline-flex items-center gap-2 hover:underline">
          Experience <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </h2>
      <div className="space-y-7 px-6 py-6">
        {experience.map((e) => (
          <div key={e.company + e.role}>
            <h3 className="text-[15px] font-semibold">
              {e.articleSlug ? (
                <Link href={`/experience/${e.articleSlug}`} className="inline-flex items-center gap-1.5 hover:underline">
                  {e.role} <ArrowUpRight size={13} aria-hidden="true" />
                </Link>
              ) : e.role} <span className="font-normal text-soft">· {e.company}</span>
            </h3>
            <p className="mt-1 font-mono text-xs text-soft">{e.period}</p>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">{e.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

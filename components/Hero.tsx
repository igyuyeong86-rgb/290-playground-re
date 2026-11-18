"use client";
import Image from "next/image";
import { useSearch } from "./Chrome";
import { withBase } from "@/lib/paths";
import { MapPin, Clock } from "lucide-react";
import { profile } from "@/lib/data";

const avatarStyle = "size-24 shrink-0 rounded-xl border border-line bg-card object-cover shadow-lg";

function ThemeBanner({ variant }: { variant: "night" | "day" }) {
  const asset = variant === "day" ? "/img/matrix-290-day" : "/img/matrix-290";

  return (
    <picture className={variant === "day" ? "theme-light-only" : "theme-dark-only"}>
      <source media="(prefers-reduced-motion: reduce)" srcSet={withBase(`${asset}-poster.png`)} />
      <source type="image/webp" srcSet={withBase(`${asset}-banner.webp`)} />
      <img src={withBase(`${asset}-banner.gif`)} alt="" width={1200} height={300} decoding="async"
        className="absolute inset-0 size-full object-cover object-center [image-rendering:pixelated]" />
    </picture>
  );
}

export default function Hero() {
  const onSearch = useSearch();
  return (
    <section id="home">
      <div className="relative h-36 overflow-hidden border-b border-line sm:h-44">
        <ThemeBanner variant="night" />
        <ThemeBanner variant="day" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/40 to-transparent" />
      </div>
      <div className="relative flex items-start justify-between gap-4 px-6 pb-7">
        <div className="-mt-10 flex items-end gap-5">
          <Image src={profile.avatar} alt={profile.name} width={96} height={96} loading="eager"
            className={`theme-dark-only ${avatarStyle}`} />
          <Image src={profile.avatarLight} alt={profile.name} width={96} height={96} loading="eager"
            className={`theme-light-only ${avatarStyle}`} />
          <div className="pb-1">
            <h1 className="font-serif text-2xl leading-tight sm:text-3xl md:text-4xl">{profile.name}</h1>
            <p className="mt-1 font-mono text-[13px] text-muted">{profile.role}</p>
            <p className="mt-1 flex items-center gap-3 font-mono text-[11px] text-soft">
              <span className="flex items-center gap-1"><MapPin size={11} />{profile.location}</span>
              <span className="flex items-center gap-1"><Clock size={11} />{profile.timezone}</span>
            </p>
          </div>
        </div>
        <button
          onClick={onSearch}
          className="mt-4 hidden items-center gap-2 rounded-md border border-line px-3 py-1.5 font-mono text-[11px] text-muted hover:text-fg sm:flex"
        >
          Search <kbd>⌘K</kbd>
        </button>
      </div>
    </section>
  );
}

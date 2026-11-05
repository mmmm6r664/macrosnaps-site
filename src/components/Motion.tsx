"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

/** Fades/slides in every [data-reveal] element as it scrolls into view. */
export function ScrollReveal() {
  useEffect(() => {
    document.documentElement.classList.add("js-reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    const scan = () => document.querySelectorAll("[data-reveal]:not(.is-visible)").forEach((el) => io.observe(el));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, []);
  return null;
}

/** Cross-fading hero slideshow with a slow zoom. */
export function HeroSlideshow({ slides, interval = 5500 }: { slides: { src: string; alt: string; pos?: string }[]; interval?: number }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % slides.length), interval);
    return () => clearInterval(t);
  }, [slides.length, interval]);
  return (
    <div className="absolute inset-0 -z-10">
      {slides.map((s, k) => (
        <div key={s.src} className={`absolute inset-0 transition-opacity duration-[1600ms] ${k === i ? "opacity-100" : "opacity-0"}`} aria-hidden={k !== i}>
          <Image src={s.src} alt={s.alt} fill priority={k === 0} sizes="100vw" className={`object-cover ${k === i ? "kenburns" : ""}`} style={{ objectPosition: s.pos ?? "center 30%" }} />
        </div>
      ))}
      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((s, k) => (
          <button key={s.src} type="button" aria-label={`Show slide ${k + 1}`} onClick={() => setI(k)} className={`h-1.5 rounded-full transition-all ${k === i ? "w-8 bg-gold" : "w-3 bg-white/60"}`} />
        ))}
      </div>
    </div>
  );
}

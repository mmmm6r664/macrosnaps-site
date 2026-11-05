"use client";
import { useEffect, useRef, useState } from "react";

export const STATS = [
  { value: 1000, suffix: "+", label: "Corporate events & conferences" },
  { value: 5000, suffix: "+", label: "Weddings & private events" },
  { value: 13, suffix: "+", label: "Years of experience" },
  { value: 50, suffix: "", label: "States, plus DC, Ontario & Quebec" },
];

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min((t - t0) / 1600, 1);
        setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{n.toLocaleString()}{suffix}</span>;
}

export default function Stats({ dark = false }: { dark?: boolean }) {
  return (
    <section className={`px-4 py-14 md:px-6 ${dark ? "bg-black text-white" : "bg-white"}`}>
      <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-8 text-center md:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label}>
            <dt className="order-2 mt-2 text-sm uppercase tracking-[.15em] text-muted">{s.label}</dt>
            <dd className={`font-serif text-5xl md:text-6xl ${dark ? "text-gold" : "text-gold-dark"}`}><Counter to={s.value} suffix={s.suffix} /></dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

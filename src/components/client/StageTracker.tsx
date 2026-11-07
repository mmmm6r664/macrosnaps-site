import { STAGES, stageIndex } from "@/lib/clientData";

export default function StageTracker({ stage, compact = false }: { stage: string; compact?: boolean }) {
  const at = stageIndex(stage);
  return (
    <div>
      <ol className="flex items-start" aria-label="Order progress">
        {STAGES.map((s, i) => (
          <li key={s.id} className="relative flex flex-1 flex-col items-center text-center" aria-current={i === at ? "step" : undefined}>
            {i > 0 && <span className={`absolute right-1/2 top-3 h-0.5 w-full ${i <= at ? "bg-gold" : "bg-black/10"}`} aria-hidden />}
            <span className={`relative z-10 grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${i < at ? "bg-gold text-black" : i === at ? "bg-black text-gold ring-4 ring-gold/30" : "bg-black/10 text-black/40"}`}>{i < at ? "✓" : i + 1}</span>
            {!compact && <span className={`mt-2 px-1 text-[11px] leading-tight sm:text-xs ${i <= at ? "font-semibold text-ink" : "text-muted"}`}>{s.label}</span>}
          </li>
        ))}
      </ol>
      <p className={`${compact ? "mt-2" : "mt-4"} text-sm text-muted`}>{STAGES[at].client}</p>
    </div>
  );
}

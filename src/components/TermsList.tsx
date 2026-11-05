import { TERMS } from "@/lib/terms";
export default function TermsList({ compact = false }: { compact?: boolean }) {
  return (
    <ol className={compact ? "space-y-4 text-sm leading-relaxed" : "space-y-6"}>
      {TERMS.map((t, i) => (
        <li key={t.title}>
          <h3 className={compact ? "font-semibold" : "font-serif text-2xl"}>{i + 1}. {t.title}</h3>
          <p className={compact ? "mt-1 text-muted" : "mt-2"}>{t.body}</p>
        </li>
      ))}
    </ol>
  );
}

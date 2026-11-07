import Logo from "@/components/Logo";
export default function AuthCard({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-lg border border-black/10 bg-white p-8 shadow-sm">
        <Logo size={56} onLight />
        <h1 className="mb-2 mt-1 text-sm font-semibold uppercase tracking-[.2em] text-black/50">{title}</h1>
        {sub && <p className="mb-6 text-sm text-black/60">{sub}</p>}
        {children}
      </div>
    </div>
  );
}

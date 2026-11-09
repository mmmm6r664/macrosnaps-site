import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { q } from "@/lib/db";
import { PageHead, Card, Badge, fmtDate, btnGhost, previewDoc, PREVIEW_SANDBOX } from "@/components/admin/ui";

export const metadata = { title: "Sent email" };

export default async function SentEmail({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const [m] = await q<{ id: number; to_addr: string; subject: string; html: string | null; reply_to: string | null; attachments: string[]; status: string; error: string | null; provider_id: string | null; created_at: Date }[]>`
    select * from email_log where id = ${Number((await params).id) || 0}`;
  if (!m) notFound();
  return (
    <>
      <PageHead title={m.subject || "(no subject)"} sub={`Sent ${fmtDate(m.created_at, true)}`} actions={<><Badge status={m.status === "sent" ? "done" : "failed"}>{m.status}</Badge><Link href="/admin/messages" className={btnGhost}>← All emails</Link></>} />
      <Card>
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[120px_1fr]">
          <dt className="text-black/50">From</dt><dd>MacroSnaps &lt;info@e.macrosnaps.com&gt;</dd>
          <dt className="text-black/50">To</dt><dd className="break-words">{m.to_addr}</dd>
          <dt className="text-black/50">Replies go to</dt><dd>{m.reply_to}</dd>
          {m.attachments?.length ? <><dt className="text-black/50">Attachments</dt><dd>{m.attachments.join(", ")}</dd></> : null}
          {m.error && <><dt className="text-black/50">Problem</dt><dd className="text-red-700">{m.error}</dd></>}
        </dl>
      </Card>
      <div className="mt-5 overflow-hidden rounded-lg border border-black/10 bg-[#eeeae0]">
        {m.html
          ? <iframe title="Email preview" sandbox={PREVIEW_SANDBOX} srcDoc={previewDoc(m.html)} className="h-[1200px] w-full border-0" />
          : <p className="p-6 text-sm text-black/60">The copy of this email is no longer stored (emails older than 180 days keep only the summary above).</p>}
      </div>
    </>
  );
}

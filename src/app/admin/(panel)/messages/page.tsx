import { requireUser } from "@/lib/auth";
import { q } from "@/lib/db";
import { PageHead, Table, Badge, Empty, fmtDate } from "@/components/admin/ui";

export const metadata = { title: "Messages log" };

export default async function Messages() {
  await requireUser();
  const rows = await q<{ id: number; channel: string; recipient: string; subject: string | null; body: string; status: string; error: string | null; created_at: Date }[]>`
    select id, channel, recipient, subject, body, status, error, created_at from outbound_messages order by id desc limit 300`;
  return (
    <>
      <PageHead title="Messages log" sub="Every email and text sent from the portal to photographers and videographers (last 300)." />
      {rows.length ? (
        <Table head={["When", "Type", "To", "Message", "Status"]}>
          {rows.map((m) => (
            <tr key={m.id} className="align-top">
              <td className="whitespace-nowrap px-4 py-3 text-black/60">{fmtDate(m.created_at, true)}</td>
              <td className="px-4 py-3">{m.channel === "sms" ? "Text" : "Email"}</td>
              <td className="px-4 py-3">{m.recipient}</td>
              <td className="max-w-md px-4 py-3">{m.subject && <b className="block">{m.subject}</b>}<span className="line-clamp-2 text-black/70">{m.body}</span></td>
              <td className="px-4 py-3"><Badge status={m.status === "sent" ? "done" : "failed"}>{m.status}</Badge>{m.error && <div className="text-xs text-red-700">{m.error}</div>}</td>
            </tr>
          ))}
        </Table>
      ) : <Empty>No messages sent yet.</Empty>}
    </>
  );
}

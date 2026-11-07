import { q } from "@/lib/db";
import type { User } from "@/lib/auth";
import { Card, PageHead, Notice, fmtDate } from "@/components/admin/ui";
import { SetupPanel, SignOutOthers } from "./MfaForms";

export default async function SecurityPage({ u, manager }: { u: User; manager: boolean }) {
  const sessions = await q<{ ip: string | null; user_agent: string | null; created_at: Date }[]>`
    select ip, user_agent, created_at from sessions where user_id = ${u.id} and not mfa_pending and expires_at > now() order by created_at desc limit 10`;
  const [{ left }] = await q<{ left: number }[]>`select count(*)::int as left from recovery_codes where user_id = ${u.id} and used_at is null`;
  return (
    <>
      <PageHead title="Security" sub={`${u.name} · ${u.email}`} />
      {manager && !u.totp_enabled && <Notice>Owner and admin accounts must use two-factor authentication. Set it up to continue to the admin portal.</Notice>}
      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Two-factor authentication">
          <SetupPanel enabled={u.totp_enabled} manager={manager} />
          {u.totp_enabled && <p className="mt-3 text-xs text-black/50">{left} unused recovery code{left === 1 ? "" : "s"} left.</p>}
        </Card>
        <Card title="Where you're signed in">
          <ul className="mb-4 divide-y divide-black/5 text-sm">{sessions.map((x, i) => <li key={i} className="py-2">{fmtDate(x.created_at, true)} · {x.ip || "unknown IP"}<div className="truncate text-xs text-black/50">{x.user_agent}</div></li>)}</ul>
          <SignOutOthers />
        </Card>
      </div>
    </>
  );
}

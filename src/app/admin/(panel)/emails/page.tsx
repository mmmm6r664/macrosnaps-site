import { requireUser } from "@/lib/auth";
import { PageHead, Card, previewDoc, PREVIEW_SANDBOX } from "@/components/admin/ui";
import { SAMPLES } from "@/lib/emailSamples";
import { SendTestButton } from "@/components/admin/EmailTests";

export const metadata = { title: "Emails & automations" };

export default async function EmailsPage() {
  const u = await requireUser();
  const groups = [...new Set(SAMPLES.map((s) => s.group))];
  return (
    <>
      <PageHead title="Emails & automations" sub={`Every email the website sends, and when. Test copies go to ${u.email}.`} actions={<SendTestButton k="all" label="Send me all test emails" />} />
      {groups.map((g) => (
        <Card key={g} title={g} className="mb-5">
          <div className="grid gap-6 xl:grid-cols-2">
            {SAMPLES.filter((s) => s.group === g).map((s) => {
              const m = s.build();
              return (
                <div key={s.key} className="rounded border border-black/10">
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-black/10 p-3">
                    <div>
                      <p className="text-sm font-semibold">{m.subject}</p>
                      <p className="text-xs text-black/50">Sent: {s.when}</p>
                    </div>
                    <SendTestButton k={s.key} label="Send me a test" />
                  </div>
                  <iframe title={m.subject} srcDoc={previewDoc(m.html)} sandbox={PREVIEW_SANDBOX} className="h-[520px] w-full bg-[#ede9df]" loading="lazy" />
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </>
  );
}

import { useEffect, useState } from "react";
import { TbClock, TbHelpCircle, TbMessageQuestion, TbPencil, TbPlus, TbSend } from "react-icons/tb";
import { getMyths, getMythSubmissions } from "@/lib/api";
import { LANGUAGE_LABELS } from "@/lib/labels";
import { VERDICT } from "@/lib/learning";
import { Dialog, EmptyState, Loading, PageHeader, StatCard } from "@/components/admin/parts";
import { MythAnswerForm, MythForm } from "@/components/admin/learning";
import { Button } from "@/components/ui/Button";
import { errorMessage, timeAgo } from "@/lib/utils";
import type { Myth, MythSubmission } from "@/types";

type Tab = "PENDING" | "ANSWERED";

const senderOf = (s: MythSubmission) => s.user?.alias || s.sender?.alias || "Anonymous";
const answererOf = (s: MythSubmission) => {
  const admin = s.answeredBy ?? s.admin;
  return admin ? admin.alias || admin.email || "an admin" : null;
};

/** Myth Buster: myths sent in by users to answer, and the myth checks young people see in the app. */
export default function MythsPage() {
  const [myths, setMyths] = useState<Myth[] | null>(null);
  const [submissions, setSubmissions] = useState<MythSubmission[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [submissionsError, setSubmissionsError] = useState("");
  const [tab, setTab] = useState<Tab>("PENDING");
  const [adding, setAdding] = useState(false);
  const [answering, setAnswering] = useState<MythSubmission | null>(null);

  useEffect(() => {
    getMyths()
      .then(setMyths)
      .catch((error) => setLoadError(errorMessage(error, "Could not load the myth checks")));
    getMythSubmissions()
      .then((list) => setSubmissions([...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))))
      .catch((error) => {
        setSubmissions([]);
        setSubmissionsError(errorMessage(error, "Could not load the myths sent by users"));
      });
  }, []);

  if (loadError) return <EmptyState icon={TbHelpCircle} title="Could not load the myth checks" text={loadError} />;
  if (!myths || !submissions) return <Loading label="Loading myths…" />;

  const pending = submissions.filter((s) => s.status !== "ANSWERED");
  const answered = submissions.filter((s) => s.status === "ANSWERED");
  const shown = tab === "PENDING" ? pending : answered;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Myth Buster"
        title="Myths"
        description="Answer the myths young people send in, and manage the myth checks everyone sees in the Myths section."
      >
        <Button onClick={() => setAdding(true)}><TbPlus size={16} /> Add myth check</Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={TbClock} tone="sun" label="Waiting for an answer" value={pending.length} hint="Sent in by users" onClick={() => setTab("PENDING")} />
        <StatCard icon={TbSend} tone="teal" label="Answered" value={answered.length} hint="Sent in by users" onClick={() => setTab("ANSWERED")} />
        <StatCard icon={TbHelpCircle} tone="peach" label="Myth checks" value={myths.length} hint="Shown to everyone in the app" />
      </div>

      <section className="card p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
          <h2 className="m-0 text-[1.05rem] font-bold">Sent in by users</h2>
          <div className="chip-row" role="group" aria-label="Filter myths sent in by users">
            <button type="button" className="chip min-h-9" aria-pressed={tab === "PENDING"} onClick={() => setTab("PENDING")}>
              Waiting · {pending.length}
            </button>
            <button type="button" className="chip min-h-9" aria-pressed={tab === "ANSWERED"} onClick={() => setTab("ANSWERED")}>
              Answered · {answered.length}
            </button>
          </div>
        </div>

        {submissionsError ? (
          <p className="field-error m-0 p-4" role="alert">{submissionsError}</p>
        ) : shown.length === 0 ? (
          <EmptyState
            icon={TbMessageQuestion}
            title={tab === "PENDING" ? "No myths waiting" : "No answered myths yet"}
            text={tab === "PENDING" ? "When someone sends a myth from the app, it appears here for you to answer." : "Myths you answer will be listed here."}
          />
        ) : (
          <ul className="m-0 list-none divide-y divide-line p-0">
            {shown.map((s) => {
              const verdict = s.verdict ? VERDICT[s.verdict] : null;
              const answerer = answererOf(s);
              return (
                <li key={s.id} className="p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-[0.82rem] text-muted">
                    <span>Sent by <strong className="text-fg">{senderOf(s)}</strong></span>
                    <span className="inline-flex items-center gap-1"><TbClock size={13} /> {timeAgo(s.createdAt)}</span>
                    <span className="tag">{LANGUAGE_LABELS[s.language] ?? s.language}</span>
                  </div>
                  <p className="m-0 text-[1rem] font-semibold">“{s.mythText}”</p>
                  {s.status === "ANSWERED" && s.response && (
                    <div className="mt-3 rounded-[14px] bg-surface-2 px-4 py-3 text-[0.92rem]">
                      {verdict && <span className={`tag ${verdict.tag} mb-1.5`}>{verdict.label}</span>}
                      <p className="m-0 whitespace-pre-line">{s.response}</p>
                      {answerer && (
                        <p className="m-0 mt-1.5 text-[0.78rem] text-muted">
                          Answered by {answerer}{s.answeredAt ? ` · ${timeAgo(s.answeredAt)}` : ""}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="mt-3 flex justify-end">
                    {s.status === "ANSWERED" ? (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAnswering(s)}>
                        <TbPencil size={15} /> Change answer
                      </button>
                    ) : (
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => setAnswering(s)}>
                        <TbSend size={15} /> Answer
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-[1.05rem] font-bold">Myth checks in the app</h2>
        {myths.length === 0 ? (
          <div className="card">
            <EmptyState icon={TbHelpCircle} title="No myth checks yet" text="Add the first myth and the fact that answers it." />
          </div>
        ) : (
          <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2">
            {myths.map((m) => (
              <li key={m.id} className="card flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="tag tag-accent">Myth</span>
                  <span className="tag">{LANGUAGE_LABELS[m.language] ?? m.language}</span>
                </div>
                <p className="m-0 text-[1.02rem] font-semibold">“{m.mythText}”</p>
                <p className="m-0 rounded-[14px] bg-peach px-4 py-3 text-[0.92rem] text-peach-text">
                  <strong>Fact:</strong> {m.factText}
                </p>
                {m.sources.length > 0 && <p className="m-0 mt-auto text-[0.8rem] text-muted">Sources: {m.sources.join(" · ")}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <Dialog open={adding} onClose={() => setAdding(false)} title="Add myth check" size="lg">
        <MythForm
          onCancel={() => setAdding(false)}
          onCreated={(myth) => {
            setMyths((current) => [myth, ...(current ?? [])]);
            setAdding(false);
          }}
        />
      </Dialog>

      <Dialog
        open={!!answering}
        onClose={() => setAnswering(null)}
        title={answering?.status === "ANSWERED" ? "Change the answer" : "Answer this myth"}
        size="lg"
      >
        {answering && (
          <MythAnswerForm
            submission={answering}
            onCancel={() => setAnswering(null)}
            onAnswered={(saved) => {
              setSubmissions((list) => list?.map((s) => (s.id === saved.id ? saved : s)) ?? null);
              setAnswering(null);
              setTab("ANSWERED");
            }}
          />
        )}
      </Dialog>
    </div>
  );
}

import { useEffect, useState } from "react";
import { TbHelpCircle, TbPlus } from "react-icons/tb";
import { getMyths } from "@/lib/api";
import { LANGUAGE_LABELS } from "@/lib/labels";
import { Dialog, EmptyState, Loading, PageHeader, StatCard } from "@/components/admin/parts";
import { MythForm } from "@/components/admin/learning";
import { Button } from "@/components/ui/Button";
import { errorMessage } from "@/lib/utils";
import type { Language, Myth } from "@/types";

/** Myth Buster: the myth/fact checks young people see in the Myths section. */
export default function MythsPage() {
  const [myths, setMyths] = useState<Myth[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    getMyths()
      .then(setMyths)
      .catch((error) => setLoadError(errorMessage(error, "Could not load the myth checks")));
  }, []);

  if (loadError) return <EmptyState icon={TbHelpCircle} title="Could not load the myth checks" text={loadError} />;
  if (!myths) return <Loading label="Loading myth checks…" />;

  const inLanguage = (language: Language) => myths.filter((m) => m.language === language).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Myth Buster"
        title="Myths"
        description="Common myths and the facts that answer them, as young people see them in the Myths section."
      >
        <Button onClick={() => setAdding(true)}><TbPlus size={16} /> Add myth check</Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={TbHelpCircle} tone="peach" label="Myth checks" value={myths.length} />
        <StatCard icon={TbHelpCircle} tone="lavender" label="In English" value={inLanguage("EN")} />
        <StatCard icon={TbHelpCircle} tone="teal" label="In Kinyarwanda" value={inLanguage("RW")} />
      </div>

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
              {m.sources.length > 0 && (
                <p className="m-0 mt-auto text-[0.8rem] text-muted">Sources: {m.sources.join(" · ")}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      <Dialog open={adding} onClose={() => setAdding(false)} title="Add myth check" size="lg">
        <MythForm
          onCancel={() => setAdding(false)}
          onCreated={(myth) => {
            setMyths((current) => [myth, ...(current ?? [])]);
            setAdding(false);
          }}
        />
      </Dialog>
    </div>
  );
}

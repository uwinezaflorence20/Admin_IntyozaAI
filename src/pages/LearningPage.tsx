import { useEffect, useState } from "react";
import { TbBook, TbVideo, TbHeadphones, TbListCheck, TbHelpCircle, TbFileText, TbEye } from "react-icons/tb";
import { toast } from "sonner";
import { getLessons, getMyths } from "@/lib/api";
import type { IconType } from "react-icons";
import { PageHeader, Panel, Loading, StatCard } from "@/components/admin/parts";
import { errorMessage } from "@/lib/utils";
import type { Lesson, Myth } from "@/types";

const FORMAT_ICON: Record<string, IconType> = { Article: TbFileText, Video: TbVideo, Audio: TbHeadphones, Quiz: TbListCheck, "Myth or fact": TbHelpCircle };
const STATUS_TAG: Record<Lesson["status"], string> = { published: "tag-success", review: "tag-sun", draft: "" };
const STATUS_LABEL: Record<Lesson["status"], string> = { published: "Published", review: "In review", draft: "Draft" };

export default function LearningPage() {
  const [lessons, setLessons] = useState<Lesson[] | null>(null);
  const [myths, setMyths] = useState<Myth[]>([]);
  const [sample, setSample] = useState(false);

  useEffect(() => {
    Promise.all([getLessons(), getMyths()])
      .then(([l, m]) => {
        setLessons(l.data);
        setMyths(m.data);
        setSample(l.sample || m.sample);
      })
      .catch((error) => toast.error(errorMessage(error, "Could not load learning content")));
  }, []);

  if (!lessons) return <Loading label="Loading learning content…" />;

  const completions = lessons.reduce((sum, l) => sum + l.completions, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Learn & Myth Buster"
        title="Learning content"
        description="Lessons, quizzes and myth checks young people see in the Learn and Myths sections."
        sample={sample}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={TbBook} tone="lavender" label="Lessons" value={lessons.length} hint={`${lessons.filter((l) => l.status === "published").length} published`} />
        <StatCard icon={TbListCheck} tone="teal" label="Completions" value={completions.toLocaleString("en-GB")} />
        <StatCard icon={TbHelpCircle} tone="peach" label="Myths answered" value={myths.length} />
      </div>

      <section className="card p-0">
        <div className="border-b border-line p-4">
          <h2 className="m-0 text-[1.05rem] font-bold">Lessons</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Lesson</th>
                <th>Format</th>
                <th>Languages</th>
                <th className="text-right">Completions</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((l) => {
                const Icon = FORMAT_ICON[l.format] || TbFileText;
                return (
                  <tr key={l.id}>
                    <td>
                      <p className="m-0 font-semibold">{l.title}</p>
                      <p className="m-0 text-[0.8rem] text-muted">{l.category}</p>
                    </td>
                    <td className="whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5"><Icon size={16} className="text-brand" /> {l.format}</span>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        {l.languages.map((lang) => <span key={lang} className="tag">{lang}</span>)}
                      </div>
                    </td>
                    <td className="text-right tabular-nums">{l.completions.toLocaleString("en-GB")}</td>
                    <td><span className={`tag ${STATUS_TAG[l.status]}`}>{STATUS_LABEL[l.status]}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <Panel title="Myth Buster" description="Most viewed myth checks">
        <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-2">
          {myths.map((m) => (
            <li key={m.id} className="rounded-[14px] bg-peach p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className={`tag ${m.verdict === "Myth" ? "tag-accent" : "tag-success"}`}>{m.verdict}</span>
                <span className="inline-flex items-center gap-1 text-[0.8rem] text-peach-text"><TbEye size={14} /> {m.views.toLocaleString("en-GB")}</span>
              </div>
              <p className="m-0 font-medium">“{m.myth}”</p>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

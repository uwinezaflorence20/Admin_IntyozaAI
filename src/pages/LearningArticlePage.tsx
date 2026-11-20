import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  TbAlertCircle, TbArrowLeft, TbCalendar, TbCircleCheck, TbClock, TbEyeOff, TbPencil, TbTrash, TbUsers,
} from "react-icons/tb";
import { toast } from "sonner";
import { deleteArticle, getAdminArticles, getArticle, getArticleLearners, getCategories } from "@/lib/api";
import { FORMAT } from "@/lib/learning";
import { LANGUAGE_LABELS } from "@/lib/labels";
import { Dialog, EmptyState, Loading, Panel } from "@/components/admin/parts";
import { ArticleForm } from "@/components/admin/learning";
import { Button } from "@/components/ui/Button";
import { errorMessage, timeAgo } from "@/lib/utils";
import type { Article, ArticleLearners, Category } from "@/types";

const formatDate = (date?: string | null) =>
  date ? new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Unknown";

/** The people learning one article, with counts of who is still reading and who finished. */
function LearnersPanel({ articleId }: { articleId: string }) {
  const [data, setData] = useState<ArticleLearners | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getArticleLearners(articleId)
      .then((d) => active && setData(d))
      .catch((e) => active && setError(errorMessage(e, "Could not load the learners")));
    return () => {
      active = false;
    };
  }, [articleId]);

  return (
    <Panel title="Learners" description="People who opened this article in the app">
      {error ? (
        <p className="field-error m-0" role="alert">{error}</p>
      ) : !data ? (
        <Loading label="Loading learners…" />
      ) : (
        <>
          <div className="mb-4 grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Total", value: data.summary.total, className: "bg-surface-2" },
              { label: "Reading", value: data.summary.inProgress, className: "bg-sun-soft text-sun-text" },
              { label: "Finished", value: data.summary.completed, className: "bg-success-soft text-success" },
            ].map((s) => (
              <div key={s.label} className={`rounded-[12px] px-2 py-2.5 ${s.className}`}>
                <span className="block text-[1.3rem] leading-tight font-bold">{s.value}</span>
                <span className="block text-[0.75rem] font-medium">{s.label}</span>
              </div>
            ))}
          </div>
          {data.learners.length === 0 ? (
            <p className="m-0 text-center text-[0.88rem] text-muted">Nobody has opened this article yet.</p>
          ) : (
            <ul className="m-0 max-h-[420px] list-none divide-y divide-line overflow-y-auto p-0">
              {data.learners.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0">
                    <span className="block truncate text-[0.9rem] font-semibold">{l.alias || "Anonymous"}</span>
                    <span className="block text-[0.78rem] text-muted">
                      {l.status === "COMPLETED" ? `Finished ${timeAgo(l.completedAt)}` : `Started ${timeAgo(l.startedAt)}`}
                    </span>
                  </span>
                  {l.status === "COMPLETED" ? (
                    <span className="tag tag-success shrink-0"><TbCircleCheck size={12} /> Finished</span>
                  ) : (
                    <span className="tag tag-sun shrink-0"><TbClock size={12} /> Reading</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Panel>
  );
}

/** One article as an admin sees it: the content and media, its details, who is learning it, and edit/delete. */
export default function LearningArticlePage() {
  const { categoryId = "", articleId = "" } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadError, setLoadError] = useState("");
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    // The admin list covers unpublished articles; the single-article read adds anything the list leaves out.
    Promise.all([getAdminArticles(), getCategories(), getArticle(articleId).catch(() => null)])
      .then(([all, cats, detail]) => {
        if (!active) return;
        const row = all.find((a) => a.id === articleId);
        if (!row && !detail) {
          setLoadError("This article was not found. It may have been deleted.");
          return;
        }
        setCategories(cats);
        setArticle({ ...detail, ...row } as Article);
      })
      .catch((error) => active && setLoadError(errorMessage(error, "Could not load this article")));
    return () => {
      active = false;
    };
  }, [articleId]);

  const category = categories.find((c) => c.id === (article?.categoryId ?? categoryId));
  const back = (
    <Link to={`/admin/learning/${article?.categoryId ?? categoryId}`} className="btn btn-ghost btn-sm -ml-2 w-fit">
      <TbArrowLeft size={16} /> {category?.nameEn ?? "Back to category"}
    </Link>
  );

  if (loadError) {
    return (
      <div className="space-y-4">
        {back}
        <EmptyState icon={TbAlertCircle} title="Could not load this article" text={loadError} />
      </div>
    );
  }
  if (!article) return <Loading label="Loading article…" />;

  const format = FORMAT[article.format] ?? FORMAT.ARTICLE;
  const published = article.published !== false;

  const remove = async () => {
    setIsDeleting(true);
    try {
      await deleteArticle(article.id);
      toast.success("Article deleted");
      navigate(`/admin/learning/${article.categoryId}`, { replace: true });
    } catch (error) {
      toast.error(errorMessage(error, "Could not delete the article"));
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {back}
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>
            <TbPencil size={15} /> Edit
          </button>
          <button type="button" className="btn btn-danger-outline btn-sm" onClick={() => setConfirmDelete(true)}>
            <TbTrash size={15} /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article className="card overflow-hidden p-0">
          {article.mediaUrl &&
            (article.mediaType === "VIDEO" ? (
              <video src={article.mediaUrl} controls className="max-h-[420px] w-full bg-black" />
            ) : (
              <img src={article.mediaUrl} alt="" className="max-h-[420px] w-full object-cover" />
            ))}
          <div className="p-5">
            {category && <span className="eyebrow">{category.nameEn}</span>}
            <h1 className="m-0 font-display text-[clamp(1.5rem,2.6vw,2rem)] leading-tight font-bold">{article.title}</h1>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="tag"><format.icon size={13} /> {format.label}</span>
              <span className="tag">{LANGUAGE_LABELS[article.language] ?? article.language}</span>
              {article.isLowData && <span className="tag tag-teal">Low-data</span>}
              {!published && <span className="tag tag-sun"><TbEyeOff size={12} /> Not published</span>}
            </div>
            {/* Shown as plain text, exactly as written, so nothing in it is run as markup. */}
            {article.content ? (
              <div className="mt-6 max-w-[68ch] text-[1rem] leading-relaxed whitespace-pre-line">{article.content}</div>
            ) : (
              <p className="mt-6 mb-0 text-muted">This article has no text.</p>
            )}
          </div>
        </article>

        <div className="space-y-4">
          <Panel title="Details">
            <dl className="m-0 space-y-3 text-[0.9rem]">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Status</dt>
                <dd className="m-0">
                  {published ? (
                    <span className="tag tag-success"><TbCircleCheck size={13} /> Published</span>
                  ) : (
                    <span className="tag tag-sun"><TbEyeOff size={13} /> Not published</span>
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Created</dt>
                <dd className="m-0 inline-flex items-center gap-1.5"><TbCalendar size={15} className="text-muted" /> {formatDate(article.createdAt)}</dd>
              </div>
              {article.updatedAt && article.updatedAt !== article.createdAt && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">Last updated</dt>
                  <dd className="m-0">{formatDate(article.updatedAt)}</dd>
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Learners</dt>
                <dd className="m-0 inline-flex items-center gap-1.5"><TbUsers size={15} className="text-muted" /> {article.learnerCount ?? 0}</dd>
              </div>
            </dl>
          </Panel>

          <LearnersPanel articleId={article.id} />
        </div>
      </div>

      <Dialog open={editing} onClose={() => setEditing(false)} title="Edit article" size="lg">
        {editing && (
          <ArticleForm
            categories={categories}
            article={article}
            onCancel={() => setEditing(false)}
            onSaved={(saved) => {
              setArticle(saved);
              setEditing(false);
              if (saved.categoryId !== categoryId) navigate(`/admin/learning/${saved.categoryId}/${saved.id}`, { replace: true });
            }}
          />
        )}
      </Dialog>

      <Dialog open={confirmDelete} onClose={() => !isDeleting && setConfirmDelete(false)} title="Delete this article?">
        <p className="mb-4 text-[0.92rem] text-muted">
          <strong className="text-fg">{article.title}</strong> will be removed from the app, along with everyone's reading progress. This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" disabled={isDeleting} onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button type="button" variant="danger" isLoading={isDeleting} onClick={remove}>Delete article</Button>
        </div>
      </Dialog>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { TbAlertCircle, TbArrowLeft, TbCalendar, TbCircleCheck, TbEyeOff } from "react-icons/tb";
import { getArticle } from "@/lib/api";
import { FORMAT } from "@/lib/learning";
import { LANGUAGE_LABELS } from "@/lib/labels";
import { EmptyState, Loading, Panel } from "@/components/admin/parts";
import { errorMessage } from "@/lib/utils";
import type { ArticleDetail } from "@/types";

const formatDate = (date: string) => new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** One article as an admin sees it: the full content and its details. */
export default function LearningArticlePage() {
  const { categoryId = "", articleId = "" } = useParams();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    getArticle(articleId)
      .then((a) => active && setArticle(a))
      .catch((error) => active && setLoadError(errorMessage(error, "Could not load this article")));
    return () => {
      active = false;
    };
  }, [articleId]);

  const back = (
    <Link to={`/admin/learning/${article?.categoryId ?? categoryId}`} className="btn btn-ghost btn-sm -ml-2 w-fit">
      <TbArrowLeft size={16} /> {article ? article.category.nameEn : "Back to category"}
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

  return (
    <div className="space-y-6">
      {back}

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="card">
          <span className="eyebrow">{article.category.nameEn}</span>
          <h1 className="m-0 font-display text-[clamp(1.5rem,2.6vw,2rem)] leading-tight font-bold">{article.title}</h1>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="tag"><format.icon size={13} /> {format.label}</span>
            <span className="tag">{LANGUAGE_LABELS[article.language] ?? article.language}</span>
            {article.isLowData && <span className="tag tag-teal">Low-data</span>}
          </div>
          {/* Shown as plain text, exactly as written, so nothing in it is run as markup. */}
          <div className="mt-6 max-w-[68ch] text-[1rem] leading-relaxed whitespace-pre-line">{article.content}</div>
        </article>

        <div className="space-y-4">
          <Panel title="Details">
            <dl className="m-0 space-y-3 text-[0.9rem]">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Status</dt>
                <dd className="m-0">
                  {article.published ? (
                    <span className="tag tag-success"><TbCircleCheck size={13} /> Published</span>
                  ) : (
                    <span className="tag"><TbEyeOff size={13} /> Not published</span>
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Published</dt>
                <dd className="m-0 inline-flex items-center gap-1.5"><TbCalendar size={15} className="text-muted" /> {formatDate(article.createdAt)}</dd>
              </div>
              {article.updatedAt !== article.createdAt && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">Last updated</dt>
                  <dd className="m-0">{formatDate(article.updatedAt)}</dd>
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Category</dt>
                <dd className="m-0 text-right">{article.category.nameEn}</dd>
              </div>
            </dl>
          </Panel>
        </div>
      </div>
    </div>
  );
}

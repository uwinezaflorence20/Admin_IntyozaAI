import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { TbAlertCircle, TbArrowLeft, TbBook, TbChevronRight, TbEyeOff, TbPlus, TbUsers } from "react-icons/tb";
import { getAdminArticles, getCategories } from "@/lib/api";
import { FORMAT } from "@/lib/learning";
import { LANGUAGE_LABELS } from "@/lib/labels";
import { Dialog, EmptyState, Loading, PageHeader } from "@/components/admin/parts";
import { ArticleForm } from "@/components/admin/learning";
import { Button } from "@/components/ui/Button";
import { errorMessage } from "@/lib/utils";
import type { Article, Category } from "@/types";

const BackLink = () => (
  <Link to="/admin/learning" className="btn btn-ghost btn-sm -ml-2 w-fit">
    <TbArrowLeft size={16} /> All categories
  </Link>
);

/** One learning category: its articles (published or not), each opening the full article. */
export default function LearningCategoryPage() {
  const { categoryId = "" } = useParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let active = true;
    // The category details come from the full list.
    Promise.all([getCategories(), getAdminArticles()])
      .then(([c, a]) => {
        if (!active) return;
        setCategories(c);
        setArticles(a.filter((x) => x.categoryId === categoryId));
      })
      .catch((error) => active && setLoadError(errorMessage(error, "Could not load this category")));
    return () => {
      active = false;
    };
  }, [categoryId]);

  const category = categories.find((c) => c.id === categoryId);

  if (loadError || (articles && !category)) {
    return (
      <div className="space-y-4">
        <BackLink />
        <EmptyState
          icon={TbAlertCircle}
          title={loadError ? "Could not load this category" : "Category not found"}
          text={loadError || "It may have been removed."}
        />
      </div>
    );
  }
  if (!articles || !category) return <Loading label="Loading category…" />;

  return (
    <div className="space-y-6">
      <BackLink />
      <PageHeader eyebrow="Learning category" title={category.nameEn} description={`${category.nameRw} · ${category.slug}`}>
        <Button onClick={() => setAdding(true)}><TbPlus size={16} /> Add article</Button>
      </PageHeader>

      <section className="card p-0">
        <div className="border-b border-line p-4">
          <h2 className="m-0 text-[1.05rem] font-bold">Articles · {articles.length}</h2>
        </div>
        {articles.length === 0 ? (
          <EmptyState icon={TbBook} title="No articles yet" text="Add the first article in this category." />
        ) : (
          <ul className="m-0 list-none divide-y divide-line p-0">
            {articles.map((a) => {
              const format = FORMAT[a.format] ?? FORMAT.ARTICLE;
              return (
                <li key={a.id}>
                  <Link
                    to={`/admin/learning/${categoryId}/${a.id}`}
                    className="group flex items-center gap-3.5 px-4 py-3.5 text-fg no-underline transition hover:bg-surface-2"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                      <format.icon size={19} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{a.title}</span>
                      <span className="mt-1 flex flex-wrap gap-1.5">
                        <span className="tag">{format.label}</span>
                        <span className="tag">{LANGUAGE_LABELS[a.language] ?? a.language}</span>
                        {a.isLowData && <span className="tag tag-teal">Low-data</span>}
                        {a.published === false && <span className="tag tag-sun"><TbEyeOff size={12} /> Not published</span>}
                      </span>
                    </span>
                    <span className="hidden shrink-0 items-center gap-1.5 text-[0.85rem] text-muted sm:inline-flex" title="People learning this article">
                      <TbUsers size={16} /> {a.learnerCount ?? 0}
                    </span>
                    <TbChevronRight size={18} className="shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-brand" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Dialog open={adding} onClose={() => setAdding(false)} title={`Add article to ${category.nameEn}`} size="lg">
        <ArticleForm
          categories={categories}
          categoryId={categoryId}
          onCancel={() => setAdding(false)}
          onSaved={(article) => {
            if (article.categoryId === categoryId) setArticles((list) => [article, ...(list ?? [])]);
            setAdding(false);
          }}
        />
      </Dialog>
    </div>
  );
}

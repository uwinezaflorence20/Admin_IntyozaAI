import { useEffect, useState } from "react";
import { Link } from "react-router";
import { TbBook, TbCategory, TbChevronRight, TbPlus, TbUsers } from "react-icons/tb";
import { getAdminArticles, getCategories } from "@/lib/api";
import { Dialog, EmptyState, PageHeader, Loading, StatCard } from "@/components/admin/parts";
import { ArticleForm, CategoryForm } from "@/components/admin/learning";
import { Button } from "@/components/ui/Button";
import { errorMessage } from "@/lib/utils";
import type { Article, Category } from "@/types";

/** Learning home: categories as cards, each opening its articles. Myths have their own page. */
export default function LearningPage() {
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadError, setLoadError] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [addingArticle, setAddingArticle] = useState(false);

  useEffect(() => {
    Promise.all([getAdminArticles(), getCategories()])
      .then(([a, c]) => {
        setArticles(a);
        setCategories([...c].sort((x, y) => x.nameEn.localeCompare(y.nameEn)));
      })
      .catch((error) => setLoadError(errorMessage(error, "Could not load learning content")));
  }, []);

  if (loadError) return <EmptyState icon={TbBook} title="Could not load learning content" text={loadError} />;
  if (!articles) return <Loading label="Loading learning content…" />;

  const countIn = (categoryId: string) => articles.filter((a) => a.categoryId === categoryId).length;
  const drafts = articles.filter((a) => a.published === false).length;
  const learners = articles.reduce((sum, a) => sum + (a.learnerCount ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Learn"
        title="Learning content"
        description="Open a category to see its articles, read them, and see who is learning them."
      >
        <Button variant="outline" disabled={categories.length === 0} onClick={() => setAddingArticle(true)}>
          <TbPlus size={16} /> Add article
        </Button>
        <Button onClick={() => setAddingCategory(true)}><TbPlus size={16} /> Add category</Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={TbCategory} tone="teal" label="Categories" value={categories.length} />
        <StatCard icon={TbBook} tone="lavender" label="Articles" value={articles.length} hint={drafts ? `${drafts} not published` : "All published"} />
        <StatCard icon={TbUsers} tone="peach" label="Learners" value={learners} hint="Across all articles" />
      </div>

      <section>
        <h2 className="mb-3 text-[1.05rem] font-bold">Categories</h2>
        {categories.length === 0 ? (
          <div className="card">
            <EmptyState icon={TbCategory} title="No categories yet" text="Add the first category to start grouping lessons." />
          </div>
        ) : (
          <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3">
            {categories.map((c) => {
              const count = countIn(c.id);
              return (
                <li key={c.id}>
                  <Link
                    to={`/admin/learning/${c.id}`}
                    className="card group flex h-full items-start gap-3.5 text-fg no-underline transition hover:-translate-y-0.5 hover:border-brand hover:shadow-card"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-lavender text-brand">
                      <TbCategory size={22} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{c.nameEn}</span>
                      <span className="block truncate text-[0.82rem] text-muted">{c.nameRw}</span>
                      <span className={`mt-2 inline-flex text-[0.82rem] font-medium ${count ? "text-brand" : "text-muted"}`}>
                        {count ? `${count} article${count === 1 ? "" : "s"}` : "No articles yet"}
                      </span>
                    </span>
                    <TbChevronRight size={18} className="mt-1 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-brand" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Dialog open={addingCategory} onClose={() => setAddingCategory(false)} title="Add category">
        <CategoryForm
          existing={categories}
          onCancel={() => setAddingCategory(false)}
          onCreated={(category) => {
            setCategories((current) => [...current, category].sort((a, b) => a.nameEn.localeCompare(b.nameEn)));
            setAddingCategory(false);
          }}
        />
      </Dialog>

      <Dialog open={addingArticle} onClose={() => setAddingArticle(false)} title="Add article" size="lg">
        <ArticleForm
          categories={categories}
          onCancel={() => setAddingArticle(false)}
          onSaved={(article) => {
            setArticles((current) => [article, ...(current ?? [])]);
            setAddingArticle(false);
          }}
        />
      </Dialog>
    </div>
  );
}

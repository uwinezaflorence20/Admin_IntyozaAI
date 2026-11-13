import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TbBook, TbCategory, TbVideo, TbHeadphones, TbListCheck, TbHelpCircle, TbFileText, TbPlus } from "react-icons/tb";
import { toast } from "sonner";
import { createArticle, createCategory, createMyth, getArticles, getCategories, getMyths } from "@/lib/api";
import type { IconType } from "react-icons";
import { Dialog, EmptyState, PageHeader, Panel, Loading, StatCard } from "@/components/admin/parts";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { errorMessage } from "@/lib/utils";
import type { Article, ArticleFormat, Category, Myth, NewArticle, NewCategory, NewMyth } from "@/types";

const FORMAT: Record<ArticleFormat, { icon: IconType; label: string }> = {
  ARTICLE: { icon: TbFileText, label: "Article" },
  VIDEO: { icon: TbVideo, label: "Video" },
  AUDIO: { icon: TbHeadphones, label: "Audio" },
  QUIZ: { icon: TbListCheck, label: "Quiz" },
};

const categorySchema = z.object({
  nameEn: z.string().trim().min(1, "English name is required"),
  nameRw: z.string().trim().min(1, "Kinyarwanda name is required"),
  slug: z.string().trim().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens"),
});

interface CategoryFormProps {
  existing: Category[];
  onCancel: () => void;
  onCreated: (category: Category) => void;
}

function CategoryForm({ existing, onCancel, onCreated }: CategoryFormProps) {
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<NewCategory>({
    resolver: zodResolver(categorySchema),
  });

  const onSubmit = async (values: NewCategory) => {
    // The backend answers a duplicate slug with a generic 500, so catch it here first.
    if (existing.some((c) => c.slug === values.slug)) {
      setError("slug", { message: "Another category already uses this slug" });
      return;
    }
    try {
      onCreated(await createCategory(values));
      toast.success("Category created");
    } catch (error) {
      toast.error(errorMessage(error, "Could not create the category"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label htmlFor="nameEn" className="label">Name in English</label>
        <Input id="nameEn" {...register("nameEn")} aria-invalid={!!errors.nameEn} />
        {errors.nameEn && <p className="field-error">{errors.nameEn.message}</p>}
      </div>
      <div>
        <label htmlFor="nameRw" className="label">Name in Kinyarwanda</label>
        <Input id="nameRw" {...register("nameRw")} aria-invalid={!!errors.nameRw} />
        {errors.nameRw && <p className="field-error">{errors.nameRw.message}</p>}
      </div>
      <div>
        <label htmlFor="slug" className="label">Slug</label>
        <Input id="slug" placeholder="periods-puberty" {...register("slug")} aria-invalid={!!errors.slug} />
        {errors.slug && <p className="field-error">{errors.slug.message}</p>}
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isSubmitting}>Create category</Button>
      </div>
    </form>
  );
}

const articleSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  categoryId: z.string().min(1, "Choose a category"),
  language: z.enum(["EN", "RW"]),
  format: z.enum(["ARTICLE", "VIDEO", "AUDIO", "QUIZ"]),
  content: z.string().trim().min(1, "Content is required"),
  isLowData: z.boolean(),
});

interface ArticleFormProps {
  categories: Category[];
  onCancel: () => void;
  onCreated: (article: Article) => void;
}

function ArticleForm({ categories, onCancel, onCreated }: ArticleFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<NewArticle>({
    resolver: zodResolver(articleSchema),
    defaultValues: { title: "", categoryId: "", language: "EN", format: "ARTICLE", content: "", isLowData: false },
  });

  const onSubmit = async (values: NewArticle) => {
    try {
      const created = await createArticle(values);
      // Fill in anything the response leaves out so the new row shows correctly.
      onCreated({ ...values, ...created, id: created?.id ?? crypto.randomUUID() });
      toast.success("Article published");
    } catch (error) {
      toast.error(errorMessage(error, "Could not create the article"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label htmlFor="title" className="label">Title</label>
        <Input id="title" {...register("title")} aria-invalid={!!errors.title} />
        {errors.title && <p className="field-error">{errors.title.message}</p>}
      </div>
      <div>
        <label htmlFor="categoryId" className="label">Category</label>
        <select id="categoryId" className="select" {...register("categoryId")} aria-invalid={!!errors.categoryId}>
          <option value="">Choose a category</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
        </select>
        {errors.categoryId && <p className="field-error">{errors.categoryId.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="language" className="label">Language</label>
          <select id="language" className="select" {...register("language")}>
            <option value="EN">English</option>
            <option value="RW">Kinyarwanda</option>
          </select>
        </div>
        <div>
          <label htmlFor="format" className="label">Format</label>
          <select id="format" className="select" {...register("format")}>
            {(Object.keys(FORMAT) as ArticleFormat[]).map((f) => <option key={f} value={f}>{FORMAT[f].label}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="content" className="label">Content</label>
        <textarea id="content" rows={8} className="input h-auto py-2.5" {...register("content")} aria-invalid={!!errors.content} />
        {errors.content && <p className="field-error">{errors.content.message}</p>}
      </div>
      <label className="flex items-center gap-2 text-[0.9rem] font-medium">
        <input type="checkbox" className="size-4" {...register("isLowData")} /> Low-data friendly
      </label>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isSubmitting}>Publish article</Button>
      </div>
    </form>
  );
}

const mythSchema = z.object({
  language: z.enum(["EN", "RW"]),
  mythText: z.string().trim().min(1, "Write the myth"),
  factText: z.string().trim().min(1, "Write the fact"),
  sources: z.string(),
});

type MythValues = z.infer<typeof mythSchema>;

function MythForm({ onCancel, onCreated }: { onCancel: () => void; onCreated: (myth: Myth) => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<MythValues>({
    resolver: zodResolver(mythSchema),
    defaultValues: { language: "EN", mythText: "", factText: "", sources: "" },
  });

  const onSubmit = async ({ sources, ...rest }: MythValues) => {
    const myth: NewMyth = { ...rest, sources: sources.split("\n").map((s) => s.trim()).filter(Boolean) };
    try {
      const created = await createMyth(myth);
      onCreated({ ...myth, ...created, id: created?.id ?? crypto.randomUUID() });
      toast.success("Myth check published");
    } catch (error) {
      toast.error(errorMessage(error, "Could not create the myth check"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label htmlFor="mythLanguage" className="label">Language</label>
        <select id="mythLanguage" className="select" {...register("language")}>
          <option value="EN">English</option>
          <option value="RW">Kinyarwanda</option>
        </select>
      </div>
      <div>
        <label htmlFor="mythText" className="label">Myth</label>
        <textarea id="mythText" rows={2} className="input h-auto py-2.5" {...register("mythText")} aria-invalid={!!errors.mythText} />
        {errors.mythText && <p className="field-error">{errors.mythText.message}</p>}
      </div>
      <div>
        <label htmlFor="factText" className="label">Fact</label>
        <textarea id="factText" rows={3} className="input h-auto py-2.5" {...register("factText")} aria-invalid={!!errors.factText} />
        {errors.factText && <p className="field-error">{errors.factText.message}</p>}
      </div>
      <div>
        <label htmlFor="sources" className="label">Sources (optional, one per line)</label>
        <textarea id="sources" rows={2} className="input h-auto py-2.5" placeholder="WHO, 2023" {...register("sources")} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isSubmitting}>Publish myth check</Button>
      </div>
    </form>
  );
}

export default function LearningPage() {
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [myths, setMyths] = useState<Myth[]>([]);
  const [loadError, setLoadError] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [addingArticle, setAddingArticle] = useState(false);
  const [addingMyth, setAddingMyth] = useState(false);

  useEffect(() => {
    Promise.all([getArticles(), getMyths(), getCategories()])
      .then(([a, m, c]) => {
        setArticles(a);
        setMyths(m);
        setCategories(c);
      })
      .catch((error) => setLoadError(errorMessage(error, "Could not load learning content")));
  }, []);

  if (loadError) return <EmptyState icon={TbBook} title="Could not load learning content" text={loadError} />;
  if (!articles) return <Loading label="Loading learning content…" />;

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.nameEn ?? "—";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Learn & Myth Buster"
        title="Learning content"
        description="Articles, quizzes and myth checks young people see in the Learn and Myths sections."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={TbBook} tone="lavender" label="Articles" value={articles.length} />
        <StatCard icon={TbCategory} tone="teal" label="Categories" value={categories.length} />
        <StatCard icon={TbHelpCircle} tone="peach" label="Myth checks" value={myths.length} />
      </div>

      <Panel
        title="Categories"
        description="Topics that group lessons in the Learn section"
        action={<Button size="sm" onClick={() => setAddingCategory(true)}><TbPlus size={16} /> Add category</Button>}
      >
        {categories.length === 0 ? (
          <EmptyState icon={TbCategory} title="No categories yet" text="Add the first category to start grouping lessons." />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>English</th>
                  <th>Kinyarwanda</th>
                  <th>Slug</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td className="font-semibold">{c.nameEn}</td>
                    <td>{c.nameRw}</td>
                    <td className="text-muted">{c.slug}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

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

      <section className="card p-0">
        <div className="flex items-center justify-between gap-3 border-b border-line p-4">
          <h2 className="m-0 text-[1.05rem] font-bold">Articles</h2>
          <Button
            size="sm"
            disabled={categories.length === 0}
            title={categories.length === 0 ? "Add a category first" : undefined}
            onClick={() => setAddingArticle(true)}
          >
            <TbPlus size={16} /> Add article
          </Button>
        </div>
        {articles.length === 0 ? (
          <EmptyState icon={TbBook} title="No articles yet" text="Published learning articles will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Format</th>
                  <th>Language</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((a) => {
                  const format = FORMAT[a.format] ?? FORMAT.ARTICLE;
                  const Icon = format.icon;
                  return (
                    <tr key={a.id}>
                      <td>
                        <p className="m-0 font-semibold">{a.title}</p>
                        {a.isLowData && <span className="tag tag-teal mt-1">Low-data</span>}
                      </td>
                      <td className="whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5"><Icon size={16} className="text-brand" /> {format.label}</span>
                      </td>
                      <td><span className="tag">{a.language}</span></td>
                      <td className="text-muted">{categoryName(a.categoryId)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Dialog open={addingArticle} onClose={() => setAddingArticle(false)} title="Add article" size="lg">
        <ArticleForm
          categories={categories}
          onCancel={() => setAddingArticle(false)}
          onCreated={(article) => {
            setArticles((current) => [article, ...(current ?? [])]);
            setAddingArticle(false);
          }}
        />
      </Dialog>

      <Dialog open={addingMyth} onClose={() => setAddingMyth(false)} title="Add myth check" size="lg">
        <MythForm
          onCancel={() => setAddingMyth(false)}
          onCreated={(myth) => {
            setMyths((current) => [myth, ...current]);
            setAddingMyth(false);
          }}
        />
      </Dialog>

      <Panel
        title="Myth Buster"
        description="Myth checks young people see in the Myths section"
        action={<Button size="sm" onClick={() => setAddingMyth(true)}><TbPlus size={16} /> Add myth check</Button>}
      >
        {myths.length === 0 ? (
          <EmptyState icon={TbHelpCircle} title="No myth checks yet" text="Myth/fact entries will appear here." />
        ) : (
          <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-2">
            {myths.map((m) => (
              <li key={m.id} className="rounded-[14px] bg-peach p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="tag tag-accent">Myth</span>
                  <span className="tag">{m.language}</span>
                </div>
                <p className="m-0 font-medium">“{m.mythText}”</p>
                <p className="m-0 mt-2 text-[0.88rem] text-peach-text"><strong>Fact:</strong> {m.factText}</p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

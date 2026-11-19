// Forms shared by the Learning pages.
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createArticle, createCategory, createMyth } from "@/lib/api";
import { FORMAT } from "@/lib/learning";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { errorMessage } from "@/lib/utils";
import type { Article, ArticleFormat, Category, Myth, NewArticle, NewCategory, NewMyth } from "@/types";

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

export function CategoryForm({ existing, onCancel, onCreated }: CategoryFormProps) {
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
  /** Category picked in advance, e.g. when adding from a category page. */
  categoryId?: string;
  onCancel: () => void;
  onCreated: (article: Article) => void;
}

export function ArticleForm({ categories, categoryId = "", onCancel, onCreated }: ArticleFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<NewArticle>({
    resolver: zodResolver(articleSchema),
    defaultValues: { title: "", categoryId, language: "EN", format: "ARTICLE", content: "", isLowData: false },
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

export function MythForm({ onCancel, onCreated }: { onCancel: () => void; onCreated: (myth: Myth) => void }) {
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


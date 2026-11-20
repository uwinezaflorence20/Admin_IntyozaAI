// Forms shared by the Learning and Myths pages.
import { useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { TbPhoto, TbPhotoUp, TbTrash, TbVideo } from "react-icons/tb";
import { answerMythSubmission, createArticle, createCategory, createMyth, updateArticle } from "@/lib/api";
import { FORMAT, VERDICT } from "@/lib/learning";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { errorMessage } from "@/lib/utils";
import type { Article, ArticleFormat, Category, Myth, MythSubmission, MythVerdict, NewArticle, NewCategory, NewMyth } from "@/types";

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
  published: z.boolean(),
});

const MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm", "video/quicktime"];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

/** Checks a picked media file against what the backend accepts; returns a message when it is not allowed. */
function mediaProblem(file: File) {
  if (!MEDIA_TYPES.includes(file.type)) return "Choose a JPEG, PNG, WebP or GIF image, or an MP4, WebM or MOV video.";
  const isVideo = file.type.startsWith("video/");
  if (file.size > (isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES)) return isVideo ? "Videos can be up to 100 MB." : "Images can be up to 10 MB.";
  return "";
}

interface ArticleFormProps {
  categories: Category[];
  /** Category picked in advance, e.g. when adding from a category page. */
  categoryId?: string;
  /** The article being edited; leave out to create a new one. */
  article?: Article;
  onCancel: () => void;
  onSaved: (article: Article) => void;
}

export function ArticleForm({ categories, categoryId = "", article, onCancel, onSaved }: ArticleFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<NewArticle>({
    resolver: zodResolver(articleSchema),
    defaultValues: article
      ? {
          title: article.title,
          categoryId: article.categoryId,
          language: article.language,
          format: article.format,
          content: article.content ?? "",
          isLowData: article.isLowData,
          published: article.published ?? true,
        }
      : { title: "", categoryId, language: "EN", format: "ARTICLE", content: "", isLowData: false, published: true },
  });
  const [media, setMedia] = useState<File | null>(null);
  const [mediaError, setMediaError] = useState("");
  const [removeMedia, setRemoveMedia] = useState(false);
  const currentMedia = article?.mediaUrl && !removeMedia ? article.mediaUrl : null;

  const pickMedia = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const problem = mediaProblem(file);
    setMediaError(problem);
    if (!problem) setMedia(file);
  };

  const onSubmit = async (values: NewArticle) => {
    try {
      const saved = article
        ? await updateArticle(article.id, values, media, removeMedia && !media)
        : await createArticle(values, media);
      // Fill in anything the response leaves out so the page shows the saved values.
      onSaved({ ...article, ...values, ...saved, id: saved?.id ?? article?.id ?? crypto.randomUUID() });
      toast.success(article ? "Article updated" : values.published ? "Article published" : "Article saved as draft");
    } catch (error) {
      toast.error(errorMessage(error, article ? "Could not update the article" : "Could not create the article"));
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
      <div>
        <span className="label">Image or video (optional)</span>
        {media || currentMedia ? (
          <div className="flex items-center gap-3 rounded-[14px] border border-line p-2">
            {media ? (
              <span className="grid size-14 shrink-0 place-items-center rounded-[10px] bg-surface-2 text-brand">
                {media.type.startsWith("video/") ? <TbVideo size={22} /> : <TbPhoto size={22} />}
              </span>
            ) : article?.mediaType === "VIDEO" ? (
              <video src={currentMedia!} className="size-14 shrink-0 rounded-[10px] object-cover" muted />
            ) : (
              <img src={currentMedia!} alt="" className="size-14 shrink-0 rounded-[10px] object-cover" />
            )}
            <span className="min-w-0 flex-1 truncate text-[0.88rem]">{media ? media.name : "Current media"}</span>
            <label className="btn btn-ghost btn-sm cursor-pointer focus-within:ring-2 focus-within:ring-brand">
              <input type="file" accept={MEDIA_TYPES.join(",")} className="sr-only" onChange={pickMedia} />
              Change
            </label>
            <button
              type="button"
              className="icon-btn text-danger hover:bg-danger-soft"
              aria-label="Remove image or video"
              onClick={() => {
                if (media) setMedia(null);
                else setRemoveMedia(true);
              }}
            >
              <TbTrash size={17} />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center gap-1 rounded-[14px] border border-dashed border-line px-4 py-5 text-center transition hover:border-brand hover:bg-surface-2 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand-soft">
            <input type="file" accept={MEDIA_TYPES.join(",")} className="sr-only" onChange={pickMedia} />
            <TbPhotoUp size={24} className="text-brand" />
            <span className="text-[0.9rem] font-semibold">Upload an image or video</span>
            <span className="text-[0.8rem] text-muted">Images up to 10 MB, videos up to 100 MB</span>
          </label>
        )}
        {mediaError && <p className="field-error" role="alert">{mediaError}</p>}
      </div>
      <div className="flex flex-wrap gap-5">
        <label className="flex items-center gap-2 text-[0.9rem] font-medium">
          <input type="checkbox" className="size-4" {...register("isLowData")} /> Low-data friendly
        </label>
        <label className="flex items-center gap-2 text-[0.9rem] font-medium">
          <input type="checkbox" className="size-4" {...register("published")} /> Published (visible in the app)
        </label>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isSubmitting}>{article ? "Save changes" : "Save article"}</Button>
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


const answerSchema = z.object({
  verdict: z.enum(["TRUE", "FALSE", "PARTLY_TRUE"]),
  response: z.string().trim().min(1, "Write the answer the person will see").max(5000, "Keep the answer under 5000 characters"),
});

type AnswerValues = z.infer<typeof answerSchema>;

interface MythAnswerFormProps {
  submission: MythSubmission;
  onCancel: () => void;
  onAnswered: (submission: MythSubmission) => void;
}

/** Answers a myth a user sent in: whether it is true, and why. Also used to change an earlier answer. */
export function MythAnswerForm({ submission, onCancel, onAnswered }: MythAnswerFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AnswerValues>({
    resolver: zodResolver(answerSchema),
    defaultValues: { verdict: submission.verdict ?? "FALSE", response: submission.response ?? "" },
  });

  const onSubmit = async (values: AnswerValues) => {
    try {
      const saved = await answerMythSubmission(submission.id, values);
      // The response may leave fields out, so the values just sent fill the gaps and the status is set last.
      onAnswered({ ...submission, ...values, answeredAt: new Date().toISOString(), ...saved, status: "ANSWERED" });
      toast.success("Answer sent");
    } catch (error) {
      toast.error(errorMessage(error, "Could not send the answer"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <p className="m-0 rounded-[14px] bg-surface-2 px-4 py-3 text-[0.95rem]">“{submission.mythText}”</p>
      <fieldset className="m-0 border-0 p-0">
        <legend className="label">Is it true?</legend>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(VERDICT) as MythVerdict[]).map((v) => (
            <label key={v} className="chip min-h-9 cursor-pointer has-[:checked]:border-brand has-[:checked]:bg-brand-soft has-[:checked]:text-brand">
              <input type="radio" value={v} className="sr-only" {...register("verdict")} />
              {VERDICT[v].label}
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="response" className="label">Answer</label>
        <textarea
          id="response"
          rows={5}
          className="input h-auto py-2.5"
          placeholder="Explain the facts in simple words. The person who sent the myth will see this."
          {...register("response")}
          aria-invalid={!!errors.response}
        />
        {errors.response && <p className="field-error">{errors.response.message}</p>}
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isSubmitting}>{submission.status === "ANSWERED" ? "Update answer" : "Send answer"}</Button>
      </div>
    </form>
  );
}

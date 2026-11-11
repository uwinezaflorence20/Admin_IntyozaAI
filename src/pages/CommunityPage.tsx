import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  TbAlertCircle, TbChevronDown, TbCircleCheck, TbClock, TbEyeOff, TbFlag, TbLoader2, TbMessages, TbPhotoUp, TbPlus, TbSend, TbTrash, TbUsersGroup,
} from "react-icons/tb";
import { toast } from "sonner";
import { createComment, createPost, createSpace, deleteSpace, getComments, getReports, getSpacePosts, getSpaces, hidePost, resolveReport } from "@/lib/api";
import { Dialog, EmptyState, Loading, PageHeader, Panel } from "@/components/admin/parts";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { imageFileToDataUrl } from "@/lib/image";
import { cn, errorMessage, timeAgo } from "@/lib/utils";
import type { Author, CommunityReport, CommunitySpace, PostComment, SpacePost } from "@/types";

const spaceSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().min(1, "Description is required"),
});

type SpaceValues = z.infer<typeof spaceSchema>;

function SpaceForm({ onCancel, onCreated }: { onCancel: () => void; onCreated: (space: CommunitySpace) => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SpaceValues>({
    resolver: zodResolver(spaceSchema),
    defaultValues: { name: "", description: "" },
  });
  const [image, setImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");
  const [isReadingImage, setIsReadingImage] = useState(false);

  const pickImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // Lets the same file be picked again after removing it.
    if (!file) return;
    setImageError("");
    setIsReadingImage(true);
    try {
      setImage(await imageFileToDataUrl(file));
    } catch (error) {
      setImageError(errorMessage(error, "Could not use this image"));
    } finally {
      setIsReadingImage(false);
    }
  };

  const onSubmit = async ({ name, description }: SpaceValues) => {
    try {
      onCreated(await createSpace({ name, description, imageUrl: image ?? undefined }));
      toast.success("Space created");
    } catch (error) {
      toast.error(errorMessage(error, "Could not create the space"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label htmlFor="name" className="label">Name</label>
        <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
        {errors.name && <p className="field-error">{errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor="description" className="label">Description</label>
        <textarea id="description" rows={3} className="input h-auto py-2.5" {...register("description")} aria-invalid={!!errors.description} />
        {errors.description && <p className="field-error">{errors.description.message}</p>}
      </div>
      <div>
        <span className="label">Image (optional)</span>
        {image ? (
          <div className="flex items-center gap-3 rounded-[14px] border border-line p-2">
            <img src={image} alt="Selected space" className="size-16 shrink-0 rounded-[10px] object-cover" />
            <label className="btn btn-ghost btn-sm cursor-pointer focus-within:ring-2 focus-within:ring-brand">
              <input type="file" accept="image/*" className="sr-only" onChange={pickImage} />
              Change
            </label>
            <button type="button" className="icon-btn ml-auto text-danger hover:bg-danger-soft" aria-label="Remove image" onClick={() => setImage(null)}>
              <TbTrash size={17} />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center gap-1 rounded-[14px] border border-dashed border-line px-4 py-5 text-center transition hover:border-brand hover:bg-surface-2 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand-soft">
            <input type="file" accept="image/*" className="sr-only" onChange={pickImage} disabled={isReadingImage} />
            {isReadingImage ? <TbLoader2 size={24} className="animate-spin text-brand" /> : <TbPhotoUp size={24} className="text-brand" />}
            <span className="text-[0.9rem] font-semibold">{isReadingImage ? "Preparing image…" : "Upload an image"}</span>
            <span className="text-[0.8rem] text-muted">From your computer, up to 10 MB</span>
          </label>
        )}
        {imageError && <p className="field-error" role="alert">{imageError}</p>}
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isSubmitting} disabled={isReadingImage}>Create space</Button>
      </div>
    </form>
  );
}

const authorName = (author: Author) => author.alias || "Anonymous";

interface ComposerProps {
  id: string;
  label: string;
  placeholder: string;
  submitLabel: string;
  onSubmit: (content: string) => Promise<void>;
}

/** Text box for writing a post or a reply as the signed-in admin. */
function Composer({ id, label, placeholder, submitLabel, onSubmit }: ComposerProps) {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const content = text.trim();

  const send = async (event: FormEvent) => {
    event.preventDefault();
    if (!content) return;
    setIsSending(true);
    try {
      await onSubmit(content);
      setText("");
    } catch (error) {
      toast.error(errorMessage(error, "Could not publish this"));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={send} className="space-y-2">
      <label htmlFor={id} className="label">{label}</label>
      <textarea
        id={id}
        rows={2}
        maxLength={2000}
        className="input h-auto py-2.5"
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex items-center justify-between gap-3">
        <span className="text-[0.8rem] text-muted">Published straight away under your admin account.</span>
        <Button type="submit" size="sm" isLoading={isSending} disabled={!content}>
          <TbSend size={15} /> {submitLabel}
        </Button>
      </div>
    </form>
  );
}

interface PostItemProps {
  post: SpacePost;
  onHide: () => void;
  onCommentAdded: () => void;
}

function PostItem({ post, onHide, onCommentAdded }: PostItemProps) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<PostComment[] | null>(null);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && !comments) {
      getComments(post.id)
        .then(setComments)
        .catch((error) => {
          setComments([]);
          toast.error(errorMessage(error, "Could not load the comments"));
        });
    }
  };

  return (
    <li className="p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-[0.82rem] text-muted">
        <strong className="text-fg">{authorName(post.user)}</strong>
        <span className="inline-flex items-center gap-1"><TbClock size={13} /> {timeAgo(post.createdAt)}</span>
      </div>
      <p className="mb-3 rounded-[14px] bg-surface-2 px-4 py-3 text-[0.95rem] whitespace-pre-line">{post.content}</p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-4 text-[0.82rem] text-muted">
          <button type="button" className="btn btn-ghost btn-sm" aria-expanded={open} onClick={toggle}>
            <TbMessages size={15} /> {post._count.comments} comment{post._count.comments === 1 ? "" : "s"}
            <TbChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
          </button>
          <span className="inline-flex items-center gap-1" title="Reports"><TbFlag size={14} /> {post._count.reports}</span>
        </span>
        <button type="button" className="btn btn-danger-outline btn-sm" onClick={onHide}>
          <TbEyeOff size={16} /> Hide post
        </button>
      </div>

      {open && (
        <div className="mt-3 space-y-3 border-l-2 border-line pl-4">
          {!comments ? (
            <Loading label="Loading comments…" />
          ) : comments.length === 0 ? (
            <p className="m-0 text-[0.88rem] text-muted">No comments yet.</p>
          ) : (
            <ul className="m-0 list-none space-y-2.5 p-0">
              {comments.map((comment) => (
                <li key={comment.id}>
                  <p className="m-0 flex flex-wrap items-center gap-2 text-[0.8rem] text-muted">
                    <strong className="text-fg">{authorName(comment.user)}</strong> {timeAgo(comment.createdAt)}
                  </p>
                  <p className="m-0 mt-0.5 text-[0.92rem] whitespace-pre-line">{comment.content}</p>
                </li>
              ))}
            </ul>
          )}
          <Composer
            id={`reply-${post.id}`}
            label="Reply"
            placeholder="Write a reply"
            submitLabel="Reply"
            onSubmit={async (content) => {
              const comment = await createComment(post.id, content);
              setComments((list) => [...(list ?? []), comment]);
              onCommentAdded();
              toast.success("Reply published");
            }}
          />
        </div>
      )}
    </li>
  );
}

export default function CommunityPage() {
  const [reports, setReports] = useState<CommunityReport[] | null>(null);
  const [spaces, setSpaces] = useState<CommunitySpace[]>([]);
  const [loadError, setLoadError] = useState("");
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [posts, setPosts] = useState<SpacePost[] | null>(null);
  const [addingSpace, setAddingSpace] = useState(false);
  const [postToHide, setPostToHide] = useState<{ id: string; content: string } | null>(null);
  const [isHiding, setIsHiding] = useState(false);
  const [spaceToDelete, setSpaceToDelete] = useState<CommunitySpace | null>(null);
  const [isDeletingSpace, setIsDeletingSpace] = useState(false);

  useEffect(() => {
    Promise.all([getReports(), getSpaces()])
      .then(([loadedReports, loadedSpaces]) => {
        setReports(loadedReports);
        setSpaces(loadedSpaces);
      })
      .catch((error) => setLoadError(errorMessage(error, "Could not load the community data")));
  }, []);

  useEffect(() => {
    if (!selectedSpaceId) return;
    let active = true;
    getSpacePosts(selectedSpaceId)
      .then((loaded) => {
        if (active) setPosts(loaded);
      })
      .catch((error) => {
        if (!active) return;
        setPosts([]);
        toast.error(errorMessage(error, "Could not load the posts"));
      });
    return () => {
      active = false;
    };
  }, [selectedSpaceId]);

  if (loadError) return <EmptyState icon={TbAlertCircle} title="Could not load the community" text={loadError} />;
  if (!reports) return <Loading label="Loading community…" />;

  const selectSpace = (id: string) => {
    if (id === selectedSpaceId) return;
    setPosts(null);
    setSelectedSpaceId(id);
  };

  const confirmHide = async () => {
    if (!postToHide) return;
    const { id } = postToHide;
    setIsHiding(true);
    try {
      await hidePost(id);
      // The backend keeps the report pending after hiding, so it stays listed and is marked as hidden.
      setReports((list) => list!.map((r) => (r.post?.id === id ? { ...r, post: { ...r.post, isHidden: true } } : r)));
      setPosts((list) => list?.filter((p) => p.id !== id) ?? null);
      setPostToHide(null);
      toast.success("Post hidden");
    } catch (error) {
      toast.error(errorMessage(error, "Could not hide the post"));
    } finally {
      setIsHiding(false);
    }
  };

  const resolve = async (reportId: string, status: "RESOLVED" | "DISMISSED") => {
    try {
      await resolveReport(reportId, status);
      setReports((list) => list!.filter((r) => r.id !== reportId));
      toast.success(status === "RESOLVED" ? "Report resolved" : "Report dismissed");
    } catch (error) {
      toast.error(errorMessage(error, "Could not update the report"));
    }
  };

  const confirmDeleteSpace = async () => {
    if (!spaceToDelete) return;
    const { id } = spaceToDelete;
    setIsDeletingSpace(true);
    try {
      await deleteSpace(id);
      setSpaces((list) => list.filter((s) => s.id !== id));
      if (selectedSpaceId === id) {
        setSelectedSpaceId(null);
        setPosts(null);
      }
      setSpaceToDelete(null);
      toast.success("Space deleted");
    } catch (error) {
      toast.error(errorMessage(error, "Could not delete the space"));
    } finally {
      setIsDeletingSpace(false);
    }
  };

  const selectedSpace = spaces.find((s) => s.id === selectedSpaceId);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Community"
        title="Moderation"
        description="Review what people report and hide posts that share personal details or harmful advice."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <section className="card p-0">
          <div className="border-b border-line p-4">
            <h2 className="m-0 text-[1.05rem] font-bold">Pending reports · {reports.length}</h2>
          </div>

          {reports.length === 0 ? (
            <EmptyState icon={TbCircleCheck} title="No pending reports" text="Nothing has been reported right now." />
          ) : (
            <ul className="m-0 list-none divide-y divide-line p-0">
              {reports.map((report) => {
                const post = report.post;
                return (
                  <li key={report.id} className="p-4">
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-[0.82rem] text-muted">
                      <span>Reported by <strong className="text-fg">{report.reporter.alias || "Anonymous"}</strong></span>
                      <span className="inline-flex items-center gap-1"><TbClock size={13} /> {timeAgo(report.createdAt)}</span>
                    </div>
                    <p className="mb-3 rounded-[14px] bg-surface-2 px-4 py-3 text-[0.95rem]">
                      {post?.content ?? report.comment?.content}
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="tag tag-accent"><TbFlag size={12} /> {post ? "Post" : "Comment"} · {report.reason}</span>
                        {post?.isHidden && <span className="tag"><TbEyeOff size={12} /> Hidden</span>}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {post && !post.isHidden && (
                          <button type="button" className="btn btn-danger-outline btn-sm" onClick={() => setPostToHide({ id: post.id, content: post.content })}>
                            <TbEyeOff size={16} /> Hide post
                          </button>
                        )}
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => resolve(report.id, "DISMISSED")}>Dismiss</button>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => resolve(report.id, "RESOLVED")}>
                          <TbCircleCheck size={15} /> Resolve
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <Panel
          title="Spaces"
          description="Select a space to see its posts"
          action={<Button size="sm" onClick={() => setAddingSpace(true)}><TbPlus size={16} /> Add</Button>}
        >
          {spaces.length === 0 ? (
            <EmptyState icon={TbUsersGroup} title="No spaces yet" text="Add the first community space." />
          ) : (
            <ul className="m-0 list-none space-y-3 p-0">
              {spaces.map((space) => (
                <li key={space.id}>
                  <button
                    type="button"
                    aria-pressed={space.id === selectedSpaceId}
                    onClick={() => selectSpace(space.id)}
                    className={cn(
                      "w-full rounded-[14px] border border-line p-3 text-left transition hover:bg-surface-2",
                      space.id === selectedSpaceId && "border-brand bg-brand-soft"
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      {space.imageUrl && <img src={space.imageUrl} alt="" className="size-9 shrink-0 rounded-full object-cover" />}
                      <span className="font-semibold">{space.name}</span>
                    </span>
                    <span className="mt-1 block text-[0.82rem] text-muted">{space.description}</span>
                    <span className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[0.82rem] text-muted">
                      <span className="inline-flex items-center gap-1"><TbMessages size={14} /> {space._count.posts}</span>
                      <span>{space.moderator ? `Moderator: ${space.moderator.alias}` : "No moderator"}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {selectedSpace && (
        <section className="card p-0">
          <div className="flex items-center justify-between gap-3 border-b border-line p-4">
            <h2 className="m-0 text-[1.05rem] font-bold">Posts in {selectedSpace.name}</h2>
            <button type="button" className="btn btn-danger-outline btn-sm" onClick={() => setSpaceToDelete(selectedSpace)}>
              <TbTrash size={15} /> Delete space
            </button>
          </div>
          <div className="border-b border-line p-4">
            <Composer
              id="new-post"
              label={`Write a post in ${selectedSpace.name}`}
              placeholder="Share a welcome, a reminder of the rules or useful information"
              submitLabel="Post"
              onSubmit={async (content) => {
                const post = await createPost(selectedSpace.id, content);
                setPosts((list) => [post, ...(list ?? [])]);
                setSpaces((list) => list.map((s) => (s.id === selectedSpace.id ? { ...s, _count: { posts: s._count.posts + 1 } } : s)));
                toast.success("Post published");
              }}
            />
          </div>
          {!posts ? (
            <Loading label="Loading posts…" />
          ) : posts.length === 0 ? (
            <EmptyState icon={TbMessages} title="No visible posts" text="This space has no posts yet." />
          ) : (
            <ul className="m-0 list-none divide-y divide-line p-0">
              {posts.map((post) => (
                <PostItem
                  key={post.id}
                  post={post}
                  onHide={() => setPostToHide({ id: post.id, content: post.content })}
                  onCommentAdded={() =>
                    setPosts((list) => list?.map((p) => (p.id === post.id ? { ...p, _count: { ...p._count, comments: p._count.comments + 1 } } : p)) ?? null)
                  }
                />
              ))}
            </ul>
          )}
        </section>
      )}

      <Dialog open={addingSpace} onClose={() => setAddingSpace(false)} title="Add space">
        <SpaceForm
          onCancel={() => setAddingSpace(false)}
          onCreated={(space) => {
            setSpaces((list) => [...list, space].sort((a, b) => a.name.localeCompare(b.name)));
            setAddingSpace(false);
          }}
        />
      </Dialog>

      <Dialog open={!!spaceToDelete} onClose={() => !isDeletingSpace && setSpaceToDelete(null)} title="Delete this space?">
        <p className="mb-4 text-[0.92rem] text-muted">
          <strong className="text-fg">{spaceToDelete?.name}</strong> and all of its posts and comments will be permanently deleted. This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" disabled={isDeletingSpace} onClick={() => setSpaceToDelete(null)}>Cancel</Button>
          <Button type="button" variant="danger" isLoading={isDeletingSpace} onClick={confirmDeleteSpace}>Delete space</Button>
        </div>
      </Dialog>

      <Dialog open={!!postToHide} onClose={() => !isHiding && setPostToHide(null)} title="Hide this post?">
        <p className="mb-2 text-[0.92rem] text-muted">It will disappear from the community feed. This console can't bring it back.</p>
        <p className="mb-4 line-clamp-3 rounded-[14px] bg-surface-2 px-3 py-2 text-[0.9rem]">{postToHide?.content}</p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" disabled={isHiding} onClick={() => setPostToHide(null)}>Cancel</Button>
          <Button type="button" variant="danger" isLoading={isHiding} onClick={confirmHide}>Hide post</Button>
        </div>
      </Dialog>
    </div>
  );
}

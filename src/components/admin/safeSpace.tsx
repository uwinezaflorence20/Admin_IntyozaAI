// Pieces shared by the Safe Space list page and the single-space page.
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TbChevronDown, TbClock, TbEyeOff, TbFlag, TbLoader2, TbMessages, TbPhotoUp, TbSend, TbTrash, TbUsersGroup } from "react-icons/tb";
import { toast } from "sonner";
import { createComment, createSpace, getComments, getSpaceUsers, getUsers, updateSpace } from "@/lib/api";
import { EmptyState, Loading } from "@/components/admin/parts";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { imageFileToDataUrl } from "@/lib/image";
import { cn, errorMessage, timeAgo } from "@/lib/utils";
import type { AdminUser, Author, CommunitySpace, PostComment, SpaceMember, SpacePost, SpaceUpdate } from "@/types";

const spaceSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().min(1, "Description is required"),
});

type SpaceValues = z.infer<typeof spaceSchema>;

interface SpaceFormProps {
  /** The space being edited; leave out to create a new one. */
  space?: CommunitySpace;
  onCancel: () => void;
  onSaved: (space: CommunitySpace) => void;
}

export function SpaceForm({ space, onCancel, onSaved }: SpaceFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SpaceValues>({
    resolver: zodResolver(spaceSchema),
    defaultValues: { name: space?.name ?? "", description: space?.description ?? "" },
  });
  const [image, setImage] = useState<string | null>(space?.imageUrl ?? null);
  const [moderatorId, setModeratorId] = useState(space?.moderator?.id ?? "");
  const [users, setUsers] = useState<AdminUser[] | null>(null);

  // Moderator choices are only needed when editing.
  useEffect(() => {
    if (!space) return;
    getUsers()
      .then((list) => setUsers([...list].sort((a, b) => (a.alias || a.email || "").localeCompare(b.alias || b.email || ""))))
      .catch((error) => {
        setUsers([]);
        toast.error(errorMessage(error, "Could not load users for the moderator list"));
      });
  }, [space]);
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
    if (!space) {
      try {
        onSaved(await createSpace({ name, description, imageUrl: image ?? undefined }));
        toast.success("Space created");
      } catch (error) {
        toast.error(errorMessage(error, "Could not create the space"));
      }
      return;
    }

    const changes: SpaceUpdate = { name, description };
    if (image && image !== space.imageUrl) changes.imageUrl = image;
    if (moderatorId && moderatorId !== space.moderator?.id) changes.moderatorId = moderatorId;
    try {
      const updated = await updateSpace(space.id, changes);
      const chosen = users?.find((u) => u.id === moderatorId);
      onSaved({
        ...space,
        ...changes,
        ...updated,
        moderator: chosen ? { id: chosen.id, alias: chosen.alias ?? "", email: chosen.email } : space.moderator,
        _count: space._count,
      });
      toast.success("Space updated");
    } catch (error) {
      toast.error(errorMessage(error, "Could not update the space"));
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
      {space && (
        <div>
          <label htmlFor="moderatorId" className="label">Moderator</label>
          <select
            id="moderatorId"
            className="select"
            value={moderatorId}
            disabled={!users}
            onChange={(e) => setModeratorId(e.target.value)}
          >
            {/* "No moderator" can only be picked while the space has none. */}
            <option value="" disabled={!!space.moderator}>{users ? "No moderator" : "Loading users…"}</option>
            {users?.map((u) => (
              <option key={u.id} value={u.id}>
                {u.alias || u.email || "Unnamed user"}{u.role !== "USER" ? ` (${u.role.toLowerCase()})` : ""}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isSubmitting} disabled={isReadingImage}>{space ? "Save changes" : "Create space"}</Button>
      </div>
    </form>
  );
}

/** Lists the users active in a space (GET /admin/community/spaces/{spaceId}/users). */
export function SpaceMembers({ spaceId }: { spaceId: string }) {
  const [members, setMembers] = useState<SpaceMember[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getSpaceUsers(spaceId)
      .then(setMembers)
      .catch((e) => setError(errorMessage(e, "Could not load the members")));
  }, [spaceId]);

  if (error) return <p className="field-error" role="alert">{error}</p>;
  if (!members) return <Loading label="Loading members…" />;
  if (members.length === 0) return <EmptyState icon={TbUsersGroup} title="No active members" text="Nobody has posted or commented here yet." />;

  return (
    <ul className="m-0 max-h-[50vh] list-none divide-y divide-line overflow-y-auto p-0">
      {members.map((m) => (
        <li key={m.id} className="flex items-center justify-between gap-3 py-2.5">
          <span className="min-w-0">
            <span className="block truncate font-semibold">{m.alias || "Anonymous"}</span>
            {m.email && <span className="block truncate text-[0.8rem] text-muted">{m.email}</span>}
          </span>
          {m.role && m.role !== "USER" && <span className="tag">{m.role.toLowerCase()}</span>}
        </li>
      ))}
    </ul>
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
export function Composer({ id, label, placeholder, submitLabel, onSubmit }: ComposerProps) {
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

export function PostItem({ post, onHide, onCommentAdded }: PostItemProps) {
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

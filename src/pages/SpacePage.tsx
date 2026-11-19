import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { TbAlertCircle, TbArrowLeft, TbMessages, TbPencil, TbShieldCheck, TbTrash, TbUsers } from "react-icons/tb";
import { toast } from "sonner";
import { createPost, deleteSpace, getSpacePosts, getSpaces, hidePost } from "@/lib/api";
import { Dialog, EmptyState, Loading } from "@/components/admin/parts";
import { Composer, PostItem, SpaceForm, SpaceMembers } from "@/components/admin/safeSpace";
import { Button } from "@/components/ui/Button";
import { errorMessage } from "@/lib/utils";
import type { CommunitySpace, SpacePost } from "@/types";

const BackLink = () => (
  <Link to="/admin/safe-space" className="btn btn-ghost btn-sm -ml-2 w-fit">
    <TbArrowLeft size={16} /> All spaces
  </Link>
);

/** One Safe Space group as a full page: its details, posts, and moderation tools. */
export default function SpacePage() {
  const { spaceId = "" } = useParams();
  const navigate = useNavigate();
  const [space, setSpace] = useState<CommunitySpace | null>(null);
  const [posts, setPosts] = useState<SpacePost[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [postToHide, setPostToHide] = useState<{ id: string; content: string } | null>(null);
  const [isHiding, setIsHiding] = useState(false);

  useEffect(() => {
    let active = true;
    // The space details come from the full list.
    Promise.all([getSpaces(), getSpacePosts(spaceId)])
      .then(([spaces, loadedPosts]) => {
        if (!active) return;
        const found = spaces.find((s) => s.id === spaceId);
        if (!found) setNotFound(true);
        setSpace(found ?? null);
        setPosts(loadedPosts);
      })
      .catch((error) => active && setLoadError(errorMessage(error, "Could not load this space")));
    return () => {
      active = false;
    };
  }, [spaceId]);

  if (notFound) {
    return (
      <div className="space-y-4">
        <BackLink />
        <EmptyState icon={TbAlertCircle} title="Space not found" text="It may have been deleted." />
      </div>
    );
  }
  if (loadError) {
    return (
      <div className="space-y-4">
        <BackLink />
        <EmptyState icon={TbAlertCircle} title="Could not load this space" text={loadError} />
      </div>
    );
  }
  if (!space || !posts) return <Loading label="Loading space…" />;

  const confirmHide = async () => {
    if (!postToHide) return;
    setIsHiding(true);
    try {
      await hidePost(postToHide.id);
      setPosts((list) => list?.filter((p) => p.id !== postToHide.id) ?? null);
      setPostToHide(null);
      toast.success("Post hidden");
    } catch (error) {
      toast.error(errorMessage(error, "Could not hide the post"));
    } finally {
      setIsHiding(false);
    }
  };

  const removeSpace = async () => {
    setIsDeleting(true);
    try {
      await deleteSpace(space.id);
      toast.success("Space deleted");
      navigate("/admin/safe-space", { replace: true });
    } catch (error) {
      toast.error(errorMessage(error, "Could not delete the space"));
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <BackLink />

      <section className="card overflow-hidden p-0">
        {space.imageUrl && <img src={space.imageUrl} alt="" className="h-44 w-full object-cover sm:h-56" />}
        <div className="flex flex-wrap items-start justify-between gap-4 p-5">
          <div className="min-w-0">
            <span className="eyebrow">Safe Space</span>
            <h1 className="m-0 font-display text-[clamp(1.5rem,2.6vw,2rem)] leading-tight font-bold">{space.name}</h1>
            <p className="mt-1.5 mb-0 max-w-[62ch] text-muted">{space.description}</p>
            <p className="mt-3 mb-0 flex flex-wrap gap-x-5 gap-y-1 text-[0.88rem] text-muted">
              <span className="inline-flex items-center gap-1.5"><TbMessages size={16} /> {posts.length} visible post{posts.length === 1 ? "" : "s"}</span>
              <span className="inline-flex items-center gap-1.5">
                <TbShieldCheck size={16} /> {space.moderator ? `Moderator: ${space.moderator.alias}` : "No moderator"}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowMembers(true)}>
              <TbUsers size={15} /> Members
            </button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>
              <TbPencil size={15} /> Edit
            </button>
            <button type="button" className="btn btn-danger-outline btn-sm" onClick={() => setConfirmDelete(true)}>
              <TbTrash size={15} /> Delete space
            </button>
          </div>
        </div>
      </section>

      <section className="card p-0">
        <div className="border-b border-line p-4">
          <Composer
            id="new-post"
            label={`Write a post in ${space.name}`}
            placeholder="Share a welcome, a reminder of the rules or useful information"
            submitLabel="Post"
            onSubmit={async (content) => {
              const post = await createPost(space.id, content);
              setPosts((list) => [post, ...(list ?? [])]);
              toast.success("Post published");
            }}
          />
        </div>
        {posts.length === 0 ? (
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

      <Dialog open={editing} onClose={() => setEditing(false)} title="Edit space">
        {editing && (
          <SpaceForm
            space={space}
            onCancel={() => setEditing(false)}
            onSaved={(saved) => {
              setSpace(saved);
              setEditing(false);
            }}
          />
        )}
      </Dialog>

      <Dialog open={showMembers} onClose={() => setShowMembers(false)} title={`Members of ${space.name}`}>
        {showMembers && <SpaceMembers spaceId={space.id} />}
        <div className="mt-4 flex justify-end">
          <Button type="button" variant="ghost" onClick={() => setShowMembers(false)}>Close</Button>
        </div>
      </Dialog>

      <Dialog open={confirmDelete} onClose={() => !isDeleting && setConfirmDelete(false)} title="Delete this space?">
        <p className="mb-4 text-[0.92rem] text-muted">
          <strong className="text-fg">{space.name}</strong> and all of its posts and comments will be permanently deleted. This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" disabled={isDeleting} onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button type="button" variant="danger" isLoading={isDeleting} onClick={removeSpace}>Delete space</Button>
        </div>
      </Dialog>

      <Dialog open={!!postToHide} onClose={() => !isHiding && setPostToHide(null)} title="Hide this post?">
        <p className="mb-2 text-[0.92rem] text-muted">It will disappear from the Safe Space feed. This console can't bring it back.</p>
        <p className="mb-4 line-clamp-3 rounded-[14px] bg-surface-2 px-3 py-2 text-[0.9rem]">{postToHide?.content}</p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" disabled={isHiding} onClick={() => setPostToHide(null)}>Cancel</Button>
          <Button type="button" variant="danger" isLoading={isHiding} onClick={confirmHide}>Hide post</Button>
        </div>
      </Dialog>
    </div>
  );
}

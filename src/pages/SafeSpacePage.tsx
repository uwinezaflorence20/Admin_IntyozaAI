import { useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router";
import { TbAlertCircle, TbChevronRight, TbCircleCheck, TbClock, TbEyeOff, TbFlag, TbMessages, TbPlus, TbUsersGroup } from "react-icons/tb";
import { toast } from "sonner";
import { getReports, getSpaces, hidePost, resolveReport } from "@/lib/api";
import { Dialog, EmptyState, Loading, PageHeader, Panel } from "@/components/admin/parts";
import { SpaceForm } from "@/components/admin/safeSpace";
import { Button } from "@/components/ui/Button";
import { errorMessage, timeAgo } from "@/lib/utils";
import type { CommunityReport, CommunitySpace } from "@/types";

export default function SafeSpacePage() {
  const [searchParams] = useSearchParams();
  const [reports, setReports] = useState<CommunityReport[] | null>(null);
  const [spaces, setSpaces] = useState<CommunitySpace[]>([]);
  const [loadError, setLoadError] = useState("");
  const [addingSpace, setAddingSpace] = useState(false);
  const [postToHide, setPostToHide] = useState<{ id: string; content: string } | null>(null);
  const [isHiding, setIsHiding] = useState(false);

  useEffect(() => {
    Promise.all([getReports(), getSpaces()])
      .then(([loadedReports, loadedSpaces]) => {
        setReports(loadedReports);
        setSpaces(loadedSpaces);
      })
      .catch((error) => setLoadError(errorMessage(error, "Could not load the Safe Space data")));
  }, []);

  // Older links pointed at ?space=<id>; each space now has its own page.
  const linkedSpace = searchParams.get("space");
  if (linkedSpace) return <Navigate to={`/admin/safe-space/${linkedSpace}`} replace />;

  if (loadError) return <EmptyState icon={TbAlertCircle} title="Could not load Safe Space" text={loadError} />;
  if (!reports) return <Loading label="Loading Safe Space…" />;

  const confirmHide = async () => {
    if (!postToHide) return;
    const { id } = postToHide;
    setIsHiding(true);
    try {
      await hidePost(id);
      // The backend keeps the report pending after hiding, so it stays listed and is marked as hidden.
      setReports((list) => list!.map((r) => (r.post?.id === id ? { ...r, post: { ...r.post, isHidden: true } } : r)));
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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Safe Space"
        title="Safe Space"
        description="Open a space to read and moderate its posts. Review what people report and hide posts that share personal details or harmful advice."
      />

      {/* Spaces are the main area; reports sit in a narrower column beside them. */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
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
          description="Open a space to see its posts"
          action={<Button size="sm" onClick={() => setAddingSpace(true)}><TbPlus size={16} /> Add</Button>}
        >
          {spaces.length === 0 ? (
            <EmptyState icon={TbUsersGroup} title="No spaces yet" text="Add the first Safe Space group." />
          ) : (
            <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2">
              {spaces.map((space) => (
                <li key={space.id}>
                  <Link
                    to={`/admin/safe-space/${space.id}`}
                    className="group flex h-full w-full flex-col rounded-[14px] border border-line p-3 text-fg no-underline transition hover:border-brand hover:bg-surface-2"
                  >
                    <span className="flex items-center gap-2.5">
                      {space.imageUrl && <img src={space.imageUrl} alt="" className="size-9 shrink-0 rounded-full object-cover" />}
                      <span className="font-semibold">{space.name}</span>
                      <TbChevronRight size={18} className="ml-auto shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-brand" />
                    </span>
                    <span className="mt-1 block text-[0.82rem] text-muted">{space.description}</span>
                    <span className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-1.5 text-[0.82rem] text-muted">
                      <span className="inline-flex items-center gap-1"><TbMessages size={14} /> {space._count.posts}</span>
                      <span>{space.moderator ? `Moderator: ${space.moderator.alias}` : "No moderator"}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Dialog open={addingSpace} onClose={() => setAddingSpace(false)} title="Add space">
        <SpaceForm
          onCancel={() => setAddingSpace(false)}
          onSaved={(space) => {
            setSpaces((list) => [...list, space].sort((a, b) => a.name.localeCompare(b.name)));
            setAddingSpace(false);
          }}
        />
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

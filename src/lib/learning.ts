import type { IconType } from "react-icons";
import { TbFileText, TbHeadphones, TbListCheck, TbVideo } from "react-icons/tb";
import type { ArticleFormat, MythVerdict } from "@/types";

/** Icon and label for each article format. */
export const FORMAT: Record<ArticleFormat, { icon: IconType; label: string }> = {
  ARTICLE: { icon: TbFileText, label: "Article" },
  VIDEO: { icon: TbVideo, label: "Video" },
  AUDIO: { icon: TbHeadphones, label: "Audio" },
  QUIZ: { icon: TbListCheck, label: "Quiz" },
};

/** Label and tag colour for each answer an admin can give to a user's myth. */
export const VERDICT: Record<MythVerdict, { label: string; tag: string }> = {
  FALSE: { label: "False", tag: "tag-danger" },
  PARTLY_TRUE: { label: "Partly true", tag: "tag-sun" },
  TRUE: { label: "True", tag: "tag-success" },
};

import type { IconType } from "react-icons";
import { TbFileText, TbHeadphones, TbListCheck, TbVideo } from "react-icons/tb";
import type { ArticleFormat } from "@/types";

/** Icon and label for each article format. */
export const FORMAT: Record<ArticleFormat, { icon: IconType; label: string }> = {
  ARTICLE: { icon: TbFileText, label: "Article" },
  VIDEO: { icon: TbVideo, label: "Video" },
  AUDIO: { icon: TbHeadphones, label: "Audio" },
  QUIZ: { icon: TbListCheck, label: "Quiz" },
};

import type { AgeBand, Language } from "@/types";

export const AGE_BAND_LABELS: Record<AgeBand, string> = {
  AGE_10_14: "10–14",
  AGE_15_19: "15–19",
  AGE_20_24: "20–24",
  AGE_25_PLUS: "25+",
  UNKNOWN: "Not shared",
};

export const LANGUAGE_LABELS: Record<Language, string> = { EN: "English", RW: "Kinyarwanda" };

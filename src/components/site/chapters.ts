import type { SiteContent } from "@/lib/content";

export const CHAPTERS = [
  { id: "idea", label: "Idea" },
  { id: "ecosystem", label: "Products" },
  { id: "services", label: "Services" },
  { id: "process", label: "Process" },
  { id: "clients", label: "Clients" },
  { id: "purpose", label: "Mission" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
] as const;

export type ChapterId = (typeof CHAPTERS)[number]["id"];

export interface ChapterProps {
  content: SiteContent;
  go: (id: ChapterId) => void;
  /** The idea a visitor typed in the hero, carried into the contact form. */
  idea: string;
  setIdea: (idea: string) => void;
}

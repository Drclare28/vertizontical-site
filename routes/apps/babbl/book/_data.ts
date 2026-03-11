export interface BabblQuote {
  id: string;
  text: string;
  context?: string;
  date: string;
  child?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  parent?: {
    name: string;
    avatar_url?: string;
  };
  media?: Array<{
    type: "image" | "video";
    url: string;
  }>;
}

export interface BookPageData {
  page_number: number;
  layout_style: string;
  quote?: BabblQuote;
}

export interface BookMetadata {
  id: string;
  family_id: string;
  title: string;
  theme: string;
  status: string;
  created_at: string;
}

export interface BookPayload {
  book: BookMetadata;
  pages: BookPageData[];
}

export type BookFormat = "mini" | "classic";

export interface Dimensions {
  widthInches: number;
  heightInches: number;
}

export interface BookTheme {
  id: string;
  name: string;
  bgColor: string;
  textColor: string;
  fontFamily: string; // Tailwind class like font-serif, font-sans
  accentColor: string;
}

export const THEMES: Record<string, BookTheme> = {
  playful_pastel: {
    id: "playful_pastel",
    name: "Playful Pastel",
    bgColor: "bg-orange-50",
    textColor: "text-orange-900",
    fontFamily: "font-sans",
    accentColor: "bg-orange-400",
  },
  classic_minimal: {
    id: "classic_minimal",
    name: "Classic Minimal",
    bgColor: "bg-white",
    textColor: "text-gray-900",
    fontFamily: "font-serif",
    accentColor: "bg-gray-800",
  },
  deep_night: {
    id: "deep_night",
    name: "Deep Night",
    bgColor: "bg-slate-900",
    textColor: "text-slate-100",
    fontFamily: "font-serif",
    accentColor: "bg-slate-500",
  },
};

export const BOOK_DIMENSIONS: Record<BookFormat, Dimensions> = {
  mini: {
    widthInches: 5.5,
    heightInches: 5.5,
  },
  classic: {
    widthInches: 8,
    heightInches: 8,
  },
};

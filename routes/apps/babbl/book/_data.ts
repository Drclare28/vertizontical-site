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

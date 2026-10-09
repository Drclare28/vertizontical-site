import { JSX } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { createClient } from "@supabase/supabase-js";
import Sortable, { SortableEvent } from "sortablejs";
import {
  BOOK_DIMENSIONS,
  BabblQuote,
  BookFormat,
  BookPageData,
} from "../routes/apps/babbl/book/_data.ts";
import { renderNotesPageHtml } from "./pageHtml.ts";
import PageRenderer from "./PageRenderer.tsx";

declare module "preact" {
  namespace JSX {
    interface IntrinsicElements {
      "ion-icon": {
        name?: string;
        class?: string;
        style?: string | Record<string, string>;
        key?: string;
        children?: JSX.Element | JSX.Element[] | string;
      };
    }
  }
}interface BookEditorProps {
  initialFormat?: BookFormat;
  initialTheme?: string;
  pages: BookPageData[];
  bookId: string;
  token: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  isPrintMode?: boolean;
  familyId?: string;
}
interface CustomSelectProps {
  value: string;
  options: { label: string; value: string; icon: string }[];
  onChange: (value: string) => void;
  icon: string;
  placeholder?: string;
  disabled?: boolean;
  openDirection?: "up" | "down";
}

const SVG_ICONS: Record<
  string,
  (props: JSX.SVGAttributes<SVGSVGElement>) => JSX.Element
> = {
  "babbl-bubble-icon": (props) => (
    <svg
      {...props}
      fill="none"
      viewBox="0 0 40 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 0C31.0457 1.5839e-05 40 6.96939 40 15.5664C40 21.7578 36.1305 25.2735 31.4756 27.4033L32.9131 30.0029C33.3859 30.8586 32.4767 31.8144 31.5986 31.3848L26.8613 29.0635C24.5828 29.7099 22.3493 30.1438 20.4814 30.4932C5.66259 33.2649 5.04334e-05 24.1633 0 15.5664C0 6.96938 4.69879 0 20 0Z"
        fill="currentColor"
      />
    </svg>
  ),
  "color-wand-outline": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
      />
    </svg>
  ),
  "color-palette-outline": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-3M9.707 3.293l3-3a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-3 3a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
      />
    </svg>
  ),
  "pencil-outline": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </svg>
  ),
  "pencil": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </svg>
  ),
  "moon-outline": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  ),
  "grid-outline": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  ),
  "book-outline": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  ),
  "book": (props) => (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  "chevron-back-outline": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M15 19l-7-7 7-7"
      />
    </svg>
  ),
  "chevron-forward-outline": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M9 5l7 7-7 7"
      />
    </svg>
  ),
  "checkmark-circle": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  "text-outline": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4 6h16M4 12h16M4 18h7"
      />
    </svg>
  ),
  "person-circle-outline": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  ),
  "reorder-two-outline": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4 8h16M4 16h16"
      />
    </svg>
  ),
  "image-outline": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  ),
  "apps-outline": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  ),
  "square-outline": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="4" y="4" width="16" height="16" rx="2" stroke-width="2" />
    </svg>
  ),
  "layout-circle": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="2" stroke-width="1.5" />
      <circle cx="12" cy="10" r="4" stroke-width="1.5" />
      <path stroke-linecap="round" stroke-width="1.5" d="M8 17h8M10 19h4" />
    </svg>
  ),
  "layout-quote-top": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="2" stroke-width="1.5" />
      <path
        stroke-linecap="round"
        stroke-width="1.5"
        d="M8 7h8M8 10h6M5 13h14v7H5z"
      />
    </svg>
  ),
  "layout-full-photo": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="2" stroke-width="1.5" />
      <rect x="6" y="10" width="12" height="4" rx="1" stroke-width="1.5" />
      <path stroke-linecap="round" stroke-width="1.5" d="M8 12h8" />
    </svg>
  ),
  "layout-full-width-top": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="2" stroke-width="1.5" />
      <path stroke-width="1.5" d="M2 13h20" />
      <path stroke-linecap="round" stroke-width="1.5" d="M8 17h8M8 19h6" />
    </svg>
  ),
  "layout-full-screen-short": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="2" stroke-width="1.5" />
      <path stroke-linecap="round" stroke-width="1.5" d="M6 19h12" />
    </svg>
  ),
  "layout-window-top": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="2" stroke-width="1.5" />
      <rect x="4" y="4" width="16" height="10" rx="1" stroke-width="1.5" />
      <path stroke-linecap="round" stroke-width="1.5" d="M8 17h8M8 19h6" />
    </svg>
  ),
  "layout-quote-only": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="2" stroke-width="1.5" />
      <path
        stroke-linecap="round"
        stroke-width="1.5"
        d="M8 9h8M8 12h10M8 15h6"
      />
    </svg>
  ),
  "close": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  "card-outline": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke-width="2" />
      <path stroke-linecap="round" stroke-width="2" d="M3 10h18" />
    </svg>
  ),
  "lock-closed-outline": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="5" y="11" width="14" height="10" rx="2" stroke-width="2" />
      <path stroke-linecap="round" stroke-width="2" d="M8 11V7a4 4 0 118 0v4" />
    </svg>
  ),
  "information-circle": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" stroke-width="2" />
      <path stroke-linecap="round" stroke-width="2" d="M12 8v4m0 4h.01" />
    </svg>
  ),
  "trash-outline": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  "add-outline": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
    </svg>
  ),
  "search-outline": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
      />
    </svg>
  ),
  "close-outline": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  "close-circle": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" stroke-width="2" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 9l-6 6M9 9l6 6" />
    </svg>
  ),
  "person-outline": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  "chatbubble-ellipses-outline": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.8l-3.9 1.2 1.2-3.9A7.7 7.7 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  ),
  "remove-outline": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
    </svg>
  ),
  "chevron-up-outline": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
    </svg>
  ),
  "chevron-down-outline": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  ),
  "cart-outline": (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
};interface BookEditorProps {
  initialFormat?: BookFormat;
  initialTheme?: string;
  pages: BookPageData[];
  bookId: string;
  token: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  isPrintMode?: boolean;
  familyId?: string;
}
interface CustomSelectProps {
  value: string;
  options: { label: string; value: string; icon: string }[];
  onChange: (value: string) => void;
  icon: string;
  placeholder?: string;
  disabled?: boolean;
  openDirection?: "up" | "down";
}

function Icon({ name, class: className, style }: {
  name: string;
  class?: string;
  style?: JSX.CSSProperties | string;
}) {
  const SvgIcon = SVG_ICONS[name];
  if (SvgIcon) {
    return (
      <div
        class={`inline-flex items-center justify-center ${className || ""}`}
        style={style}
      >
        <SvgIcon class="w-[1em] h-[1em]" />
      </div>
    );
  }

  // Fallback for missing SVG mappings
  return (
    <div
      class={`inline-flex items-center justify-center ${className || ""}`}
      style={style}
    >
      <span style="font-size: 0.8em; font-weight: bold;">?</span>
    </div>
  );
}

function CustomSelect(
  {
    value,
    options,
    onChange,
    icon,
    placeholder,
    disabled,
    openDirection = "up",
  }: CustomSelectProps,
) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    globalThis.addEventListener("mousedown", handleClickOutside);
    return () =>
      globalThis.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={containerRef} class="flex-1 relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        class={`w-full h-14 flex items-center bg-white/80 backdrop-blur-md border border-transparent shadow-sm text-gray-700 px-10 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#9B51E0] transition-all ${
          disabled
            ? "opacity-30 cursor-not-allowed"
            : "cursor-pointer hover:bg-white/90"
        }`}
      >
        <Icon
          name={selectedOption?.icon || icon}
          class="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B51E0] text-lg pointer-events-none"
        />
        <span class="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <Icon
          name={isOpen ? "chevron-up-outline" : "chevron-down-outline"}
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4"
        />
      </button>

      {isOpen && !disabled && (
        <div
          class={`absolute ${
            openDirection === "up" ? "bottom-full mb-2" : "top-full mt-2"
          } left-0 w-full bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden`}
        >
          <div class="max-h-96 overflow-y-auto py-2 custom-scrollbar">
            {options.map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                class={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                  value === opt.value
                    ? "text-[#9B51E0] bg-purple-50/50"
                    : "text-gray-700"
                }`}
              >
                <Icon name={opt.icon} class="text-[#9B51E0] text-lg" />
                <span class="font-bold text-sm">{opt.label}</span>
                {value === opt.value && (
                  <Icon
                    name="checkmark-circle"
                    class="ml-auto text-[#9B51E0]"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookEditor(
  {
    initialFormat = "mini",
    initialTheme = "babbl_theme",
    pages,
    bookId,
    token,
    supabaseUrl,
    supabaseAnonKey,
    isPrintMode: isPrintProp = false,
    familyId,
  }: BookEditorProps,
) {
  const [format, setFormat] = useState<BookFormat>(initialFormat);
  const [themeId, setThemeId] = useState(initialTheme);
  
  const isPrintMode = useMemo(() => {
    if (isPrintProp) return true;
    if (typeof globalThis.location === "undefined") return false;
    const params = new URLSearchParams(globalThis.location.search);
    return params.get("mode") === "print" || params.get("hideBleed") === "true" || params.get("orderId") !== null;
  }, [isPrintProp]);

  const orderId = useMemo(() => {
    if (typeof globalThis.location === "undefined") return null;
    const params = new URLSearchParams(globalThis.location.search);
    return params.get("orderId");
  }, []);


  const [currentPageIndex, setCurrentPageIndex] = useState(() => {
    // Priority 1: URL Parameter (for automated screenshots/print mode)
    if (typeof globalThis.location !== "undefined") {
      const params = new URLSearchParams(globalThis.location.search);
      const pageParam = params.get("page");
      if (pageParam !== null) {
        const p = parseInt(pageParam, 10);
        if (!isNaN(p)) return Math.max(0, p);
      }
    }

    // Priority 2: Session Storage
    if (typeof sessionStorage !== "undefined") {
      const saved = sessionStorage.getItem(`bookEditorPageIndex_${bookId}`);
      if (saved) return parseInt(saved, 10);
    }
    return 0;
  });

  useEffect(() => {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(
        `bookEditorPageIndex_${bookId}`,
        currentPageIndex.toString(),
      );
    }
  }, [currentPageIndex, bookId]);

  // Initialize Supabase client locally in the island to avoid server-only dependencies
  const [supabase] = useState(() => {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        console.warn("Supabase credentials missing, some features will be disabled.");
        return null;
      }
      return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: { Authorization: `Bearer ${token}` },
        },
      });
    } catch (e) {
      console.error("Failed to initialize Supabase client:", e);
      return null;
    }
  });

  // Track hydration for debugging
  useEffect(() => {
    console.log("BookEditor hydrated successfully!");
    // @ts-ignore
    window.hydrated = true;

    // Bridge logs to native app
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      originalLog(...args);
      window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'CONSOLE_LOG', data: args.map(String) }));
    };
    console.error = (...args) => {
      originalError(...args);
      window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'CONSOLE_ERROR', data: args.map(String) }));
    };
    console.warn = (...args) => {
      originalWarn(...args);
      window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'CONSOLE_WARN', data: args.map(String) }));
    };
  }, []);

  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const touchStartX = useRef(0);
  const [animating, setAnimating] = useState(false);
  const [animationClass, setAnimationClass] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isGridView, setIsGridView] = useState(false);
  const [localPages, setLocalPages] = useState<BookPageData[]>(pages);
  const [gridItemWidth, setGridItemWidth] = useState(160);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isNativeCheckoutRunning, setIsNativeCheckoutRunning] = useState(false);
  const [checkoutWarning, setCheckoutWarning] = useState<string | null>(null);
  const [checkoutQuote, setCheckoutQuote] = useState<
    {
      print: string;
      shipping: string;
      cost: string;
      price: string;
      totalPages: number;
    } | null
  >(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [shippingForm, setShippingForm] = useState({
    firstName: "",
    lastName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postcode: "",
    country: "US",
    phone: "",
  });
  const [addressError, setAddressError] = useState<string | null>(null);
  const addressSectionRef = useRef<HTMLDivElement>(null);

  const addressInputClass =
    "px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#9B51E0] focus:bg-white focus:ring-2 focus:ring-[#9B51E0]/15 transition-colors";

  const quoteCount = localPages.length > 2 ? localPages.length - 2 : 0;

  const gridContainerRef = useRef<HTMLDivElement>(null);
  const sortableRef = useRef<Sortable | null>(null);

  const coverSnapshotRef = useRef<HTMLDivElement>(null);
  const isInitialSnapshotMount = useRef(true);

  const dimensions = BOOK_DIMENSIONS[format];

  // Convert a fully-loaded, CORS-clean <img> to a data URL via canvas — no
  // network needed. Returns null if the canvas is tainted (cross-origin image
  // without CORS headers); in that case we leave the src alone and let
  // html-to-image's own fetch path try.
  const imageToDataUrl = (img: HTMLImageElement): string | null => {
    try {
      if (!img.naturalWidth || !img.naturalHeight) return null;
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(img, 0, 0);
      return canvas.toDataURL("image/png");
    } catch {
      return null;
    }
  };

  // Convert an image URL to a data URL over the network — the fallback when
  // canvas conversion fails (tainted canvas from a non-CORS cached image, or
  // an image that never decoded). The cache-busting query defeats the
  // WebView's poisoned cache entry.
  const fetchToDataUrl = async (url: string): Promise<string | null> => {
    try {
      const bust = url.includes("?") ? "&" : "?";
      const res = await fetch(`${url}${bust}cover_capture=${Date.now()}`, { mode: "cors" });
      if (!res.ok) return null;
      const blob = await res.blob();
      return await new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  const generateAndUploadCover = async () => {
    const snapshotEl = coverSnapshotRef.current;
    if (!snapshotEl) return;
    // html-to-image re-fetches every <img> over the network before capture and,
    // when a fetch fails (WebView CORS quirks, bot protection, flaky network),
    // silently embeds an EMPTY image and caches that failure — producing
    // thumbnails with missing photos. Avoid that path entirely: wait for each
    // image to load, then swap in data URLs converted via canvas (or fetched),
    // and restore the original srcs afterwards.
    const imgs = Array.from(snapshotEl.querySelectorAll("img"));
    await Promise.all(
      imgs.map((im) =>
        im.complete
          ? Promise.resolve()
          : new Promise<void>((res) => {
            im.onload = () => res();
            im.onerror = () => res();
          }),
      ),
    );

    // One full swap -> capture -> verify cycle. Returns the verified blob, or
    // null if any gate refused (the stored thumbnail is then left untouched).
    const captureVerifiedBlob = async (): Promise<Blob | null> => {
      const originals = new Map<HTMLImageElement, string>();
      const failedSrcs: string[] = [];
      try {
        for (const im of imgs) {
          if (!im.src || im.src.startsWith("data:")) continue;
          let dataUrl = imageToDataUrl(im);
          // Canvas conversion fails when the image was cached without CORS
          // headers (tainted canvas) or is not decodable. Retry over the
          // network with a cache-busting URL before giving up on this photo.
          if (!dataUrl) dataUrl = await fetchToDataUrl(im.src);
          if (dataUrl) {
            originals.set(im, im.src);
            im.src = dataUrl;
          } else {
            failedSrcs.push(im.src);
          }
        }
        // html-to-image copies pixels from the live DOM. If we swapped in data
        // URLs, force a decode pass so the canvas isn't snapshotted mid-swap
        // (on slow WebViews the swap can land between the layout and capture,
        // leaving photos as empty boxes in the blob even though the fetch
        // gates passed).
        if (originals.size > 0) {
          await Promise.all(
            Array.from(originals.keys()).map((im) => im.decode().catch(() => {})),
          );
        }
        // Hard gate: if any photo couldn't be converted to a data URL,
        // html-to-image would fall back to its network re-fetch path — the
        // exact path that silently embeds EMPTY photos in the app's WebView
        // and overwrites a good stored thumbnail with a blank one.
        if (failedSrcs.length > 0) {
          console.error(
            "Cover capture attempt refused — photos failed data-URL conversion (would render blank):",
            failedSrcs,
          );
          return null;
        }
        const { toBlob } = await import("html-to-image");
        const blob = await toBlob(snapshotEl, {
          canvasWidth: dimensions.widthInches * 96,
          canvasHeight: dimensions.heightInches * 96,
          pixelRatio: 1,
        });

        if (!blob) return null;
        // Gate: a cover that should contain photos but captured tiny is
        // blank — refuse to overwrite the stored thumbnail with it.
        if (imgs.length > 0 && blob.size < 20_000) {
          console.error(
            `Cover capture attempt refused — blob is only ${blob.size} bytes.`,
          );
          return null;
        }
        // Final gate: actually VERIFY the photos are in the capture. A silent
        // html-to-image failure (or a mid-swap decode race in some WebViews)
        // can still emit a full-size blob with empty photo boxes. Compare each
        // converted photo against the blob's pixels via a small canvas match.
        const blobBitmap = await createImageBitmap(blob);
        const matchCanvas = document.createElement("canvas");
        matchCanvas.width = 24;
        matchCanvas.height = 24;
        const matchCtx = matchCanvas.getContext("2d", { willReadFrequently: true });
        if (matchCtx && originals.size > 0) {
          const avg = (px: Uint8ClampedArray) => {
            let r = 0, g = 0, b = 0;
            const n = px.length / 4;
            for (let i = 0; i < px.length; i += 4) { r += px[i]; g += px[i + 1]; b += px[i + 2]; }
            return [r / n, g / n, b / n];
          };
          const mismatched: string[] = [];
          for (const im of originals.keys()) {
            try {
              matchCtx.clearRect(0, 0, 24, 24);
              matchCtx.drawImage(im, 0, 0, 24, 24);
              const target = matchCtx.getImageData(0, 0, 24, 24).data;
              // Sample the blob at the photo's viewport position.
              const rect = im.getBoundingClientRect();
              const snapRect = snapshotEl.getBoundingClientRect();
              const cx = Math.round(((rect.left + rect.width / 2 - snapRect.left) / snapRect.width) * blobBitmap.width);
              const cy = Math.round(((rect.top + rect.height / 2 - snapRect.top) / snapRect.height) * blobBitmap.height);
              const sx = Math.max(0, Math.min(blobBitmap.width - 8, cx - 4));
              const sy = Math.max(0, Math.min(blobBitmap.height - 8, cy - 4));
              matchCtx.clearRect(0, 0, 24, 24);
              matchCtx.drawImage(blobBitmap, sx, sy, 8, 8, 0, 0, 24, 24);
              const actual = matchCtx.getImageData(0, 0, 24, 24).data;
              const targetAvg = avg(target);
              const actualAvg = avg(actual);
              // An EMPTY render is near-uniform theme color. Require plausible
              // color agreement between capture and source photo; allow
              // generous drift for scaling and cropping artifacts.
              const dist = Math.abs(targetAvg[0] - actualAvg[0]) + Math.abs(targetAvg[1] - actualAvg[1]) + Math.abs(targetAvg[2] - actualAvg[2]);
              if (dist > 210) {
                mismatched.push(im.src.slice(0, 120) + `(\u0394${dist})`);
              }
            } catch { /* treat unverifiable photos as OK — don't block good captures */ }
          }
          blobBitmap.close?.();
          if (mismatched.length > 0) {
            console.error("Cover capture attempt refused — photos missing from capture:", mismatched);
            return null;
          }
        }
        return blob;
      } catch (e) {
        console.error("Cover capture attempt threw:", e);
        return null;
      } finally {
        originals.forEach((src, im) => {
          im.src = src;
        });
      }
    };

    // Retry the whole capture up to 3 times. Transient WebView rendering races
    // (mid-swap decode, delayed image paint) are the main source of photo-less
    // thumbnails, and a single refusal used to leave a broken stored cover in
    // place forever. Only an all-attempts failure keeps the old thumbnail.
    let verifiedBlob: Blob | null = null;
    for (let attempt = 1; attempt <= 3 && !verifiedBlob; attempt++) {
      verifiedBlob = await captureVerifiedBlob();
      if (!verifiedBlob && attempt < 3) {
        await new Promise((r) => setTimeout(r, 1500 * attempt));
      }
    }
    if (!verifiedBlob) {
      console.error("Cover capture failed after 3 attempts — keeping the existing stored thumbnail.");
      return;
    }

    const fileName = `cover_${bookId}_${format}_${themeId}.png`;

    // Upload the verified image blob to our Supabase Storage
    const { error: uploadErr } = await supabase.storage
      .from("book-covers")
      .upload(fileName, verifiedBlob, { upsert: true, contentType: "image/png" });

    if (uploadErr) {
      console.error("Cover upload error:", uploadErr);
      return;
    }

    // Retrieve public URL
    const { data: { publicUrl } } = supabase.storage
      .from("book-covers")
      .getPublicUrl(fileName);

    // Save URL path to DB
    const finalUrl = `${publicUrl}?t=${Date.now()}`;
    const { error: dbErr } = await supabase.from("books").update({
      cover_url: finalUrl,
    }).eq("id", bookId);
    if (dbErr) {
      // Surface this — a silent failure here leaves the app pointing at a
      // stale cover_url forever (the app only reads books.cover_url).
      console.error("Cover thumbnail DB update failed:", dbErr.message);
    } else {
      console.log("Cover thumbnail successfully synced to DB!");
    }
  };

  useEffect(() => {
    const initialMount = isInitialSnapshotMount.current;
    if (initialMount) isInitialSnapshotMount.current = false;
    // The initial mount gets a longer warm-up: the SSR snapshot renders before
    // images and data settle, and this mount run is also the HEAL path — a
    // previously broken stored thumbnail only recovers when the book is
    // opened, because theme/format/title changes are the only other triggers.
    const timer = setTimeout(() => {
      generateAndUploadCover();
    }, initialMount ? 5000 : 2500);
    return () => clearTimeout(timer);
  }, [themeId, format, localPages.length > 0 ? localPages[0].title : ""]);

  useEffect(() => {
    if (!isGridView) {
      setIsMounted(false);
      const timer = setTimeout(() => setIsMounted(true), 50);
      return () => clearTimeout(timer);
    }
  }, [isGridView]);

  // Sync with props if they change from parent, but don't overwrite if we just updated locally unless length changed
  useEffect(() => {
    // Only resync if the number of pages changes (e.g. initial load or refetch), to prevent resetting our local optimistic state
    setLocalPages((currentLocal) => {
      if (currentLocal.length !== pages.length || currentLocal === pages) {
        return pages;
      }
      return currentLocal;
    });
  }, [pages]);

  // --- AUTOMATED PRINT CAPTURE LOGIC ---
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturePageIndex, setCapturePageIndex] = useState<number | null>(null);
  const captureRef = useRef<HTMLDivElement>(null);

  const runPrintCapture = async () => {
    if (!orderId || isCapturing) return;
    setIsCapturing(true);
    console.log(`Starting automated capture for Order: ${orderId}`);

    const totalPages = localPages.length;
    const { toBlob } = await import("html-to-image");

    for (let i = 0; i < totalPages; i++) {
      setCapturePageIndex(i); // Update the page being rendered
      
      // Give the DOM a moment to render the new page and wait for images to fully load
      await new Promise(r => setTimeout(r, 3000));
      
      // Secondary check: Wait for all images in the capture area to be complete
      if (captureRef.current) {
        const images = Array.from(captureRef.current.querySelectorAll('img'));
        await Promise.all(images.map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve; // Continue even if one image fails
            // Timeout safety for individual images
            setTimeout(resolve, 5000); 
          });
        }));
      }

      if (captureRef.current) {
        try {
          const blob = await toBlob(captureRef.current, {
            cacheBust: true,
            // 300 DPI = 96 * 3.125
            pixelRatio: 3.125, 
            width: dimensions.widthInches * 96,
            height: dimensions.heightInches * 96,
          });

          if (blob) {
            const fileName = `${orderId}/page_${i.toString().padStart(3, '0')}.png`;
            const { error } = await supabase.storage
              .from("temp-renders")
              .upload(fileName, blob, { upsert: true, contentType: "image/png" });

            if (error) throw error;
            
            // Signal progress to React Native
            const progress = Math.round(((i + 1) / totalPages) * 100);
            // @ts-ignore
            window.ReactNativeWebView?.postMessage(JSON.stringify({
              type: "CAPTURE_PROGRESS",
              payload: { current: i + 1, total: totalPages, progress }
            }));
          }
        } catch (err) {
          console.error(`Failed to capture page ${i}:`, err);
        }
      }
    }

    setIsCapturing(false);
    setCapturePageIndex(null);
    console.log("Capture session complete!");
    // @ts-ignore
    window.ReactNativeWebView?.postMessage(JSON.stringify({
      type: "CAPTURE_COMPLETE",
      payload: { orderId }
    }));
  };

  useEffect(() => {
    // Disable the old html-to-image loop if we are using the new vector PDF flow (Api2Pdf)
    // We only keep this if a legacy order processing flow is explicitly requested via orderId without Api2Pdf
    // but for the new flow, we want to render the whole DOM and let the headless browser handle it.
  }, [isPrintMode, orderId, localPages.length > 0]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === "string"
          ? JSON.parse(event.data)
          : event.data;

        if (data && data.type === "CHECKOUT_CLOSED") {
          setIsNativeCheckoutRunning(false);
        }
      } catch (err) {
        // Not a JSON message or not for us
      }
    };

    globalThis.addEventListener?.("message", handleMessage);
    return () => globalThis.removeEventListener?.("message", handleMessage);
  }, []);
  // --- END PRINT CAPTURE LOGIC ---

  const handleOrderClick = async () => {
    if (quoteCount < 4) {
      setCheckoutWarning(
        `You currently have ${quoteCount} Babbl${
          quoteCount !== 1 ? "s" : ""
        }. You need at least 4 Babbls to print your book — Notes pages fill the space until you add more!`,
      );
      setIsCheckoutModalOpen(true);
      return;
    }
    setCheckoutWarning(null);
    setQuantity(1);
    setIsCheckoutModalOpen(true);
  };

  // Fetch the live quote whenever the checkout modal is open and the
  // quantity changes, so the displayed total always matches what will be charged.
  useEffect(() => {
    if (!isCheckoutModalOpen || quoteCount < 4) return;
    let cancelled = false;
    setIsQuoting(true);

    const fetchQuote = async () => {
      try {
        const res = await fetch(
          `/api/checkout/quote?pages=${quoteCount}&format=${format}&quantity=${quantity}&country=${encodeURIComponent(shippingForm.country)}`,
        );
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setCheckoutQuote(data);
        }
      } catch (err) {
        console.error("Pricing quote failed", err);
      } finally {
        if (!cancelled) setIsQuoting(false);
      }
    };

    fetchQuote();
    return () => {
      cancelled = true;
    };
  }, [isCheckoutModalOpen, quoteCount, format, quantity, shippingForm.country]);

  const confirmOrderAndTriggerCheckout = () => {
    // Require a real shipping address: Gelato ships the physical book to it.
    const requiredFields: Array<[keyof typeof shippingForm, string]> = [
      ["firstName", "First name"],
      ["lastName", "Last name"],
      ["addressLine1", "Street address"],
      ["city", "City"],
      ["state", "State / Province"],
      ["postcode", "ZIP / Postcode"],
    ];
    const missing = requiredFields
      .filter(([key]) => !shippingForm[key].trim())
      .map(([, label]) => label);
    if (missing.length > 0) {
      setAddressError(`Please fill in: ${missing.join(", ")}.`);
      addressSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }
    setAddressError(null);
    // Dismiss modal first so it doesn't show behind native sheet
    setIsCheckoutModalOpen(false);
    // Keep the background blurred for the native sheet
    setIsNativeCheckoutRunning(true);

    // Post message to React Native App
    // Use standard window access which is reliably injected by the bridge
    // @ts-ignore: Accessing window for React Native bridge
    const win = typeof window !== "undefined" ? window : null;

    // @ts-ignore: Checking bridge availability
    if (win && win.ReactNativeWebView && win.ReactNativeWebView.postMessage) {
      const totalCost = checkoutQuote?.price || "39.99";

      // @ts-ignore: Posting to bridge
      win.ReactNativeWebView.postMessage(JSON.stringify({
        type: "START_CHECKOUT",
        payload: {
          bookId: bookId,
          amount: parseFloat(totalCost).toFixed(2),
          format: format,
          size: format,
          pages: quoteCount,
          quantity: quantity,
          shippingDetails: {
            firstName: shippingForm.firstName.trim(),
            lastName: shippingForm.lastName.trim(),
            addressLine1: shippingForm.addressLine1.trim(),
            addressLine2: shippingForm.addressLine2.trim(),
            city: shippingForm.city.trim(),
            state: shippingForm.state.trim(),
            postcode: shippingForm.postcode.trim(),
            country: shippingForm.country,
            phone: shippingForm.phone.trim(),
          },
        },
      }));
    } else {
      // Fallback for browser testing
      alert(
        "Native Checkout Initialized! (This acts as a transparent bridge directly to the React Native SDK)",
      );
    }
  };

  const yearRange = useMemo(() => {
    const dates = pages
      .map((p) => p.quote?.date)
      .filter(Boolean)
      .map((d) => new Date(d!).getFullYear())
      .filter((y) => !isNaN(y));

    if (dates.length === 0) return new Date().getFullYear().toString();
    const min = Math.min(...dates);
    const max = Math.max(...dates);
    return min === max ? `${min}` : `${min}–${max}`;
  }, [pages]);

  const uniqueChildren = useMemo(() => {
    const childrenMap = new Map<
      string,
      { id: string; name: string; avatar_url?: string }
    >();
    pages.forEach((p) => {
      if (p.quote?.child && !childrenMap.has(p.quote.child.id)) {
        childrenMap.set(p.quote.child.id, p.quote.child);
      }
    });
    return Array.from(childrenMap.values());
  }, [pages]);

  // Sync with props if they change from parent, but don't overwrite if we just updated locally unless length changed
  useEffect(() => {
    // Only resync if the number of pages changes (e.g. initial load or refetch), to prevent resetting our local optimistic state
    setLocalPages((currentLocal) => {
      if (currentLocal.length !== pages.length || currentLocal === pages) {
        return pages;
      }
      return currentLocal;
    });
  }, [pages]);

  const handleReorder = async (
    oldGridIndex?: number,
    newGridIndex?: number,
  ) => {
    if (
      oldGridIndex === undefined || newGridIndex === undefined ||
      oldGridIndex === newGridIndex
    ) return;

    // Shift by 1 because the Grid View skips the 0th item (Cover)
    const oldIndex = oldGridIndex + 1;
    const newIndex = newGridIndex + 1;

    const newPages = [...localPages];
    const [moved] = newPages.splice(oldIndex, 1);
    newPages.splice(newIndex, 0, moved);

    setLocalPages(newPages);

    try {
      const updates = newPages.map(async (p, idx) => {
        if (p.quote) {
          const { error } = await supabase.from("book_quotes").update({
            order_index: idx - 1,
          }).eq("book_id", bookId).eq("quote_id", p.quote.id);

          if (error) throw error;
        }
      });
      await Promise.all(updates);
    } catch (err) {
      console.error("Save Reorder Error:", err);
      // Optional: Handle error by reverting or showing toast
    }
  };

  const handleDeletePage = async (quoteId: string, indexToRemove: number) => {
    const newPages = localPages.filter((_, idx) => idx !== indexToRemove);
    setLocalPages(newPages);

    if (currentPageIndex >= newPages.length) {
      setCurrentPageIndex(Math.max(0, newPages.length - 1));
    }

    try {
      const { error } = await supabase
        .from("book_quotes")
        .delete()
        .eq("book_id", bookId)
        .eq("quote_id", quoteId);

      if (error) throw error;

      const updates = newPages.map(async (p, idx) => {
        if (p.quote) {
          const { error: updateError } = await supabase.from("book_quotes")
            .update({
              order_index: idx - 1,
            }).eq("book_id", bookId).eq("quote_id", p.quote.id);
          if (updateError) throw updateError;
        }
      });
      await Promise.all(updates);
    } catch (err) {
      console.error("Delete Page Error:", err);
    }
  };

  // --- ADD BABBL PAGE ---
  // Lets the user append another quote page from the family's Babbl bank.
  // Notes pages at the end of the printed book are recomputed at print time,
  // so every added Babbl automatically removes one padding Notes page.
  const [isAddQuoteOpen, setIsAddQuoteOpen] = useState(false);
  const [availableQuotes, setAvailableQuotes] = useState<BabblQuote[]>([]);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  const [addQuoteError, setAddQuoteError] = useState<string | null>(null);
  // Search box text + active child filter for the Add-a-Babbl modal.
  const [quoteSearch, setQuoteSearch] = useState("");
  const [quoteChildFilter, setQuoteChildFilter] = useState<string | null>(null);

  const openAddQuoteModal = async () => {
    setIsAddQuoteOpen(true);
    setAddQuoteError(null);
    setQuoteSearch("");
    setQuoteChildFilter(null);
    if (!familyId) {
      setAddQuoteError(
        "This book isn't linked to a family, so new Babbls can't be added here.",
      );
      return;
    }
    setIsLoadingQuotes(true);
    try {
      const inBook = new Set(
        localPages.map((p) => p.quote?.id).filter(Boolean) as string[],
      );
      const { data, error } = await supabase!
        .from("quotes")
        .select(
          `id, quote_text, quote_date, media_url,
           child:children (id, name, nickname, date_of_birth, avatar_url),
           parent:profiles!recorded_by (full_name, avatar_url)`,
        )
        .eq("family_id", familyId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      const rows = (data || []) as Array<Record<string, any>>;
      setAvailableQuotes(
        rows
          .filter((q) => !inBook.has(q.id))
          .map((q) => {
            const child = Array.isArray(q.child) ? q.child[0] : q.child;
            const parent = Array.isArray(q.parent) ? q.parent[0] : q.parent;
            return {
              id: q.id,
              text: q.quote_text,
              date: q.quote_date,
              child,
              parent: parent?.full_name
                ? { name: parent.full_name, avatar_url: parent.avatar_url }
                : undefined,
              photo_url: q.media_url || undefined,
            } as BabblQuote;
          }),
      );
    } catch (err) {
      console.error("Load available quotes failed:", err);
      setAddQuoteError("Couldn't load your Babbls. Please try again.");
    } finally {
      setIsLoadingQuotes(false);
    }
  };

  const handleAddQuotePage = async (quote: BabblQuote) => {
    // pages = cover + N quotes + back cover, so the new quote's order_index
    // is the current quote count and its page_number is count + 1.
    const nextOrderIndex = Math.max(0, localPages.length - 2);
    const { error } = await supabase!.from("book_quotes").insert({
      book_id: bookId,
      quote_id: quote.id,
      order_index: nextOrderIndex,
      layout_style: "photo_window_top_quote_bottom",
      show_context: true,
    });
    if (error) {
      console.error("Add quote page failed:", error);
      setAddQuoteError("Couldn't add that Babbl. Please try again.");
      return;
    }
    setLocalPages((cur) => {
      const withoutBack = cur.slice(0, cur.length - 1);
      const back = cur[cur.length - 1];
      return [
        ...withoutBack,
        {
          page_number: nextOrderIndex + 1,
          layout_style: "photo_window_top_quote_bottom",
          show_context: true,
          quote,
        } as BookPageData,
        back,
      ];
    });
    setIsAddQuoteOpen(false);
  };

  // Distinct children present in the available-Babbl list, for filter chips.
  const quoteFilterChildren = useMemo(() => {
    const map = new Map<
      string,
      { id: string; name: string; avatar_url?: string }
    >();
    availableQuotes.forEach((q) => {
      if (q.child?.id && !map.has(q.child.id)) {
        map.set(q.child.id, {
          id: q.child.id,
          name: q.child.nickname || q.child.name || "Babbl",
          avatar_url: q.child.avatar_url,
        });
      }
    });
    return Array.from(map.values());
  }, [availableQuotes]);

  // Search + child filter applied to the available-Babbl list. Matches quote
  // text, child name/nickname, and the parent who recorded it.
  const filteredQuotes = useMemo(() => {
    const needle = quoteSearch.trim().toLowerCase();
    return availableQuotes.filter((q) => {
      if (quoteChildFilter && q.child?.id !== quoteChildFilter) return false;
      if (!needle) return true;
      const haystack = [
        q.text,
        q.child?.name,
        q.child?.nickname,
        q.parent?.name,
      ].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(needle);
    });
  }, [availableQuotes, quoteSearch, quoteChildFilter]);

  // Printed page math (mirrors quote.ts / stitch-pdf): content = title page +
  // one page per quote; request R = max(28, content); total T = R + 4
  // (cover spread + 2 endpapers + 1), floor 32. Notes pages fill the end.
  const printedTotalPages = Math.max(32, Math.max(28, quoteCount + 1) + 4);
  const printedNotesPages = Math.max(0, printedTotalPages - 4 - quoteCount);
  // Preview mode: while true, the page viewer shows the auto-appended Notes
  // page instead of book pages. Purely visual — nothing is stored.
  const [showingNotesPage, setShowingNotesPage] = useState(false);
  const notesPageHtml = useMemo(
    () => renderNotesPageHtml(dimensions),
    [dimensions],
  );

  useEffect(() => {
    if (isGridView && gridContainerRef.current) {
      sortableRef.current = Sortable.create(gridContainerRef.current, {
        animation: 250,
        delay: 150, // Slight delay on touch allows scroll interaction to not be hijacked
        delayOnTouchOnly: true,
        onEnd: (evt: SortableEvent) => {
          handleReorder(evt.oldIndex, evt.newIndex);
        },
      });
    }

    return () => {
      if (sortableRef.current) {
        sortableRef.current.destroy();
        sortableRef.current = null;
      }
    };
  }, [isGridView, localPages]);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateScale = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const physicalWidthPx = dimensions.widthInches * 96;
        const physicalHeightPx = dimensions.heightInches * 96;

        // Ensure we don't have 0 or negative space
        const availableHeight = Math.max(100, height - 20);
        const availableWidth = Math.max(100, width - 20);

        const scaleW = availableWidth / physicalWidthPx;
        const scaleH = availableHeight / physicalHeightPx;

        // Fit to the smaller dimension, with a sensible floor and ceiling
        const newScale = Math.min(1.2, Math.max(0.1, Math.min(scaleW, scaleH)));

        setScale(newScale);
      }
    };

    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [isGridView, format, dimensions.widthInches, dimensions.heightInches]);

  useEffect(() => {
    if (!isGridView || !gridContainerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const container = entries[0].target;
      const firstChild = container.firstElementChild;
      if (firstChild) {
        const w = firstChild.getBoundingClientRect().width;
        if (w > 0) setGridItemWidth(w);
      }
    });

    observer.observe(gridContainerRef.current);

    return () => observer.disconnect();
  }, [isGridView, localPages.length]);

  // Page flow: [cover, ...quotes, NOTES PREVIEW, back cover]. The Notes page
  // is not a stored page — it's a preview of what the print pipeline appends
  // after the last Babbl to satisfy the page minimum.
  const lastQuoteIndex = Math.max(1, localPages.length - 2);
  const goToNextPage = () => {
    if (showingNotesPage && !animating) {
      // Notes -> back cover.
      setAnimating(true);
      setAnimationClass("animate-turn-next-out");
      setTimeout(() => {
        setCurrentPageIndex(localPages.length - 1);
        setShowingNotesPage(false);
        setAnimationClass("animate-turn-next-in");
        setTimeout(() => {
          setAnimationClass("");
          setAnimating(false);
        }, 200);
      }, 150);
      return;
    }
    if (currentPageIndex === lastQuoteIndex && !animating) {
      // Last Babbl page -> preview the auto-appended Notes page.
      setAnimating(true);
      setAnimationClass("animate-turn-next-out");
      setTimeout(() => {
        setShowingNotesPage(true);
        setAnimationClass("animate-turn-next-in");
        setTimeout(() => {
          setAnimationClass("");
          setAnimating(false);
        }, 200);
      }, 150);
      return;
    }
    if (currentPageIndex < localPages.length - 1 && !animating) {
      setAnimating(true);
      setAnimationClass("animate-turn-next-out");
      setTimeout(() => {
        setCurrentPageIndex((prev) => prev + 1);
        setAnimationClass("animate-turn-next-in");
        setTimeout(() => {
          setAnimationClass("");
          setAnimating(false);
        }, 200);
      }, 150);
    }
  };

  const goToPrevPage = () => {
    if (showingNotesPage && !animating) {
      // Notes -> last Babbl page.
      setAnimating(true);
      setAnimationClass("animate-turn-prev-out");
      setTimeout(() => {
        setCurrentPageIndex(lastQuoteIndex);
        setShowingNotesPage(false);
        setAnimationClass("animate-turn-prev-in");
        setTimeout(() => {
          setAnimationClass("");
          setAnimating(false);
        }, 200);
      }, 150);
      return;
    }
    if (currentPageIndex === localPages.length - 1 && !animating) {
      // Back cover -> preview the Notes page (which sits before it).
      setAnimating(true);
      setAnimationClass("animate-turn-prev-out");
      setTimeout(() => {
        setShowingNotesPage(true);
        setAnimationClass("animate-turn-prev-in");
        setTimeout(() => {
          setAnimationClass("");
          setAnimating(false);
        }, 200);
      }, 150);
      return;
    }
    if (currentPageIndex > 0 && !animating) {
      setAnimating(true);
      setAnimationClass("animate-turn-prev-out");
      setTimeout(() => {
        setCurrentPageIndex((prev) => prev - 1);
        setAnimationClass("animate-turn-prev-in");
        setTimeout(() => {
          setAnimationClass("");
          setAnimating(false);
        }, 200);
      }, 150);
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };
  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === 0) return;
    const swipeDistance = touchStartX.current - e.changedTouches[0].screenX;
    if (swipeDistance > 50) goToNextPage();
    else if (swipeDistance < -50) goToPrevPage();
    touchStartX.current = 0;
  };

  const handleThemeChange = async (newThemeId: string) => {
    setThemeId(newThemeId);
    try {
      const { error } = await supabase.from("books").update({
        theme_id: newThemeId,
      }).eq("id", bookId);
      if (error) throw error;
    } catch (err) {
      console.error("Save Theme Error:", err);
      setThemeId(themeId);
    }
  };

  const handleFormatChange = async (newFormat: BookFormat) => {
    setFormat(newFormat);
    try {
      const { error } = await supabase.from("books").update({
        book_size: newFormat,
      }).eq("id", bookId);
      if (error) throw error;
    } catch (err) {
      console.error("Save Format Error:", err);
      setFormat(format);
    }
  };

  const handleLayoutChange = async (newLayout: string) => {
    const currentPage = localPages[currentPageIndex];
    if (!currentPage.quote) return;
    const updatedPages = [...localPages];
    const originalLayout = updatedPages[currentPageIndex].layout_style;
    updatedPages[currentPageIndex].layout_style = newLayout;
    setLocalPages(updatedPages);
    try {
      const { error } = await supabase.from("book_quotes").update({
        layout_style: newLayout,
      }).eq("book_id", bookId).eq("quote_id", currentPage.quote.id);
      if (error) throw error;
    } catch (err) {
      console.error("Save Layout Error:", err);
      const reverted = [...localPages];
      reverted[currentPageIndex].layout_style = originalLayout;
      setLocalPages(reverted);
    }
  };

  const handleContextChange = async (showContext: boolean) => {
    const currentPage = localPages[currentPageIndex];
    if (!currentPage.quote) return;
    const updatedPages = [...localPages];
    const originalContextState = updatedPages[currentPageIndex].show_context;
    updatedPages[currentPageIndex].show_context = showContext;
    setLocalPages(updatedPages);
    try {
      const { error } = await supabase.from("book_quotes").update({
        show_context: showContext,
      }).eq("book_id", bookId).eq("quote_id", currentPage.quote.id);
      if (error) throw error;
    } catch (err) {
      console.error("Save Context Error:", err);
      const reverted = [...localPages];
      reverted[currentPageIndex].show_context = originalContextState;
      setLocalPages(reverted);
    }
  };

  const currentPage = localPages[currentPageIndex];
  const isFirstPage = currentPageIndex === 0;
  const isLastPage = currentPageIndex === localPages.length - 1;
  const isCoverOrBackCover = isFirstPage || isLastPage;

  // Force layout style for rendering purposes if it is the first or last page
  const effectiveLayoutStyle = isFirstPage
    ? "cover"
    : isLastPage
    ? "back_cover"
    : currentPage.layout_style;

  const themeOptions = [
    {
      label: "Babbl Theme",
      value: "babbl_theme",
      icon: "babbl-bubble-icon",
    },
  ];

  const layoutOptions = [
    { label: "Circle Photo", value: "circle_photo", icon: "layout-circle" },
    {
      label: "Quote top, photo bottom",
      value: "quote_top_photo_bottom",
      icon: "layout-quote-top",
    },
    {
      label: "Full page photo, quote centered",
      value: "full_page_photo_quote_centered",
      icon: "layout-full-photo",
    },
    {
      label: "Full width photo top, quote bottom",
      value: "full_width_photo_top_quote_bottom",
      icon: "layout-full-width-top",
    },
    {
      label: "Full screen photo, short quote",
      value: "full_screen_photo_short_quote",
      icon: "layout-full-screen-short",
    },
    {
      label: "Photo window top, quote bottom",
      value: "photo_window_top_quote_bottom",
      icon: "layout-window-top",
    },
    {
      label: "Quote only, centered",
      value: "quote_only_centered",
      icon: "layout-quote-only",
    },
  ];

  const allowsContextToggle = [
    "quote_top_photo_bottom",
    "full_page_photo_quote_centered",
    "quote_only_centered",
    "photo_window_top_quote_bottom",
  ].includes(effectiveLayoutStyle) && !!currentPage.quote?.context;

  // Hide Cover and Back Cover from the inner pages in Grid View
  const gridPages = localPages.slice(1, -1);

  return (
    <div
      class={`flex flex-col items-center w-full bg-[#FDFDFD] font-['Rosario'] ${
        isPrintMode ? "min-h-screen" : "h-full overflow-hidden"
      }`}
    >
      {/* HEADER: Format Toggle */}
      {!isGridView && !isPrintMode && (
        <header class="w-full max-w-xl mx-auto px-6 pt-4 pb-2 flex justify-start items-center gap-2 md:gap-4 relative z-60 shrink-0">
          <div class="flex-1 min-w-32 bg-gray-100/50 backdrop-blur-sm rounded-2xl shadow-inner border border-gray-200/50">
            <CustomSelect
              value={themeId}
              options={themeOptions}
              onChange={handleThemeChange}
              icon="color-palette-outline"
              placeholder="Select Theme"
              openDirection="down"
            />
          </div>

          {/* Two sizes: Mini 5.5" (softcover — Gelato has no hardcover mini)
              and Classic 8" (hardcover). */}
          <div class="flex bg-gray-100/50 backdrop-blur-sm p-1 rounded-2xl shadow-inner border border-gray-200/50 h-14 items-center shrink-0">
            <button
              type="button"
              onClick={() => handleFormatChange("mini")}
              class={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 h-full rounded-xl text-xs font-bold transition-all ${
                format === "mini"
                  ? "bg-white text-[#9B51E0] shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon name="book-outline" style={{ fontSize: "14px" }} />
              <div class="flex flex-col items-center leading-tight whitespace-nowrap">
                <div class="flex items-center">
                  <span>Mini&nbsp;</span>
                  <span class="text-[10px] font-semibold opacity-60">5.5x5.5"</span>
                </div>
                <span class="text-[10px] font-medium opacity-60">Softcover</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleFormatChange("classic")}
              class={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 h-full rounded-xl text-xs font-bold transition-all ${
                format === "classic"
                  ? "bg-white text-[#9B51E0] shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon name="book-outline" style={{ fontSize: "22px" }} />
              <div class="flex flex-col items-center leading-tight whitespace-nowrap">
                <div class="flex items-center">
                  <span>Classic&nbsp;</span>
                  <span class="text-[10px] font-semibold opacity-60">8x8"</span>
                </div>
                <span class="text-[10px] font-medium opacity-60">Hardcover</span>
              </div>
            </button>
          </div>
        </header>
      )}

      {/* MID: Book Canvas */}
      {isPrintMode ? (
        <div class="print-book-container bg-white" style={{ width: `${dimensions.widthInches}in` }}>
          <style>
            {`
              /* Force specific page size and remove margins for the PDF generator */
              @page {
                margin: 0;
                size: ${dimensions.widthInches}in ${dimensions.heightInches}in;
              }
              
              /* Ensure the container and body don't have stray padding/margins */
              body { margin: 0 !important; padding: 0 !important; overflow: visible !important; }
              
              .print-book-container {
                width: ${dimensions.widthInches}in !important;
                margin: 0 auto;
              }

              .print-page { 
                 width: ${dimensions.widthInches}in !important; 
                 height: ${dimensions.heightInches}in !important;
                 overflow: hidden;
                 position: relative;
                 page-break-after: always !important;
                 break-after: page !important;
                 display: block !important;
                 margin: 0 !important;
                 padding: 0 !important;
              }
            `}
          </style>
          {pages.map((page, idx) => (
            <div key={idx} class="print-page">
              <PageRenderer
                format={format}
                page={{
                  ...page,
                  layout_style: idx === 0 
                    ? "cover" 
                    : idx === pages.length - 1 
                    ? "back_cover" 
                    : page.layout_style
                }}
                themeId={themeId}
                yearRange={yearRange}
                childrenProfiles={uniqueChildren}
                hideBleed={true}
              />
            </div>
          ))}
        </div>
      ) : isGridView ? (
        <div class="flex-1 w-full overflow-y-auto px-4 pt-6 pb-24 custom-scrollbar">
          <div
            ref={gridContainerRef}
            class="grid grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-3xl mx-auto"
          >
            {gridPages.map((pageData, index) => {
              const gridScale = gridItemWidth / (dimensions.widthInches * 96);
              const actualIndex = index + 1;
              return (
                <div
                  key={pageData.quote?.id || `draft-${actualIndex}`}
                  class="relative aspect-square rounded-2xl overflow-hidden shadow-md bg-white transition-all border-2 border-transparent cursor-pointer hover:border-[#9B51E0] hover:shadow-xl hover:-translate-y-1"
                  style={{ transform: "translate3d(0, 0, 0)" }}
                  onClick={() => {
                    setCurrentPageIndex(actualIndex);
                    setIsGridView(false);
                    setShowingNotesPage(false);
                  }}
                >
                  <div
                    style={{
                      width: `${dimensions.widthInches * 96}px`,
                      height: `${dimensions.heightInches * 96}px`,
                      transform: `scale(${gridScale})`,
                      transformOrigin: "top left",
                    }}
                    class="pointer-events-none"
                  >
                    <PageRenderer
                      format={format}
                      page={pageData}
                      themeId={themeId}
                      yearRange={yearRange}
                      childrenProfiles={uniqueChildren}
                      hideBleed={false}
                    />
                  </div>
                  <div class="absolute bottom-2 left-2 bg-black/60 text-white text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center backdrop-blur-md shadow-sm border border-white/20 pointer-events-none">
                    {actualIndex + 1}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Are you sure you want to remove this page from the book?")) {
                        if (pageData.quote) {
                          handleDeletePage(pageData.quote.id, actualIndex);
                        }
                      }
                    }}
                    class="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-red-500/80 text-white flex items-center justify-center hover:bg-red-600 transition-colors backdrop-blur-md shadow-sm border border-white/20 z-10"
                    aria-label="Delete Page"
                  >
                    <Icon name="trash-outline" class="text-[12px]" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add another Babbl page + printed-structure explainer */}
          <div class="max-w-3xl mx-auto mt-4 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={openAddQuoteModal}
              class="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-[#9B51E0]/40 bg-[#9B51E0]/5 text-[#9B51E0] font-bold hover:bg-[#9B51E0]/10 hover:border-[#9B51E0]/60 transition-colors"
            >
              <Icon name="add-outline" class="text-xl" />
              Add a Babbl Page
            </button>
            <button
              type="button"
              onClick={() => {
                setIsGridView(false);
                setShowingNotesPage(false);
              }}
              class="flex items-center justify-center gap-2 bg-[#9B51E0] text-white px-6 h-14 rounded-2xl shadow-md font-bold hover:bg-[#8A44C8] transition-all"
            >
              <Icon name="book-outline" class="text-lg" />
              Return to Book
            </button>
            <p class="text-xs text-gray-500 text-center leading-relaxed max-w-md">
              Your book prints {format === "mini" ? "as a softcover" : "as a hardcover"} with
              at least 32 pages: cover, blank endpapers, your Babbls, Notes
              pages (after the last Babbl), and the back cover.
              {printedNotesPages > 0
                ? ` Right now ${printedNotesPages} Notes page${printedNotesPages !== 1 ? "s" : ""} pad the end — each new Babbl you add removes one automatically.`
                : " Your Babbls fill the book!"}
            </p>
          </div>
        </div>
      ) : (
        <div
          ref={containerRef}
          class="flex-1 w-full flex items-center justify-center relative overflow-visible px-4"
          style={{ touchAction: "pan-y" }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            class={`relative shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] bg-white ${animationClass} ${
              isMounted ? "transition-all duration-300" : ""
            }`}
            style={{
              width: `${dimensions.widthInches * 96 * scale}px`,
              height: `${dimensions.heightInches * 96 * scale}px`,
            }}
          >
            <div
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              {showingNotesPage
                ? (
                  // Preview of the auto-appended Notes page the print pipeline
                  // adds after the last Babbl. Visual only — not stored.
                  <div
                    style={{
                      width: `${dimensions.widthInches * 96}px`,
                      height: `${dimensions.heightInches * 96}px`,
                    }}
                    dangerouslySetInnerHTML={{ __html: notesPageHtml }}
                  />
                )
                : (
                  <PageRenderer
                    format={format}
                    page={{
                      ...localPages[currentPageIndex],
                      layout_style: effectiveLayoutStyle,
                    }}
                    themeId={themeId}
                    yearRange={yearRange}
                    childrenProfiles={uniqueChildren}
                    hideBleed={false}
                  />
                )}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER: Controls (No Background). Not rendered in grid view — its only
          content there ("Return to Book") lives at the end of the grid scroll,
          under the Add a Babbl Page button. */}
      {!isPrintMode && !isGridView && (
        <footer class="w-full max-w-xl px-6 pt-4 pb-12 flex flex-col gap-4 relative z-50 shrink-0">
          {/* Selectors Row */}
          {!isCoverOrBackCover && !isGridView && !showingNotesPage && (
            <div class="flex items-center gap-2 md:gap-4 w-full">
              <div class="flex-1 min-w-0">
                <CustomSelect
                  value={effectiveLayoutStyle}
                  options={layoutOptions}
                  onChange={handleLayoutChange}
                  icon="grid-outline"
                  placeholder="Select Layout"
                />
              </div>

              {allowsContextToggle && (
                <label class="shrink-0 flex items-center justify-center gap-2 md:gap-3 bg-white/80 backdrop-blur-md border border-gray-200/50 h-14 px-3 md:px-4 rounded-xl cursor-pointer hover:bg-white/90 transition-colors shadow-sm">
                  <span class="text-sm font-bold text-gray-700 capitalize">
                    Context
                  </span>
                  <div class="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      class="sr-only peer"
                      checked={currentPage.show_context !== false}
                      onChange={(e) =>
                        handleContextChange(
                          (e.target as HTMLInputElement).checked,
                        )}
                    />
                    <div class="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[16px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9B51E0]">
                    </div>
                  </div>
                </label>
              )}
            </div>
          )}

          {/* Pagination Row */}
          {!isGridView && (
            <div class="flex items-center justify-between gap-2 w-full">
              <div class="flex-1 flex items-center bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-sm h-14 overflow-hidden min-w-0">
                <button
                  type="button"
                  onClick={goToPrevPage}
                  disabled={currentPageIndex === 0 && !showingNotesPage}
                  class="w-12 md:flex-1 shrink-0 h-full flex items-center justify-center text-gray-700 hover:bg-[#9B51E0]/5 hover:text-[#9B51E0] disabled:opacity-20 transition-all active:bg-[#9B51E0]/10 border-r border-gray-100/50"
                  aria-label="Previous Page"
                >
                  <Icon name="chevron-back-outline" />
                </button>
                <div class="flex-1 flex items-center justify-center h-full min-w-16 px-2 truncate">
                  <span class="text-xs font-bold text-gray-700 whitespace-nowrap">
                    {showingNotesPage
                      ? "Notes"
                      : `${currentPageIndex + 1} / ${localPages.length}`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={goToNextPage}
                  disabled={currentPageIndex === localPages.length - 1 &&
                    !showingNotesPage}
                  class="w-12 md:flex-1 shrink-0 h-full flex items-center justify-center text-gray-700 hover:bg-[#9B51E0]/5 hover:text-[#9B51E0] disabled:opacity-20 transition-all active:bg-[#9B51E0]/10 border-l border-gray-100/50"
                  aria-label="Next Page"
                >
                  <Icon name="chevron-forward-outline" />
                </button>
              </div>

              {/* Right Actions */}
              <div class="flex items-center gap-2 md:gap-3 shrink-0">
                {/* Grid Toggle Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsGridView(true);
                    setShowingNotesPage(false);
                  }}
                  class="w-14 h-14 shrink-0 flex items-center justify-center rounded-2xl shadow-sm border transition-all bg-white/90 backdrop-blur-md border-gray-200/50 text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                  aria-label="Enter Grid View"
                >
                  <Icon name="apps-outline" class="text-xl text-[#9B51E0]" />
                </button>

                {/* Vertical Divider */}
                <div class="w-px h-8 bg-gray-300 mx-1" />

                {/* Order Book Button */}
                <button
                  type="button"
                  onClick={handleOrderClick}
                  class="h-14 px-5 flex items-center justify-center gap-2 rounded-2xl font-bold shadow-md text-white bg-[#9B51E0] hover:bg-[#8A44C8] transition-colors"
                >
                  <Icon name="cart-outline" class="text-lg" />
                  Order
                </button>
              </div>
            </div>
          )}

          {/* Notes page explainer: shown while the Notes preview is on screen. */}
          {!isGridView && showingNotesPage && (
            <p class="text-xs text-gray-500 text-center leading-relaxed px-2">
              Notes pages like this are added after your last Babbl, as many as
              needed to fill the book's minimum page count (32 pages). As you
              add more Babbls, they're removed one-for-one automatically.
            </p>
          )}


          {/* Status */}
        </footer>
      )}

      {/* Hidden Cover Renderer for Snapshots */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          opacity: 0.001,
          zIndex: -50,
          width: `${dimensions.widthInches * 96}px`,
          height: `${dimensions.heightInches * 96}px`,
          pointerEvents: "none",
        }}
      >
        <div ref={coverSnapshotRef} class="w-full h-full bg-white">
          <PageRenderer
            format={format}
            page={{ ...localPages[0], layout_style: "cover" }}
            themeId={themeId}
            yearRange={yearRange}
            childrenProfiles={uniqueChildren}
            hideBleed={isPrintMode}
          />
        </div>
      </div>

      {/* Hidden Capture Renderer for Automated PDF Generation */}
      {capturePageIndex !== null && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: -9999, // Move off-screen instead of opacity for better rendering reliability
            opacity: 1,
            zIndex: -100,
            width: `${dimensions.widthInches * 96}px`,
            height: `${dimensions.heightInches * 96}px`,
            pointerEvents: "none",
          }}
        >
          <div ref={captureRef} class="w-full h-full bg-white">
            <PageRenderer
              format={format}
              page={{
                ...localPages[capturePageIndex],
                layout_style: capturePageIndex === 0 
                  ? "cover" 
                  : capturePageIndex === localPages.length - 1 
                  ? "back_cover" 
                  : localPages[capturePageIndex].layout_style
              }}
              themeId={themeId}
              yearRange={yearRange}
              childrenProfiles={uniqueChildren}
              hideBleed={true}
            />
          </div>
        </div>
      )}

      {/* Add Babbl Page Modal */}
      {isAddQuoteOpen && (
        <div
          class="fixed inset-0 bg-white/10 backdrop-blur-md flex justify-center items-end sm:items-center sm:p-6 p-0 animate-overlay font-rosario"
          style={{ zIndex: 9999 }}
          onClick={() => setIsAddQuoteOpen(false)}
        >
          <div
            class="bg-white shadow-[0_50px_120px_-15px_rgba(0,0,0,0.85)] overflow-hidden animate-sheet border border-gray-100 w-full max-w-lg flex flex-col h-[100dvh] sm:h-auto sm:max-h-[80vh] sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div class="flex justify-between items-start px-6 pt-6 pb-4 shrink-0">
              <div>
                <h2 class="text-2xl font-bold text-[#9B51E0] tracking-tight">
                  Add a Babbl Page
                </h2>
                <p class="text-gray-500 text-sm mt-1">
                  Pick a Babbl to add at the end of the book.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddQuoteOpen(false)}
                class="w-9 h-9 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
                aria-label="Close"
              >
                <Icon name="close-outline" class="text-lg" />
              </button>
            </div>
            <div class="flex-1 overflow-y-auto px-6 pb-8 custom-scrollbar">
              {addQuoteError && (
                <div class="mb-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-3 py-2">
                  {addQuoteError}
                </div>
              )}
              {isLoadingQuotes
                ? (
                  <div class="py-10 flex justify-center">
                    <div class="w-8 h-8 border-4 border-[#9B51E0]/20 border-t-[#9B51E0] rounded-full animate-spin">
                    </div>
                  </div>
                )
                : availableQuotes.length === 0
                ? (
                  <p class="text-center text-gray-500 text-sm py-10">
                    Every Babbl in your family is already in this book. Add new
                    ones from the Babbl app first!
                  </p>
                )
                : (
                  <div class="flex flex-col gap-3">
                    {/* Search + child filter */}
                    <div class="relative shrink-0">
                      <Icon
                        name="search-outline"
                        class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        value={quoteSearch}
                        onInput={(e) => setQuoteSearch((e.target as HTMLInputElement).value)}
                        placeholder="Search Babbls..."
                        class="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#9B51E0] focus:bg-white focus:ring-2 focus:ring-[#9B51E0]/15 transition-colors"
                      />
                      {quoteSearch && (
                        <button
                          type="button"
                          onClick={() => setQuoteSearch("")}
                          class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          aria-label="Clear search"
                        >
                          <Icon name="close-circle" class="text-lg" />
                        </button>
                      )}
                    </div>
                    {quoteFilterChildren.length > 1 && (
                      <div class="flex items-center gap-1.5 flex-wrap shrink-0">
                        <button
                          type="button"
                          onClick={() => setQuoteChildFilter(null)}
                          class={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                            quoteChildFilter === null
                              ? "bg-[#9B51E0] text-white shadow-sm"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          All
                        </button>
                        {quoteFilterChildren.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() =>
                              setQuoteChildFilter(
                                quoteChildFilter === c.id ? null : c.id,
                              )}
                            class={`flex items-center gap-1.5 pl-1.5 pr-3 py-1 rounded-full text-xs font-bold transition-colors ${
                              quoteChildFilter === c.id
                                ? "bg-[#9B51E0] text-white shadow-sm"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {c.avatar_url
                              ? (
                                <img
                                  src={c.avatar_url}
                                  alt={c.name}
                                  class="w-5 h-5 rounded-full object-cover"
                                />
                              )
                              : (
                                <span class="w-5 h-5 rounded-full bg-[#9B51E0]/15 flex items-center justify-center">
                                  <Icon
                                    name="person-outline"
                                    class="text-[10px] text-[#9B51E0]"
                                  />
                                </span>
                              )}
                            {c.name}
                          </button>
                        ))}
                      </div>
                    )}
                    {filteredQuotes.length === 0
                      ? (
                        <p class="text-center text-gray-500 text-sm py-8">
                          No Babbls match
                          {quoteSearch && ` "${quoteSearch}"`}
                          {quoteChildFilter && " this filter"}.
                        </p>
                      )
                      : (
                        <div class="flex flex-col gap-2">
                          {filteredQuotes.map((q) => (
                            <button
                              key={q.id}
                              type="button"
                              onClick={() => handleAddQuotePage(q)}
                              class="text-left flex items-start gap-3 p-3 rounded-2xl border border-gray-200 hover:border-[#9B51E0] hover:bg-[#9B51E0]/5 transition-colors"
                            >
                              {q.child?.avatar_url
                                ? (
                                  <img
                                    src={q.child.avatar_url}
                                    alt={q.child.name}
                                    class="w-9 h-9 rounded-full object-cover shrink-0"
                                  />
                                )
                                : (
                                  <div class="w-9 h-9 rounded-full bg-[#9B51E0]/10 text-[#9B51E0] flex items-center justify-center shrink-0">
                                    <Icon
                                      name="chatbubble-ellipses-outline"
                                      class="text-base"
                                    />
                                  </div>
                                )}
                              <span class="min-w-0">
                                <span class="block text-sm font-semibold text-gray-900 truncate">
                                  {q.child?.nickname || q.child?.name || "Babbl"}
                                </span>
                                <span class="block text-sm text-gray-600 line-clamp-2">
                                  "{q.text}"
                                </span>
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                )}
            </div>
            <div class="shrink-0 px-6 pt-4 pb-28 sm:pb-4 border-t border-gray-100 bg-white">
              <button
                type="button"
                onClick={() => setIsAddQuoteOpen(false)}
                class="w-full py-3.5 rounded-2xl font-bold text-[#9B51E0] bg-[#9B51E0]/10 hover:bg-[#9B51E0]/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Review Overlay Modal */}
      {(isCheckoutModalOpen || isNativeCheckoutRunning) && (
        <>
          <style>
            {`
            @keyframes sheetSlideUp {
              from { transform: translateY(100%); }
              to { transform: translateY(0); }
            }
            @keyframes overlayFadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .animate-sheet { animation: sheetSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            .animate-overlay { animation: overlayFadeIn 0.25s ease-out forwards; }
            `}
          </style>

          <div
            class={`fixed inset-0 bg-white/10 backdrop-blur-md flex justify-center transition-all animate-overlay font-rosario ${
              checkoutWarning
                ? "items-center p-6"
                : "items-end sm:items-center sm:p-6 p-0"
            }`}
            style={{ zIndex: 9999 }}
          >
            {isCheckoutModalOpen && (
              <div
                class={`bg-white shadow-[0_50px_120px_-15px_rgba(0,0,0,0.85)] overflow-hidden animate-sheet border border-gray-100 ${
                  checkoutWarning
                    ? "rounded-3xl w-full max-w-md"
                    : "w-full max-w-lg flex flex-col h-[100dvh] sm:h-auto sm:max-h-full"
                }`}
              >
                {checkoutWarning
                  ? (
                    <div class="p-8 text-center pb-16 sm:pb-8">
                      <div class="w-16 h-16 bg-[#9B51E0]/10 rounded-full flex items-center justify-center mx-auto mb-5 border border-[#9B51E0]/20">
                        <Icon
                          name="lock-closed-outline"
                          class="text-3xl text-[#9B51E0]"
                        />
                      </div>
                      <h2 class="text-2xl font-bold text-gray-900 mb-2">
                        Not Quite Ready!
                      </h2>
                      <p class="text-gray-600 mb-8 text-base">
                        {checkoutWarning}
                      </p>
                      <div class="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setIsCheckoutModalOpen(false)}
                          class="flex-1 py-4 bg-[#9B51E0] text-white font-bold rounded-2xl shadow-md hover:bg-[#8A44C8] transition-colors"
                        >
                          Keep Building
                        </button>
                      </div>
                    </div>
                  )
                  : (
                    <>
                    <div class="flex justify-between items-start px-6 pt-6 pb-6 sm:px-8 sm:pt-8 shrink-0">
                      <h2 class="text-2xl font-bold text-gray-900 tracking-tight">
                        Review Order
                      </h2>
                      <button
                        type="button"
                        onClick={() => setIsCheckoutModalOpen(false)}
                        class="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
                      >
                        <Icon name="close" class="text-xl" />
                      </button>
                    </div>

                    <div class="px-6 sm:px-8 pb-6 sm:pb-8 overflow-y-auto min-h-0 flex-1">

                      <div class="flex items-start gap-4 mb-8">
                        <div
                          class="w-24 h-24 sm:w-32 sm:h-32 shrink-0 bg-gray-50 overflow-hidden shadow-sm border border-gray-200 relative"
                          style={{
                            borderRadius: format === "mini" ? "12px" : "8px",
                          }}
                        >
                          <div
                            class="absolute top-0 left-0"
                            style={{
                              transform: `scale(${
                                128 / (dimensions.widthInches * 96)
                              })`,
                              transformOrigin: "top left",
                              width: dimensions.widthInches * 96,
                              height: dimensions.heightInches * 96,
                            }}
                          >
                            <PageRenderer
                              format={format}
                              page={localPages[0]}
                              themeId={themeId}
                              yearRange={yearRange}
                              childrenProfiles={uniqueChildren}
                              hideBleed={isPrintMode}
                            />
                          </div>
                        </div>
                        <div class="flex-1">
                          <h3 class="font-bold text-lg text-gray-900 mb-1 leading-snug">
                            {localPages[0].title || "My Babbl Book"}
                          </h3>
                          <p class="text-gray-500 text-sm mb-1.5">
                            {format === "mini"
                              ? "5.5x5.5 Softcover"
                              : "8x8 Hardcover"} •
                            {" "}
                            {quoteCount} Babbl{quoteCount !== 1 ? "s" : ""}
                          </p>

                          <div class="mt-2 inline-flex items-start gap-1.5 bg-[#9B51E0]/10 text-[#9B51E0] border border-[#9B51E0]/20 px-2 py-1.5 rounded-lg text-xs leading-snug">
                            <Icon
                              name="information-circle"
                              class="text-sm mt-0.5 shrink-0"
                            />
                            <span>
                              Prints {format === "mini" ? "softcover" : "hardcover"} with
                              at least 32 pages: cover, blank endpapers,
                              your Babbls, Notes pages (after the last Babbl),
                              and the back cover.
                              {printedNotesPages > 0
                                ? ` ${printedNotesPages} Notes page${printedNotesPages !== 1 ? "s" : ""} right now — they're removed automatically as you add Babbls.`
                                : ""}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div class="flex items-center justify-between py-4 border-y border-gray-100 mb-6">
                        <div class="flex flex-col">
                          <span class="font-bold text-gray-900">Quantity</span>
                          <span class="text-xs text-gray-500">Order multiple copies</span>
                        </div>
                        <div class="flex items-center gap-4 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                          <button
                            type="button"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            disabled={quantity <= 1}
                            class="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 hover:text-[#9B51E0] disabled:opacity-30 transition-all border border-gray-100 active:scale-95"
                          >
                            <Icon name="remove-outline" class="text-lg" />
                          </button>
                          <span class="font-black text-xl w-8 text-center text-gray-900">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQuantity(quantity + 1)}
                            class="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 hover:text-[#9B51E0] transition-all border border-gray-100 active:scale-95"
                          >
                            <Icon name="add-outline" class="text-lg" />
                          </button>
                        </div>
                      </div>

                      <div class="mb-6" ref={addressSectionRef}>
                        <span class="font-bold text-gray-900">
                          Shipping Address
                        </span>
                        <p class="text-xs text-gray-500 mt-0.5 mb-3">
                          Where should we send your book?
                        </p>
                        <div class="space-y-2.5">
                          <div class="flex gap-2.5">
                            <input
                              type="text"
                              value={shippingForm.firstName}
                              onInput={(e) =>
                                setShippingForm({
                                  ...shippingForm,
                                  firstName: (e.target as HTMLInputElement).value,
                                })}
                              placeholder="First name"
                              autoComplete="given-name"
                              class={`${addressInputClass} flex-1 min-w-0`}
                            />
                            <input
                              type="text"
                              value={shippingForm.lastName}
                              onInput={(e) =>
                                setShippingForm({
                                  ...shippingForm,
                                  lastName: (e.target as HTMLInputElement).value,
                                })}
                              placeholder="Last name"
                              autoComplete="family-name"
                              class={`${addressInputClass} flex-1 min-w-0`}
                            />
                          </div>
                          <input
                            type="text"
                            value={shippingForm.addressLine1}
                            onInput={(e) =>
                              setShippingForm({
                                ...shippingForm,
                                addressLine1: (e.target as HTMLInputElement).value,
                              })}
                            placeholder="Street address"
                            autoComplete="address-line1"
                            class={`${addressInputClass} w-full`}
                          />
                          <input
                            type="text"
                            value={shippingForm.addressLine2}
                            onInput={(e) =>
                              setShippingForm({
                                ...shippingForm,
                                addressLine2: (e.target as HTMLInputElement).value,
                              })}
                            placeholder="Apt, suite, unit (optional)"
                            autoComplete="address-line2"
                            class={`${addressInputClass} w-full`}
                          />
                          <div class="flex gap-2.5">
                            <input
                              type="text"
                              value={shippingForm.city}
                              onInput={(e) =>
                                setShippingForm({
                                  ...shippingForm,
                                  city: (e.target as HTMLInputElement).value,
                                })}
                              placeholder="City"
                              autoComplete="address-level2"
                              class={`${addressInputClass} min-w-0 flex-1`}
                            />
                            <input
                              type="text"
                              value={shippingForm.state}
                              onInput={(e) =>
                                setShippingForm({
                                  ...shippingForm,
                                  state: (e.target as HTMLInputElement).value,
                                })}
                              placeholder="State"
                              autoComplete="address-level1"
                              class={`${addressInputClass} w-24 shrink-0`}
                            />
                            <input
                              type="text"
                              value={shippingForm.postcode}
                              onInput={(e) =>
                                setShippingForm({
                                  ...shippingForm,
                                  postcode: (e.target as HTMLInputElement).value,
                                })}
                              placeholder="ZIP"
                              autoComplete="postal-code"
                              class={`${addressInputClass} w-28 shrink-0`}
                            />
                          </div>
                          <div class="flex gap-2.5">
                            <select
                              value={shippingForm.country}
                              onInput={(e) =>
                                setShippingForm({
                                  ...shippingForm,
                                  country: (e.target as HTMLSelectElement).value,
                                })}
                              onChange={(e) =>
                                setShippingForm({
                                  ...shippingForm,
                                  country: (e.target as HTMLSelectElement).value,
                                })}
                              autoComplete="country"
                              class={`${addressInputClass} w-40 shrink-0 appearance-none`}
                            >
                              <option value="US">United States</option>
                              <option value="CA">Canada</option>
                              <option value="GB">United Kingdom</option>
                              <option value="AU">Australia</option>
                              <option value="NZ">New Zealand</option>
                              <option value="IE">Ireland</option>
                              <option value="DE">Germany</option>
                              <option value="FR">France</option>
                              <option value="ES">Spain</option>
                              <option value="IT">Italy</option>
                              <option value="NL">Netherlands</option>
                              <option value="BE">Belgium</option>
                              <option value="AT">Austria</option>
                              <option value="CH">Switzerland</option>
                              <option value="SE">Sweden</option>
                              <option value="NO">Norway</option>
                              <option value="DK">Denmark</option>
                              <option value="FI">Finland</option>
                              <option value="PT">Portugal</option>
                              <option value="PL">Poland</option>
                              <option value="JP">Japan</option>
                            </select>
                            <input
                              type="tel"
                              value={shippingForm.phone}
                              onInput={(e) =>
                                setShippingForm({
                                  ...shippingForm,
                                  phone: (e.target as HTMLInputElement).value,
                                })}
                              placeholder="Phone (optional)"
                              autoComplete="tel"
                              class={`${addressInputClass} min-w-0 flex-1`}
                            />
                          </div>
                        </div>
                        {addressError && (
                          <p class="mt-2.5 text-xs font-medium text-red-500">
                            {addressError}
                          </p>
                        )}
                      </div>

                      <div class="bg-gray-50/80 rounded-2xl p-5 mb-8 border border-gray-200/60 shadow-sm">
                        {isQuoting
                          ? (
                            <div class="space-y-4">
                              <div class="flex justify-between items-center">
                                <div class="h-4 w-20 bg-gray-200 animate-pulse rounded">
                                </div>
                                <div class="h-4 w-12 bg-gray-200 animate-pulse rounded">
                                </div>
                              </div>
                              <div class="flex justify-between items-center">
                                <div class="h-4 w-28 bg-gray-200 animate-pulse rounded">
                                </div>
                                <div class="h-4 w-10 bg-gray-200 animate-pulse rounded">
                                </div>
                              </div>
                              <div class="h-px w-full bg-gray-300" />
                              <div class="flex justify-between items-center">
                                <div class="h-6 w-16 bg-gray-200 animate-pulse rounded">
                                </div>
                                <div class="h-6 w-20 bg-[#9B51E0]/20 animate-pulse rounded">
                                </div>
                              </div>
                            </div>
                          )
                          : (
                            <>
                              <div class="flex justify-between items-center mb-3">
                                <span class="text-gray-600 font-medium">
                                  Printing & Production
                                </span>
                                <span class="font-bold text-gray-900">
                                  ${(parseFloat(checkoutQuote?.print || "0") *
                                    quantity).toFixed(2)}
                                </span>
                              </div>
                              <div class="flex justify-between items-center mb-4">
                                <span class="text-gray-600 font-medium">
                                  Standard Shipping
                                </span>
                                <span class="font-bold text-gray-900">
                                  ${(parseFloat(checkoutQuote?.shipping || "0") *
                                    quantity).toFixed(2)}
                                </span>
                              </div>
                              <div class="h-px w-full bg-gray-300 mb-4" />
                              <div class="flex justify-between items-center">
                                <span class="font-black text-gray-900 text-lg">
                                  Total
                                </span>
                                <span class="font-black text-2xl text-[#9B51E0]">
                                  ${(parseFloat(checkoutQuote?.price || "0")).toFixed(2)}
                                </span>
                              </div>
                            </>
                          )}
                      </div>

                    </div>

                    <div class="relative shrink-0 px-6 sm:px-8 pb-16 sm:pb-8">
                      <div class="pointer-events-none absolute inset-x-0 -top-10 h-10 -mx-6 sm:-mx-8 bg-gradient-to-t from-white to-transparent" />
                      <button
                        type="button"
                        disabled={isQuoting}
                        onClick={confirmOrderAndTriggerCheckout}
                        class={`w-full h-14 text-white font-bold rounded-2xl shadow-md transition-transform active:scale-[0.98] flex items-center justify-center gap-2 ${
                          isQuoting
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-[#9B51E0] hover:bg-[#8A44C8] hover:shadow-lg"
                        }`}
                      >
                        <Icon name="card-outline" class="text-xl -mt-0.5" />
                        {isQuoting
                          ? "Calculating Pricing..."
                          : "Continue to Payment"}
                      </button>
                    </div>
                    </>
                  )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

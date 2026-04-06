import { JSX } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { createClient } from "@supabase/supabase-js";
import {
  BOOK_DIMENSIONS,
  BookFormat,
  BookPageData,
} from "../routes/apps/babbl/book/_data.ts";
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
}

interface BookEditorProps {
  initialFormat?: BookFormat;
  initialTheme?: string;
  pages: BookPageData[];
  bookId: string;
  token: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
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

const SVG_ICONS: Record<string, (props: JSX.SVGAttributes<SVGSVGElement>) => JSX.Element> = {
  "babbl-bubble-icon": (props) => (
    <svg {...props} fill="none" viewBox="0 0 40 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 0C31.0457 1.5839e-05 40 6.96939 40 15.5664C40 21.7578 36.1305 25.2735 31.4756 27.4033L32.9131 30.0029C33.3859 30.8586 32.4767 31.8144 31.5986 31.3848L26.8613 29.0635C24.5828 29.7099 22.3493 30.1438 20.4814 30.4932C5.66259 33.2649 5.04334e-05 24.1633 0 15.5664C0 6.96938 4.69879 0 20 0Z" fill="currentColor"/>
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
};

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

  return (
    <div
      class={`inline-flex items-center justify-center ${className || ""}`}
      style={style}
    >
      <ion-icon name={name} style="font-size: inherit;" />
    </div>
  );
}

function CustomSelect(
  { value, options, onChange, icon, placeholder, disabled, openDirection = "up" }: CustomSelectProps,
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
        class={`w-full h-14 flex items-center bg-white/80 backdrop-blur-md border border-gray-200/50 text-gray-700 px-10 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#9B51E0] transition-all ${
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
        <div class={`absolute ${openDirection === "up" ? "bottom-full mb-2" : "top-full mt-2"} left-0 w-full bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden`}>
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
  }: BookEditorProps,
) {
  const [format, setFormat] = useState<BookFormat>(initialFormat);
  const [themeId, setThemeId] = useState(initialTheme);
  const [currentPageIndex, setCurrentPageIndex] = useState(() => {
    if (typeof sessionStorage !== "undefined") {
      const saved = sessionStorage.getItem(`bookEditorPageIndex_${bookId}`);
      if (saved) return parseInt(saved, 10);
    }
    return 0;
  });

  useEffect(() => {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(`bookEditorPageIndex_${bookId}`, currentPageIndex.toString());
    }
  }, [currentPageIndex, bookId]);

  // Initialize Supabase client locally in the island to avoid server-only dependencies
  const [supabase] = useState(() =>
    createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    })
  );

  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const touchStartX = useRef(0);
  const [animating, setAnimating] = useState(false);
  const [animationClass, setAnimationClass] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Local state for optimistic UI updates
  const [localPages, setLocalPages] = useState<BookPageData[]>(pages);

  const dimensions = BOOK_DIMENSIONS[format];

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
    const childrenMap = new Map<string, { id: string; name: string; avatar_url?: string }>();
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

  useEffect(() => {
    if (!containerRef.current) return;

    const updateScale = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const physicalWidthPx = dimensions.widthInches * 96;
        const physicalHeightPx = dimensions.heightInches * 96;

        const availableHeight = height - 12;
        const availableWidth = width - 4;

        const scaleW = availableWidth / physicalWidthPx;
        const scaleH = availableHeight / physicalHeightPx;

        // Fit to the smaller dimension
        const newScale = Math.min(scaleW, scaleH);

        setScale(newScale);
      }
    };

    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [format, dimensions.widthInches, dimensions.heightInches]);

  const goToNextPage = () => {
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
    { label: "Circle Image", value: "circle_image", icon: "image-outline" },
    { label: "Quote top, image bottom", value: "quote_top_image_bottom", icon: "reorder-two-outline" },
    { label: "Full page photo, quote centered", value: "full_page_photo_quote_centered", icon: "image-outline" },
    { label: "Full width photo top, quote bottom", value: "full_width_photo_top_quote_bottom", icon: "reorder-two-outline" },
    { label: "Full screen photo, short quote", value: "full_screen_photo_short_quote", icon: "image-outline" },
    { label: "Photo window top, quote bottom", value: "photo_window_top_quote_bottom", icon: "image-outline" },
    { label: "Quote only, centered", value: "quote_only_centered", icon: "text-outline" },
  ];

  const allowsContextToggle = ["quote_top_image_bottom", "full_page_photo_quote_centered", "quote_only_centered"].includes(effectiveLayoutStyle) && !!currentPage.quote?.context;

  return (
    <div class="flex flex-col items-center w-full h-full bg-[#FDFDFD] overflow-hidden font-['Rosario']">
      {/* HEADER: Format Toggle */}
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
            <div class="flex flex-col items-start leading-none justify-center">
              <span>Mini</span>
              <span class="text-[10px] opacity-70">5.5x5.5"</span>
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
            <div class="flex flex-col items-start leading-none justify-center">
              <span>Classic</span>
              <span class="text-[10px] opacity-70">8x8"</span>
            </div>
          </button>
        </div>
      </header>

      {/* MID: Book Canvas */}
      <div
        ref={containerRef}
        class="flex-1 w-full flex items-center justify-center relative overflow-visible px-4"
        style={{ touchAction: "pan-y" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          class={`relative shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] bg-white ${animationClass} ${isMounted ? "transition-all duration-300" : ""}`}
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
            <PageRenderer
              page={{
                ...localPages[currentPageIndex],
                layout_style: effectiveLayoutStyle,
              }}
              format={format}
              themeId={themeId}
              yearRange={yearRange}
              childrenProfiles={uniqueChildren}
            />
          </div>
        </div>
      </div>

      {/* FOOTER: Controls (No Background) */}
      <footer class="w-full max-w-xl px-6 pt-4 pb-12 flex flex-col gap-4 relative z-50 shrink-0">
        {/* Selectors Row */}
        {!isCoverOrBackCover && (
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
                <span class="text-sm font-bold text-gray-700 capitalize">Context</span>
                <div class="relative inline-flex items-center">
                  <input 
                    type="checkbox" 
                    class="sr-only peer" 
                    checked={currentPage.show_context !== false}
                    onChange={(e) => handleContextChange((e.target as HTMLInputElement).checked)}
                  />
                  <div class="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[16px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9B51E0]"></div>
                </div>
              </label>
            )}
          </div>
        )}

        {/* Pagination Row */}
        <div class="flex items-center justify-between gap-2 w-full">
          <div class="flex-1 flex items-center bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-sm h-14 overflow-hidden min-w-0">
            <button
              type="button"
              onClick={goToPrevPage}
              disabled={currentPageIndex === 0}
              class="w-12 md:flex-1 shrink-0 h-full flex items-center justify-center text-gray-700 hover:bg-[#9B51E0]/5 hover:text-[#9B51E0] disabled:opacity-20 transition-all active:bg-[#9B51E0]/10 border-r border-gray-100/50"
              aria-label="Previous Page"
            >
              <Icon name="chevron-back-outline" />
            </button>
            <div class="flex-1 flex items-center justify-center h-full min-w-16 px-2 truncate">
               <span class="text-xs font-bold text-gray-700 whitespace-nowrap">
                  {currentPageIndex + 1} / {localPages.length}
               </span>
            </div>
            <button
              type="button"
              onClick={goToNextPage}
              disabled={currentPageIndex === localPages.length - 1}
              class="w-12 md:flex-1 shrink-0 h-full flex items-center justify-center text-gray-700 hover:bg-[#9B51E0]/5 hover:text-[#9B51E0] disabled:opacity-20 transition-all active:bg-[#9B51E0]/10 border-l border-gray-100/50"
              aria-label="Next Page"
            >
              <Icon name="chevron-forward-outline" />
            </button>
          </div>
        </div>

        {/* Status */}
      </footer>
    </div>
  );
}

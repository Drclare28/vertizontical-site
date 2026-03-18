import { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
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
}

const SVG_ICONS: Record<string, (props: any) => JSX.Element> = {
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
  { value, options, onChange, icon, placeholder, disabled }: CustomSelectProps,
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
        class={`w-full flex items-center bg-white/80 backdrop-blur-md border border-gray-200/50 text-gray-700 py-3 pl-10 pr-10 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#9B51E0] transition-all ${
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
        <div class="absolute bottom-full mb-2 left-0 w-full bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div class="max-h-60 overflow-y-auto py-2">
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
    initialTheme = "playful_pastel",
    pages,
    bookId,
    token,
    supabaseUrl,
    supabaseAnonKey,
  }: BookEditorProps,
) {
  const [format, setFormat] = useState<BookFormat>(initialFormat);
  const [themeId, setThemeId] = useState(initialTheme);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

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
  const [isSaving, setIsSaving] = useState(false);

  // Local state for optimistic UI updates
  const [localPages, setLocalPages] = useState<BookPageData[]>(pages);

  const dimensions = BOOK_DIMENSIONS[format];

  // Sync with props if they change from parent
  useEffect(() => {
    setLocalPages(pages);
  }, [pages.length]);

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
    setIsSaving(true);
    try {
      const { error } = await supabase.from("books").update({
        theme_id: newThemeId,
      }).eq("id", bookId);
      if (error) throw error;
    } catch (err) {
      console.error("Save Theme Error:", err);
      setThemeId(themeId);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLayoutChange = async (newLayout: string) => {
    const currentPage = localPages[currentPageIndex];
    if (!currentPage.quote) return;
    const updatedPages = [...localPages];
    const originalLayout = updatedPages[currentPageIndex].layout_style;
    updatedPages[currentPageIndex].layout_style = newLayout;
    setLocalPages(updatedPages);
    setIsSaving(true);
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
    } finally {
      setIsSaving(false);
    }
  };

  const currentPage = localPages[currentPageIndex];
  const isCover = currentPage.layout_style === "cover" ||
    currentPage.layout_style === "back_cover";

  const themeOptions = [
    {
      label: "Playful Pastel",
      value: "playful_pastel",
      icon: "color-wand-outline",
    },
    {
      label: "Classic Minimal",
      value: "classic_minimal",
      icon: "pencil-outline",
    },
    { label: "Deep Night", value: "deep_night", icon: "moon-outline" },
  ];

  const layoutOptions = [
    { label: "Quote Only", value: "single_quote_large", icon: "text-outline" },
    {
      label: "Quote + Avatar",
      value: "quote_with_avatar",
      icon: "person-circle-outline",
    },
    {
      label: "Split Quote",
      value: "text_only_split",
      icon: "reorder-two-outline",
    },
    {
      label: "Full Page Photo",
      value: "full_page_photo",
      icon: "image-outline",
    },
    { label: "Circles Layout", value: "circles", icon: "apps-outline" },
    {
      label: "Rounded Rectangles",
      value: "rounded_rectangles",
      icon: "square-outline",
    },
  ];

  return (
    <div class="flex flex-col items-center w-full h-full bg-[#FDFDFD] overflow-hidden font-['Rosario']">
      {/* HEADER: Format Toggle */}
      <header class="w-full px-6 pt-4 pb-2 flex justify-end items-center relative z-50 shrink-0">
        <div class="flex bg-gray-100/50 backdrop-blur-sm p-1 rounded-2xl shadow-inner border border-gray-200/50">
          <button
            type="button"
            onClick={() => setFormat("mini")}
            class={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              format === "mini"
                ? "bg-white text-[#9B51E0] shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Icon name="book-outline" style={{ fontSize: "14px" }} />
            <div class="flex flex-col items-start leading-tight">
              <span>Mini</span>
              <span class="text-[11px] opacity-70">5.5x5.5"</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setFormat("classic")}
            class={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              format === "classic"
                ? "bg-white text-[#9B51E0] shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Icon name="book-outline" style={{ fontSize: "22px" }} />
            <div class="flex flex-col items-start leading-tight">
              <span>Classic</span>
              <span class="text-[11px] opacity-70">8x8"</span>
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
          class={`relative shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-300 bg-white ${animationClass}`}
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
              page={localPages[currentPageIndex]}
              format={format}
              themeId={themeId}
            />
          </div>
        </div>
      </div>

      {/* FOOTER: Controls (No Background) */}
      <footer class="w-full max-w-xl px-6 pt-4 pb-6 flex flex-col gap-6 relative z-50 shrink-0">
        {/* Selectors Row */}
        <div class="flex gap-4">
          <CustomSelect
            value={themeId}
            options={themeOptions}
            onChange={handleThemeChange}
            icon="color-palette-outline"
            placeholder="Select Theme"
          />

          {!isCover && (
            <CustomSelect
              value={currentPage.layout_style}
              options={layoutOptions}
              onChange={handleLayoutChange}
              icon="grid-outline"
              placeholder="Select Layout"
            />
          )}
          {isCover && (
            <div class="flex-1 flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-white/80 backdrop-blur-md rounded-xl border border-gray-100/30">
              Cover Content
            </div>
          )}
        </div>

        {/* Pagination Row */}
        <div class="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={goToPrevPage}
            disabled={currentPageIndex === 0}
            class="flex-1 h-14 flex items-center justify-center gap-2 bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-2xl text-gray-700 font-bold disabled:opacity-20 shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <Icon name="chevron-back-outline" />
            Prev
          </button>

          <div class="px-5 py-2 bg-white/80 backdrop-blur-md rounded-xl text-xs font-bold text-gray-500 shadow-sm border border-gray-100/50">
            {currentPageIndex + 1} / {localPages.length}
          </div>

          <button
            type="button"
            onClick={goToNextPage}
            disabled={currentPageIndex === localPages.length - 1}
            class="flex-1 h-14 flex items-center justify-center gap-2 bg-[#9B51E0] text-white rounded-2xl font-bold disabled:opacity-20 shadow-lg shadow-purple-200 hover:shadow-xl transition-all active:scale-95 hover:bg-[#8A46D0]"
          >
            Next
            <Icon name="chevron-forward-outline" />
          </button>
        </div>

        {/* Status */}
        <div
          class={`text-center text-[9px] font-bold text-[#9B51E0] uppercase tracking-widest transition-opacity h-2 ${
            isSaving ? "opacity-100" : "opacity-0"
          }`}
        >
          Saving changes...
        </div>
      </footer>
    </div>
  );
}

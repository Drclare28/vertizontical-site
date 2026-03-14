import { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { createClient } from "@supabase/supabase-js";
import { BOOK_DIMENSIONS, BookFormat, BookPageData } from "../_data.ts";
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

const FALLBACK_ICONS: Record<string, JSX.Element> = {
  "color-wand-outline": (
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
      />
    </svg>
  ),
  "chevron-down-outline": (
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M19 9l-7 7-7-7"
      />
    </svg>
  ),
  "chevron-up-outline": (
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M5 15l7-7 7 7"
      />
    </svg>
  ),
};

function Icon({ name, class: className, style }: {
  name: string;
  class?: string;
  style?: JSX.CSSProperties | string;
}) {
  return (
    <div
      class={`inline-flex items-center justify-center ${className}`}
      style={style}
    >
      <ion-icon
        name={name}
        class="peer"
        style="font-size: inherit; visibility: visible;"
      >
      </ion-icon>
      {/* Fallback only shows if ion-icon is NOT hydrated */}
      <div class="hidden [ion-icon:not(.hydrated)+&]:block peer-[.hydrated]:hidden pointer-events-none">
        {FALLBACK_ICONS[name] || null}
      </div>
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
        class={`w-full flex items-center bg-white/10 backdrop-blur-sm border border-gray-200/50 text-gray-700 py-3 pl-10 pr-10 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#9B51E0] transition-all ${
          disabled
            ? "opacity-30 cursor-not-allowed"
            : "cursor-pointer hover:bg-white/20"
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
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none"
        />
      </button>

      {isOpen && !disabled && (
        <div class="absolute bottom-full mb-2 left-0 w-full bg-white border border-gray-200 rounded-2xl shadow-2xl z-100 overflow-hidden animate-slide-up">
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
                <Icon name={opt.icon} class="text-lg" />
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

        const availableHeight = height - 10;
        const availableWidth = width;

        const scaleW = availableWidth / physicalWidthPx;
        const scaleH = availableHeight / physicalHeightPx;

        const newScale = Math.min(scaleW, scaleH);
        if (newScale > 0) {
          setScale(newScale);
        }
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
      <header class="w-full px-6 pt-4 pb-2 flex justify-end z-30">
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
              <span class="text-[9px] opacity-60">5.5x5.5"</span>
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
            <Icon name="book" style={{ fontSize: "18px" }} />
            <div class="flex flex-col items-start leading-tight">
              <span>Classic</span>
              <span class="text-[9px] opacity-60">8x8"</span>
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
      <footer class="w-full max-w-xl px-6 pt-4 pb-10 flex flex-col gap-6 z-40">
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
            <div class="flex-1 flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-white/40 backdrop-blur-[2px] rounded-xl border border-gray-100/30">
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

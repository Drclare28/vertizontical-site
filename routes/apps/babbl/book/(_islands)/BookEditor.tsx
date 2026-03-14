import { useEffect, useRef, useState } from "preact/hooks";
import { BOOK_DIMENSIONS, BookFormat, BookPageData } from "../_data.ts";
import PageRenderer from "./PageRenderer.tsx";

interface BookEditorProps {
  initialFormat?: BookFormat;
  initialTheme?: string;
  pages: BookPageData[];
}

export default function BookEditor(
  { initialFormat = "mini", initialTheme = "playful_pastel", pages }:
    BookEditorProps,
) {
  const [format, setFormat] = useState<BookFormat>(initialFormat);
  const [themeId] = useState(initialTheme);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const dimensions = BOOK_DIMENSIONS[format];

  useEffect(() => {
    if (!containerRef.current) return;

    const updateScale = (width: number, height: number) => {
      const physicalWidthPx = dimensions.widthInches * 96;
      const physicalHeightPx = dimensions.heightInches * 96;

      if (width > 0 && height > 0) {
        // Reserve space for controls (top: 80px, bottom: 80px)
        const availableHeight = height - 160;
        const availableWidth = width * 0.95;

        const scaleW = availableWidth / physicalWidthPx;
        const scaleH = availableHeight / physicalHeightPx;

        setScale(Math.min(scaleW, scaleH));
      }
    };

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        updateScale(entry.contentRect.width, entry.contentRect.height);
      }
    });

    observer.observe(document.body);
    return () => observer.disconnect();
  }, [format, dimensions.widthInches, dimensions.heightInches]);

  const goToNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex((prev) => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex((prev) => prev - 1);
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === 0 || touchEndX.current === 0) return;

    const swipeDistance = touchStartX.current - touchEndX.current;

    // Swipe Left
    if (swipeDistance > 50) {
      goToNextPage();
    }

    // Swipe Right
    if (swipeDistance < -50) {
      goToPrevPage();
    }

    // Reset values
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <div class="flex flex-col items-center justify-between w-full h-screen bg-white py-4 overflow-hidden">
      {/* 1. Header/Controls */}
      <div class="mt-4 flex flex-col items-center gap-4 z-10">
        <div class="flex gap-3 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 shadow-sm">
          <button
            type="button"
            onClick={() => setFormat("mini")}
            class={`px-6 py-2 rounded-xl text-sm font-bold transition-all font-['Rosario'] ${
              format === "mini"
                ? "bg-[#9B51E0] text-white shadow-md"
                : "text-[#9B9B9B]"
            }`}
          >
            MINI
          </button>
          <button
            type="button"
            onClick={() => setFormat("classic")}
            class={`px-6 py-2 rounded-xl text-sm font-bold transition-all font-['Rosario'] ${
              format === "classic"
                ? "bg-[#9B51E0] text-white shadow-md"
                : "text-[#9B9B9B]"
            }`}
          >
            CLASSIC
          </button>
        </div>
      </div>

      {/* 2. Book Preview Area */}
      <div
        ref={containerRef}
        class="flex-1 w-full flex flex-col items-center justify-center relative overflow-visible"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* The Box that represents the visible book area */}
        <div
          class="relative shadow-2xl transition-all duration-300"
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
              page={pages[currentPageIndex]}
              format={format}
              themeId={themeId}
            />
          </div>
        </div>
      </div>

      {/* 3. Footer/Pagination Controls */}
      <div class="mb-8 flex flex-col items-center gap-4 w-full px-6 z-10 pb-10 pb-safe">
        <div class="flex items-center justify-between w-full max-w-md gap-4">
          <button
            type="button"
            onClick={goToPrevPage}
            disabled={currentPageIndex === 0}
            class="h-12 px-8 bg-[#9B51E0] text-white rounded-2xl font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#8244bd] active:scale-95 transition-all shadow-md flex-1 font-['Rosario']"
          >
            Previous
          </button>

          <div class="text-[#9B9B9B] font-bold text-sm bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 whitespace-nowrap font-['Rosario']">
            {currentPageIndex + 1} / {pages.length}
          </div>

          <button
            type="button"
            onClick={goToNextPage}
            disabled={currentPageIndex === pages.length - 1}
            class="h-12 px-8 bg-[#9B51E0] text-white rounded-2xl font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#8244bd] active:scale-95 transition-all shadow-md flex-1 font-['Rosario']"
          >
            Next
          </button>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
      `,
        }}
      />
    </div>
  );
}

import { useEffect, useRef, useState } from "preact/hooks";
import { BOOK_DIMENSIONS, BookFormat, BookPageData, THEMES } from "../_data.ts";
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
  const [themeId, setThemeId] = useState(initialTheme);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const dimensions = BOOK_DIMENSIONS[format];

  // Calculate scale to fit the physical dimension within the available browser window width
  useEffect(() => {
    if (!containerRef.current) return;

    const updateScale = (width: number) => {
      const physicalWidthPx = dimensions.widthInches * 96;

      if (width > 0) {
        // Target 95% of the available width for maximum visibility
        const targetWidth = width * 0.95;
        setScale(targetWidth / physicalWidthPx);
      }
    };

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        updateScale(entry.contentRect.width);
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [format, dimensions.widthInches]);

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

  return (
    <div class="flex flex-col items-center w-full min-h-screen bg-transparent py-8">
      {/* Top Control Bar */}
      <div class="mb-6 flex flex-wrap gap-4 bg-white p-4 rounded-xl shadow-sm z-10 mx-auto">
        <div class="flex items-center gap-2">
          <label class="text-sm font-semibold text-gray-700">Format:</label>
          <select
            class="border rounded px-3 py-1 bg-gray-50 text-gray-800"
            value={format}
            onChange={(e) => setFormat(e.currentTarget.value as BookFormat)}
          >
            <option value="mini">Mini (5.5" x 5.5")</option>
            <option value="classic">Classic (8" x 8")</option>
          </select>
        </div>

        <div class="flex items-center gap-2 border-l pl-4">
          <label class="text-sm font-semibold text-gray-700">Theme:</label>
          <select
            class="border rounded px-3 py-1 bg-gray-50 text-gray-800"
            value={themeId}
            onChange={(e) => setThemeId(e.currentTarget.value)}
          >
            {Object.values(THEMES).map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Book Preview Area */}
      <div
        ref={containerRef}
        class="relative w-full px-4 flex flex-col items-center overflow-visible"
      >
        {
          /*
          This wrapper maintains the scaled height/width in the normal document flow
          so the pagination buttons sit correctly below it.
        */
        }
        <div
          class="relative flex justify-center"
          style={{
            width: "100%",
            height: `${dimensions.heightInches * 96 * scale}px`,
            transition: "height 0.2s",
          }}
        >
          {
            /*
            The actual physical page, scaled down via transform to fit the wrapper
          */
          }
          <div
            class="shadow-2xl"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top center",
              transition: "transform 0.2s ease-out",
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

      {/* Pagination Controls */}
      <div class="mt-8 flex flex-wrap sm:flex-nowrap items-center justify-center gap-4 sm:gap-6 z-10 w-full px-4">
        <button
          type="button"
          onClick={goToPrevPage}
          disabled={currentPageIndex === 0}
          class="px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors shadow flex-1 sm:flex-none text-center"
        >
          Previous
        </button>
        <span class="text-gray-600 font-medium whitespace-nowrap order-first sm:order-0 w-full sm:w-auto text-center mb-2 sm:mb-0">
          Page {currentPageIndex + 1} of {pages.length}
        </span>
        <button
          type="button"
          onClick={goToNextPage}
          disabled={currentPageIndex === pages.length - 1}
          class="px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors shadow flex-1 sm:flex-none text-center"
        >
          Next
        </button>
      </div>
    </div>
  );
}

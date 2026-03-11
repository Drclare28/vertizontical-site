import { useEffect, useRef, useState } from "preact/hooks";
import { BOOK_DIMENSIONS, BookFormat, BookPageData } from "../_data.ts";
import PageRenderer from "./PageRenderer.tsx";

interface BookEditorProps {
  initialFormat?: BookFormat;
  pages: BookPageData[];
}

export default function BookEditor(
  { initialFormat = "mini", pages }: BookEditorProps,
) {
  const [format, setFormat] = useState<BookFormat>(initialFormat);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const dimensions = BOOK_DIMENSIONS[format];

  // Calculate scale to fit the physical dimension within the available browser window width
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth;
      // 96 DPI is standard for physical CSS units (in)
      const physicalWidthPx = dimensions.widthInches * 96;

      if (containerWidth > 0 && physicalWidthPx > containerWidth) {
        // Scale down if the physical size is larger than available width
        // We use a small buffer (32px for the px-4 padding)
        const availableWidth = containerWidth - 32;
        setScale(Math.max(0.1, availableWidth / physicalWidthPx));
      } else {
        setScale(1);
      }
    };

    updateScale();
    globalThis.addEventListener("resize", updateScale);
    return () => globalThis.removeEventListener("resize", updateScale);
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
      <div class="mb-6 flex gap-4 bg-white p-4 rounded-xl shadow-sm z-10">
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
      </div>

      {/* Book Preview Area */}
      <div
        ref={containerRef}
        class="relative w-full max-w-2xl px-4 flex flex-col items-center"
      >
        {
          /*
          This wrapper maintains the scaled height/width in the normal document flow
          so the pagination buttons sit correctly below it.
        */
        }
        <div
          class="relative"
          style={{
            width: `${dimensions.widthInches * 96 * scale}px`,
            height: `${dimensions.heightInches * 96 * scale}px`,
            transition: "width 0.2s, height 0.2s",
          }}
        >
          {
            /*
            The actual physical page, scaled down via transform to fit the wrapper
          */
          }
          <div
            class="absolute top-0 left-0 shadow-2xl"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              transition: "transform 0.2s ease-out",
            }}
          >
            <PageRenderer
              page={pages[currentPageIndex]}
              format={format}
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

// Client-safe HTML renderers shared between the book builder UI and the
// SSR print route. Must NOT import anything that touches Deno globals —
// BookEditor (a client island) imports this module directly.

// Cover title font sizing: the bubble container is a fixed 29em box, so a
// long title can no longer stretch the bubble — the h1 must shrink instead.
// Tiers tuned so the longest line stays inside the bubble's inner width.
// CSS h1 rule carries 4em as the default; this overrides by length.
export function coverTitleFontSizeEm(title: string): number {
  const len = (title || "").trim().length;
  if (len <= 14) return 4;      // default
  if (len <= 20) return 3;      // medium
  if (len <= 30) return 2.25;   // long
  return 1.75;                  // very long
}

// Preview of the auto-appended Notes page the print pipeline adds after the
// last Babbl: white background, theme-colored ruled lines, "Notes" header.
// Returns a plain HTML string so callers inject it via dangerouslySetInnerHTML.
// Line style (2px @96dpi ≈ 0.53mm, var(--babbl-note-line)) MUST stay in sync
// with print.tsx renderGelatoNotesPage — the editor preview is a literal
// WYSIWYG of the printed Notes page.
const NOTE_LINE_FALLBACK = "rgba(182, 49, 152, 0.55)";
const THEME_NOTE_LINES: Record<string, string> = {
  babbl_theme: "rgba(182, 49, 152, 0.55)",
  bubble_pop: "rgba(37, 99, 235, 0.55)",
  bubble_earth: "rgba(110, 127, 62, 0.55)",
};

export function renderNotesPageHtml(
  dim: { widthInches: number; heightInches: number } | { w: number; h: number },
  themeId?: string,
): string {
  const w = "w" in dim ? dim.w : dim.widthInches * 96;
  const h = "h" in dim ? dim.h : dim.heightInches * 96;
  // The editor injects this HTML OUTSIDE any .theme-* wrapper, so the var
  // would never resolve from CSS — inline the resolved note-line color on
  // the root div instead. The print route's copy relies on the theme class.
  const themeVar = themeId ? (THEME_NOTE_LINES[themeId] ?? NOTE_LINE_FALLBACK) : null;
  return `<div class="theme-babbl_theme" style="--babbl-note-line:${themeVar ?? NOTE_LINE_FALLBACK};width:${w}px;height:${h}px;position:relative;overflow:hidden;background:#ffffff;">
    <div style="position:absolute;top:9%;left:10%;right:10%;bottom:9%;display:flex;flex-direction:column;">
      <div style="font-family:var(--babbl-font-heading,'Yomogi',sans-serif);font-weight:500;font-size:1.1em;color:var(--babbl-text-primary,#6b5646);margin-bottom:0.6em;">Notes</div>
      <div style="flex:1;background-image:repeating-linear-gradient(to bottom, transparent 0, transparent 2.4em, var(--babbl-note-line) 2.4em, var(--babbl-note-line) calc(2.4em + 2px));"></div>
    </div>
  </div>`;
}

// Client-safe HTML renderers shared between the book builder UI and the
// SSR print route. Must NOT import anything that touches Deno globals —
// BookEditor (a client island) imports this module directly.

// Preview of the auto-appended Notes page the print pipeline adds after the
// last Babbl: white background, theme-colored ruled lines, "Notes" header.
// Returns a plain HTML string so callers inject it via dangerouslySetInnerHTML.
export function renderNotesPageHtml(
  dim: { widthInches: number; heightInches: number } | { w: number; h: number },
): string {
  const w = "w" in dim ? dim.w : dim.widthInches * 96;
  const h = "h" in dim ? dim.h : dim.heightInches * 96;
  return `<div class="theme-babbl_theme" style="width:${w}px;height:${h}px;position:relative;overflow:hidden;background:#ffffff;">
    <div style="position:absolute;top:9%;left:10%;right:10%;bottom:9%;display:flex;flex-direction:column;">
      <div style="font-family:'Fredoka',sans-serif;font-weight:500;font-size:1.1em;color:var(--babbl-text-primary);margin-bottom:0.6em;">Notes</div>
      <div style="flex:1;background-image:repeating-linear-gradient(to bottom, transparent 0, transparent 2.4em, rgba(182,49,152,0.38) 2.4em, rgba(182,49,152,0.38) calc(2.4em + 1px));"></div>
    </div>
  </div>`;
}

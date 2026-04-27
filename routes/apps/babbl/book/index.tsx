import { Head } from "fresh/runtime";
import { RouteConfig } from "fresh";
import { define } from "../../../../utils.ts";
import BookEditor from "../../../../islands/BookEditor.tsx";
import { BookFormat, BookPageData, BookPayload } from "./_data.ts";
import { getSupabaseClient } from "../../../../lib/supabase.ts";

export const config: RouteConfig = {
  skipAppWrapper: false,
  skipInheritedLayouts: true,
};

export default define.page(async function Book(ctx) {
  const url = new URL(ctx.url);
  let bookId = url.searchParams.get("bookId");
  let token = url.searchParams.get("token");
  const mode = url.searchParams.get("mode");

  const isLocal = url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.hostname.startsWith("192.168.") ||
    url.hostname.startsWith("10.");

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const apiSecret = Deno.env.get("API_SECRET");

  // Bypass if token matches service role key or internal API secret
  const isAdminBypass = (token && serviceRoleKey && token === serviceRoleKey) || 
                       (token && apiSecret && token === apiSecret);

  if (isAdminBypass) {
    console.log(`[ADMIN AUTH] Bypass active for BookID: ${bookId}`);
  }

  // Authentication & Data Fetching
  let payload: BookPayload | null = null;
  let error: string | null = null;

  if (!bookId || !token) {
    error = "Unauthorized: Missing authentication credentials.";
  } else {
    try {
      const supabase = getSupabaseClient(token);

      // Verify user session (Skip for Admin bypass)
      if (!isAdminBypass) {
        const { data: { user }, error: authError } = await supabase.auth
          .getUser();
        if (authError || !user) {
          throw new Error("Invalid or expired session.");
        }
      }

      // Fetch book metadata
      const { data: book, error: bookError } = await supabase
        .from("books")
        .select("*")
        .eq("id", bookId)
        .single();

      if (bookError || !book) {
        throw new Error("Book not found.");
      }

      // Fetch book quotes
      const { data: bookQuotes, error: quotesError } = await supabase
        .from("book_quotes")
        .select(`
          order_index,
          layout_style,
          show_context,
          quote:quotes (
            id,
            quote_text,
            context,
            quote_date,
            location_name,
            child:children (
              id,
              name,
              nickname,
              date_of_birth,
              avatar_url
            ),
            parent:profiles!recorded_by (
              full_name,
              avatar_url
            ),
            media_url
          )
        `)
        .eq("book_id", bookId)
        .order("order_index");

      if (quotesError) {
        throw new Error("Error loading book content.");
      }

      interface SupabaseQuote {
        id: string;
        quote_text: string;
        context: string | null;
        quote_date: string;
        location_name: string | null;
        child: Array<{ id: string; name: string; nickname: string | null; date_of_birth: string | null; avatar_url: string | null }>;
        parent: Array<{ full_name: string; avatar_url: string | null }>;
        media_url: string | null;
      }

      payload = {
        book: {
          id: book.id,
          family_id: book.family_id,
          title: book.title,
          theme: book.theme_id,
          status: book.status,
          created_at: book.created_at,
          format: book.book_size || "mini",
        },
        pages: [
          {
            page_number: 0,
            layout_style: "cover",
            title: book.title,
          },
          ...(bookQuotes as Array<{
            order_index: number;
            layout_style: string | null;
            show_context: boolean | null;
            quote: SupabaseQuote[];
          }>).map((
            bq,
          ) => {
            const quoteData = Array.isArray(bq.quote) ? bq.quote[0] : bq.quote;
            if (!quoteData) return null;

            return {
              page_number: bq.order_index + 1,
              layout_style: bq.layout_style || "photo_window_top_quote_bottom",
              show_context: bq.show_context !== false,
              quote: {
                id: quoteData.id,
                text: quoteData.quote_text,
                context: quoteData.context || undefined,
                location: quoteData.location_name || undefined,
                date: quoteData.quote_date,
                child: Array.isArray(quoteData.child)
                  ? quoteData.child[0]
                  : quoteData.child,
                parent: (() => {
                  const p = Array.isArray(quoteData.parent) 
                    ? quoteData.parent[0] 
                    : (quoteData.parent as unknown as { full_name: string; avatar_url: string | null } | undefined);
                  return p && p.full_name
                    ? { name: p.full_name, avatar_url: p.avatar_url }
                    : undefined;
                })(),
                photo_url: quoteData.media_url || undefined,
              },
            };
          }).filter(Boolean) as BookPageData[],
          {
            page_number: bookQuotes.length + 1,
            layout_style: "back_cover",
          },
        ],
      };

      console.log("--- BOOK DATA FETCHED ---");
      console.log(JSON.stringify(payload, null, 2));
      console.log("-------------------------");
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }
  }

  if (error || !payload) {
    return (
      <div class="flex flex-col items-center justify-center min-h-screen bg-white p-6 text-center">
        <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <svg
            class="w-8 h-8 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 class="text-xl font-bold text-gray-900 mb-2">
          Unable to Load Preview
        </h1>
        <p class="text-gray-600 max-w-xs mx-auto">
          {error || "Something went wrong while preparing your book."}
        </p>
        <p class="text-gray-400 text-sm mt-8">
          Please try opening the preview again from the Babbl app.
        </p>
      </div>
    );
  }

  return (
    <div class="bg-gray-100 h-dvh w-screen overflow-hidden flex flex-col">
      <Head>
        <title>Babbl Book Preview</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        {/* Priority Scripts */}
        <script
          type="module"
          crossOrigin="anonymous"
          src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"
        >
        </script>
        <script
          nomodule
          crossOrigin="anonymous"
          src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"
        >
        </script>

        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Aleo:wght@700&family=Rosario:wght@400;700&family=Yomogi&family=Charter:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />

        <style>
          {`
          body {
            background-color: #FFFFFF;
            font-family: 'Rosario', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #4A4A4A;
            margin: 0;
            padding: 0;
            overflow: hidden;
          }
          ion-icon {
            display: inline-block;
            vertical-align: middle;
            line-height: 1;
            visibility: visible !important;
          }
          ::-webkit-scrollbar {
            display: none;
          }
          * {
            -ms-overflow-style: none;
            scrollbar-width: none;
            -webkit-tap-highlight-color: transparent;
          }
          @keyframes slideNextOut { 0% { transform: translateX(0); opacity: 1; } 100% { transform: translateX(-30px); opacity: 0; } }
          @keyframes slideNextIn { 0% { transform: translateX(30px); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
          @keyframes slidePrevOut { 0% { transform: translateX(0); opacity: 1; } 100% { transform: translateX(30px); opacity: 0; } }
          @keyframes slidePrevIn { 0% { transform: translateX(-30px); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
          @keyframes slideUp { 0% { transform: translateY(10px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
          .animate-turn-next-out { animation: slideNextOut 0.15s forwards ease-in; }
          .animate-turn-next-in { animation: slideNextIn 0.2s forwards ease-out; }
          .animate-turn-prev-out { animation: slidePrevOut 0.15s forwards ease-in; }
          .animate-turn-prev-in { animation: slidePrevIn 0.2s forwards ease-out; }
          .animate-slide-up { animation: slideUp 0.2s forwards ease-out; }
          `}
        </style>
      </Head>
      <main class="flex-1 overflow-hidden relative">
        <BookEditor
          initialFormat={payload.book.format as BookFormat}
          initialTheme={payload.book.theme}
          pages={payload.pages}
          bookId={bookId!}
          token={token!}
          supabaseUrl={Deno.env.get("SUPABASE_URL") || ""}
          supabaseAnonKey={Deno.env.get("SUPABASE_ANON_KEY") || ""}
          isPrintMode={mode === "print"}
        />
      </main>
    </div>
  );
});

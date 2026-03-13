import { Head } from "fresh/runtime";
import { RouteConfig } from "fresh";
import { define } from "../../../../utils.ts";
import BookEditor from "./(_islands)/BookEditor.tsx";
import { BookPayload } from "./_data.ts";
import { getSupabaseClient } from "../../../../lib/supabase.ts";

export const config: RouteConfig = {
  skipAppWrapper: true,
  skipInheritedLayouts: true,
};

export default define.page(async function Book(ctx) {
  const url = new URL(ctx.url);
  const bookId = url.searchParams.get("bookId");
  const token = url.searchParams.get("token");

  // Authentication & Data Fetching
  let payload: BookPayload | null = null;
  let error: string | null = null;

  if (!bookId || !token) {
    error = "Unauthorized: Missing authentication credentials.";
  } else {
    try {
      const supabase = getSupabaseClient(token);

      // Verify user session
      const { data: { user }, error: authError } = await supabase.auth
        .getUser();
      if (authError || !user) {
        throw new Error("Invalid or expired session.");
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
          quote:quotes (
            id,
            quote_text,
            context,
            quote_date,
            child:children (
              id,
              name,
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

      payload = {
        book: {
          id: book.id,
          family_id: book.family_id,
          title: book.title,
          theme: book.theme_id,
          status: book.status,
          created_at: book.created_at,
        },
        pages: (bookQuotes as any[]).map((bq) => ({
          page_number: bq.order_index + 1,
          layout_style: "single_quote_large",
          quote: {
            id: bq.quote.id,
            text: bq.quote.quote_text,
            context: bq.quote.context,
            date: bq.quote.quote_date,
            child: bq.quote.child,
            parent: bq.quote.parent
              ? {
                name: bq.quote.parent.full_name,
                avatar_url: bq.quote.parent.avatar_url,
              }
              : undefined,
            photo_url: bq.quote.media_url,
          },
        })),
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
    <div class="bg-gray-100 min-h-screen overflow-hidden">
      <Head>
        <title>Babbl Book Preview</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Aleo:wght@700&family=Rosario:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
          body {
            background-color: #FFFFFF;
            font-family: 'Rosario', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #4A4A4A;
            margin: 0;
            padding: 0;
            overflow: hidden; /* Prevent scrolling */
          }
          /* Hide scrollbars for a native app feel */
          ::-webkit-scrollbar {
            display: none;
          }
          * {
            -ms-overflow-style: none;
            scrollbar-width: none;
            -webkit-tap-highlight-color: transparent;
          }
        `,
          }}
        />
      </Head>
      <main>
        <BookEditor
          initialFormat="mini"
          initialTheme={payload.book.theme}
          pages={payload.pages}
        />
      </main>
    </div>
  );
});

import { Head } from "fresh/runtime";
import { RouteConfig } from "fresh";
import { define } from "../../../../utils.ts";
import BookEditor from "./(_islands)/BookEditor.tsx";
import { BookPayload } from "./_data.ts";

export const config: RouteConfig = {
  skipAppWrapper: true,
  skipInheritedLayouts: true,
};

// Simulate the data fetch based on the user's JSON structure
const sampleData: BookPayload = {
  "book": {
    "id": "b8a9c2f1-4e7d-4b9a-8f3c-1a2b3c4d5e6f",
    "family_id": "f1a2b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c",
    "title": "The Early Years: 2024-2026",
    "theme": "playful_pastel",
    "status": "draft",
    "created_at": "2026-03-10T14:30:00Z",
  },
  "pages": [
    {
      "page_number": 1,
      "layout_style": "single_quote_large",
      "quote": {
        "id": "q1w2e3r4-t5y6-u7i8-o9p0-a1s2d3f4g5h6",
        "text": "I don't need a nap, my eyes are just blinking really slowly.",
        "context": "Trying to stay awake during a movie",
        "date": "2025-11-15T18:00:00Z",
        "child": {
          "id": "c1x2y3z4",
          "name": "Leo",
          "avatar_url":
            "https://your-supabase-url.com/storage/v1/object/public/avatars/leo.jpg",
        },
        "parent": {
          "name": "Ryan",
        },
        "media": [
          {
            "type": "image",
            "url":
              "https://your-supabase-url.com/storage/v1/object/public/quotes/sleepy_leo.jpg",
          },
        ],
      },
    },
    {
      "page_number": 2,
      "layout_style": "text_only_split",
      "quote": {
        "id": "q1w2e3r4-t5y6-u7p0",
        "text":
          "Mom, did you know that dinosaurs probably sounded like giant chickens?",
        "date": "2026-01-10T09:00:00Z",
        "child": {
          "id": "c1x2y3z4",
          "name": "Leo",
        },
      },
    },
  ],
};

export default define.page(function Book() {
  return (
    <div class="bg-gray-100 min-h-screen">
      <Head>
        <title>Babbl Book Generator</title>
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
          pages={sampleData.pages}
        />
      </main>
    </div>
  );
});

import { define } from "@/utils.ts";
import { trackView } from "@/lib/analytics.ts";

export default define.page(async function Track(ctx) {
  if (ctx.req.method !== "POST") {
    return new Response(null, { status: 405 });
  }

  try {
    const body = await ctx.req.json();
    const { path, referrer, session_id, user_agent } = body;

    if (!path || !session_id) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await trackView({
      path,
      referrer: referrer || "",
      session_id,
      user_agent: user_agent || "",
      created_at: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Analytics track error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

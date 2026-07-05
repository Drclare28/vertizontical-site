import { define } from "../../utils.ts";

export default define.page(async function AdminLogin(ctx) {
  const url = new URL(ctx.url);
  const apiSecret = Deno.env.get("API_SECRET");
  let error = "";

  if (ctx.req.method === "POST") {
    const form = await ctx.req.formData();
    const password = form.get("password") as string;

    if (!apiSecret) {
      error = "Admin password not configured. Set API_SECRET in your .env file.";
    } else if (password !== apiSecret) {
      error = "Incorrect password.";
    } else {
      const headers = new Headers();
      headers.set(
        "Set-Cookie",
        "admin_token=" + encodeURIComponent(apiSecret) +
          "; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400",
      );
      headers.set("Location", "/admin/analytics");
      return new Response(null, { status: 302, headers });
    }
  }

  return (
    <div class="min-h-screen flex items-center justify-center bg-black text-white">
      <div class="bg-gray-900 p-8 rounded-xl w-full max-w-sm">
        <h1 class="text-2xl pt-serif-caption-regular mb-6 text-center">
          Admin Login
        </h1>
        {error && (
          <p class="text-red-400 text-sm mb-4 text-center">{error}</p>
        )}
        <form method="POST" class="flex flex-col gap-4">
          <input
            type="password"
            name="password"
            placeholder="Password"
            class="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            required
          />
          <button
            type="submit"
            class="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
});

import { Handlers } from "fresh";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Initialize external services
const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

let stripe: Stripe | null = null;
if (stripeSecretKey) {
  stripe = new Stripe(stripeSecretKey, {
    // @ts-ignore
    apiVersion: "2023-10-16", 
  });
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export const handler: Handlers = {
  async POST(req, _ctx) {
    if (!stripe) {
      return new Response(JSON.stringify({ error: "Stripe not configured on backend." }), { status: 500 });
    }

    try {
      const body = await req.json();
      const { bookId, format, binding, pages, userId } = body;

      if (!bookId || !pages) {
         return new Response(JSON.stringify({ error: "Missing required fields" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
         });
      }

      // We calculate pricing dynamically on the backend to avoid trusting client inputs.
      // E.g. base = $39.99, plus $0.50 per page after 26.
      // Eventually, we replace this statically calculated math with a live query to the Gelato Quote API
      const pageCount = parseInt(pages, 10) || 0;
      const baseCost = 39.99;
      const extraPagesCost = Math.max(0, pageCount - 26) * 0.50;
      const calculatedTotal = baseCost + extraPagesCost;
      const amountCents = Math.round(calculatedTotal * 100);

      // Create a PaymentIntent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountCents,
        currency: "usd",
        metadata: {
          bookId,
          format: format || "classic",
          binding: binding || "hardcover",
          pages: pageCount.toString(),
          userId: userId || 'anonymous',
        },
      });

      // Insert raw order record in Supabase as "pending"
      const { data: orderData, error: dbError } = await supabase
        .from("orders")
        .insert({
           user_id: userId || null,
           book_id: bookId,
           stripe_payment_id: paymentIntent.id,
           status: "pending",
           amount: calculatedTotal,
           product_sku: `${format}-${binding}-${pageCount}pages`
        })
        .select()
        .single();

      if (dbError) {
         console.error("Failed creating pending order record:", dbError);
         // Not strictly fatal for returning the secret, but log strongly.
      }

      // Respond with the client secret required for Native Stripe SDK
      return new Response(JSON.stringify({
         clientSecret: paymentIntent.client_secret,
         orderId: orderData?.id
      }), {
         headers: { "Content-Type": "application/json" }
      });

    } catch (e: any) {
      console.error("Checkout Intent Error:", e);
      return new Response(JSON.stringify({ error: e.message }), {
         status: 500,
         headers: { "Content-Type": "application/json" }
      });
    }
  }
};

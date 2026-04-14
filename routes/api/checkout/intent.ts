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
      // E.g. proxying the Gelato wholesale math and applying a 1.6x multiplier margin
      const pageCount = parseInt(pages, 10) || 0;
      const isHardcover = pageCount >= 26;
      let gelatoCost = isHardcover ? 14.50 : 5.50;
      gelatoCost += pageCount * (isHardcover ? 0.20 : 0.15);
      
      const shippingCost = 4.99;
      const fulfillmentCost = gelatoCost + shippingCost;
      const calculatedTotal = fulfillmentCost * 1.6;
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

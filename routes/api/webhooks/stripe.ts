import { Handlers } from "fresh";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
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
      return new Response("Stripe not configured", { status: 500 });
    }

    const signature = req.headers.get("stripe-signature");

    if (!signature || !endpointSecret) {
      return new Response("Missing signature or webhook secret", { status: 400 });
    }

    try {
      const bodyText = await req.text();
      let event: Stripe.Event;

      try {
        event = await stripe.webhooks.constructEventAsync(
          bodyText,
          signature,
          endpointSecret
        );
      } catch (err: any) {
        console.error("⚠️  Webhook signature verification failed.", err.message);
        return new Response(JSON.stringify({ error: err.message }), { status: 400 });
      }

      switch (event.type) {
        case "payment_intent.succeeded": {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
          
          const bookId = paymentIntent.metadata?.bookId;
          const format = paymentIntent.metadata?.format;
          const binding = paymentIntent.metadata?.binding;
          const pages = paymentIntent.metadata?.pages;

          // Update the order in Supabase to Paid state
          const { error: dbError } = await supabase
            .from("orders")
            .update({
               status: "paid",
               updated_at: new Date().toISOString(),
               // Could potentially expand here to store detailed shipping hooks or Gelato dispatch status
               shipping_address: paymentIntent.shipping || null
            })
            .eq("stripe_payment_id", paymentIntent.id);

          if (dbError) {
             console.error("Failed to update order status in DB:", dbError);
          } else {
             console.log(`Order updated to paid for book_id: ${bookId}`);
             
             // Update the book's high-level status as well
             if (bookId) {
                await supabase.from("books").update({ status: "paid" }).eq("id", bookId);
             }
          }

          // TODO: In the future, this is the exact spot to trigger the Gelato API to begin printing!
          
          break;
        }
        case "payment_intent.payment_failed": {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log(`❌ Payment failed: ${paymentIntent.last_payment_error?.message}`);
          
          await supabase
            .from("orders")
            .update({ status: "failed" })
            .eq("stripe_payment_id", paymentIntent.id);
            
          break;
        }
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      return new Response(JSON.stringify({ received: true }), {
         headers: { "Content-Type": "application/json" }
      });
    } catch (err: any) {
      console.error("Webhook Error:", err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 500 });
    }
  }
};

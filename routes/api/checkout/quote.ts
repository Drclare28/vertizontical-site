import type { FreshContext } from "fresh";

// The price shown in the builder MUST match exactly what the React Native app
// charges. The app's create-payment-intent edge function fetches the real
// Gelato wholesale price, adds a shipping estimate, and applies a 60% gross
// margin (x1.6). This endpoint mirrors that exact math so the displayed total
// equals the amount on the Stripe payment sheet.
//
// Keep in sync with kid-quotes: supabase/functions/create-payment-intent/index.ts

const GELATO_PRODUCT_UIDS: Record<string, string> = {
  classic:
    "photobooks-softcover_pf_200x200-mm-8x8-inch_pt_170-gsm-65lb-coated-silk_cl_4-4_ccl_4-4_bt_glued-left_ct_matt-lamination_prt_1-0_cpt_250-gsm-100-lb-cover-coated-silk_ver",
  mini:
    "photobooks-softcover_pf_140x140-mm-5_5x5_5-inch_pt_170-gsm-65lb-coated-silk_cl_4-4_ccl_4-4_bt_glued-left_ct_matt-lamination_prt_1-0_cpt_250-gsm-100-lb-cover-coated-silk_ver",
};

const SHIPPING_ESTIMATE_CENTS: Record<string, number> = {
  classic: 450,
  mini: 400,
};
// Fallbacks mirror the app's create-payment-intent fallback when Gelato is unreachable.
const FALLBACK_PRINT_COST_CENTS: Record<string, number> = {
  classic: 970,
  mini: 750,
};
const MARKUP_MULTIPLIER = 1.6;

export const handler = {
  async GET(req: Request, _ctx: FreshContext) {
    const url = new URL(req.url);
    const pages = parseInt(url.searchParams.get("pages") || "0", 10);
    const format = (url.searchParams.get("format") || "classic").toLowerCase();
    const quantity = Math.max(
      1,
      parseInt(url.searchParams.get("quantity") || "1", 10) || 1,
    );
    const country = (url.searchParams.get("country") || "US").toLowerCase();

    const productUid = GELATO_PRODUCT_UIDS[format] ||
      GELATO_PRODUCT_UIDS.classic;
    const shippingCostCents = SHIPPING_ESTIMATE_CENTS[format] ??
      SHIPPING_ESTIMATE_CENTS.classic;

    // Gelato photobooks require a minimum of 28 pages in steps of 2.
    // We add 4 pages for the covers (front/back x 2), same as create-payment-intent.
    const rawPages = pages + 4;
    const totalPages = Math.max(
      28,
      rawPages % 2 === 0 ? rawPages : rawPages + 1,
    );

    let printCostPerUnitCents = FALLBACK_PRINT_COST_CENTS[format] ??
      FALLBACK_PRINT_COST_CENTS.classic;

    try {
      const apiKey = Deno.env.get("GELATO_API_KEY");
      if (apiKey) {
        const priceRes = await fetch(
          `https://product.gelatoapis.com/v3/products/${productUid}/prices?pageCount=${totalPages}&currency=USD`,
          { headers: { "X-API-KEY": apiKey } },
        );

        if (priceRes.ok) {
          const priceData = await priceRes.json();
          const price = priceData.find((p: any) =>
            p.country?.toLowerCase() === country
          ) ||
            priceData[0];
          if (price?.price) {
            printCostPerUnitCents = Math.round(price.price * 100);
          }
        }
      }
    } catch (err) {
      console.error("Gelato price fetch failed, using fallback:", err);
    }

    // Same math as create-payment-intent: (print + shipping, incl. quantity) x 1.6, rounded up.
    const totalCostCents = (printCostPerUnitCents + shippingCostCents) *
      quantity;
    const totalPriceCents = Math.ceil(totalCostCents * MARKUP_MULTIPLIER);

    // Per-unit marked-up breakdown for the builder's line items.
    const printMarkup = (printCostPerUnitCents * MARKUP_MULTIPLIER) / 100;
    const shippingMarkup = (shippingCostCents * MARKUP_MULTIPLIER) / 100;
    const costPerUnit = (printCostPerUnitCents + shippingCostCents) / 100;

    const isHardcover = pages >= 26;

    return new Response(
      JSON.stringify({
        print: printMarkup.toFixed(2),
        shipping: shippingMarkup.toFixed(2),
        cost: costPerUnit.toFixed(2),
        price: (totalPriceCents / 100).toFixed(2),
        binding: isHardcover ? "hardcover" : "saddle_stitch",
        isHardcoverAvailable: isHardcover,
        pagesRequiredForHardcover: Math.max(0, 26 - pages),
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  },
};

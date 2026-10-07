import type { FreshContext } from "fresh";

// The price shown in the builder MUST match exactly what the React Native app
// charges. The app's create-payment-intent edge function fetches a real Gelato
// quote (product price + shipping for the destination country), applies a 60%
// gross margin (x1.6). This endpoint mirrors that exact math so the displayed
// total equals the amount on the Stripe payment sheet.
//
// Keep in sync with kid-quotes: supabase/functions/create-payment-intent/index.ts

// Hardcover-only sales, both sizes: the Classic 8x8 has a true Gelato
// hardcover product; the Mini 5.5x5.5 has NO hardcover in Gelato's catalog
// (verified by probing every UID variant), so mini orders currently print
// through the softcover mini product until Gelato adds a mini hardcover.
const GELATO_PRODUCT_UIDS: Record<string, string> = {
  classic:
    "photobooks-hardcover_pf_200x200-mm-8x8-inch_pt_170-gsm-65lb-coated-silk_cl_4-4_ccl_4-4_bt_glued-left_ct_matt-lamination_prt_1-0_cpt_130-gsm-65-lb-cover-coated-silk_ver",
  mini:
    "photobooks-softcover_pf_140x140-mm-5_5x5_5-inch_pt_170-gsm-65lb-coated-silk_cl_4-4_ccl_4-4_bt_glued-left_ct_matt-lamination_prt_1-0_cpt_250-gsm-100-lb-cover-coated-silk_ver",
};

const SHIPPING_ESTIMATE_CENTS: Record<string, number> = {
  classic: 699,
  mini: 400,
};
// Fallbacks mirror the app's create-payment-intent fallback when Gelato is unreachable.
const FALLBACK_PRINT_COST_CENTS: Record<string, number> = {
  classic: 1350,
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

    // Gelato photo book page math (keep in sync with create-payment-intent,
    // stitch-pdf and dispatch-gelato-order):
    //   content = title page + one page per quote; request R = max(28, content)
    //   total T = R + 4 (cover spread + 2 endpapers + 1), floor 32.
    const contentPages = pages + 1;
    const requestPages = Math.max(28, contentPages);
    const totalPages = Math.max(32, requestPages + 4);

    let printCostPerUnitCents = FALLBACK_PRINT_COST_CENTS[format] ??
      FALLBACK_PRINT_COST_CENTS.classic;
    let shipTotalCents = shippingCostCents * quantity;

    try {
      const apiKey = Deno.env.get("GELATO_API_KEY");
      if (apiKey) {
        // Real Gelato quote: product price AND shipping for the destination
        // country. Both prices are totals for the whole quantity.
        const quoteRes = await fetch(
          "https://order.gelatoapis.com/v3/orders:quote",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-KEY": apiKey,
            },
            body: JSON.stringify({
              orderReferenceId: `quote-${crypto.randomUUID()}`,
              customerReferenceId: "babbl-checkout-quote",
              currency: "USD",
              allowMultipleQuotes: false,
              recipient: {
                country: country.toUpperCase(),
                // Generic placeholder: Gelato only needs a plausible address to
                // compute carrier rates; the real one is used at dispatch time.
                firstName: "Quote",
                lastName: "Recipient",
                addressLine1: "123 Main Street",
                city: "Portland",
                state: "OR",
                postCode: "97201",
              },
              products: [{
                itemReferenceId: "item1",
                productUid,
                fileUrl:
                  "https://cdn-origin.gelato-api-dashboard.ie.live.gelato.tech/docs/sample-print-files/business_card_empty.pdf",
                quantity,
                pageCount: totalPages,
              }],
            }),
          },
        );

        if (quoteRes.ok) {
          const quoteData = await quoteRes.json();
          const quote = quoteData.quotes?.[0];
          const productTotal = quote?.products?.[0]?.price;
          const methods = [...(quote?.shipmentMethods ?? [])].sort(
            (a: any, b: any) => a.price - b.price,
          );
          const method = methods.find((m: any) => m.type === "normal") ||
            methods[0];
          if (productTotal && method?.price) {
            printCostPerUnitCents = Math.round(productTotal * 100 / quantity);
            shipTotalCents = Math.round(method.price * 100);
          }
        }
      }
    } catch (err) {
      console.error("Gelato quote fetch failed, using fallback:", err);
    }

    // Same math as create-payment-intent: (print + shipping totals) x 1.6, rounded up.
    const totalCostCents = printCostPerUnitCents * quantity + shipTotalCents;
    const totalPriceCents = Math.ceil(totalCostCents * MARKUP_MULTIPLIER);

    // Per-unit marked-up breakdown for the builder's line items.
    const printMarkup = (printCostPerUnitCents * MARKUP_MULTIPLIER) / 100;
    const shippingMarkup = (shipTotalCents * MARKUP_MULTIPLIER / quantity) / 100;
    const costPerUnit =
      (printCostPerUnitCents + shipTotalCents / quantity) / 100;

    // Hardcover-only sales: the UI always presents the book as hardcover.
    // (Mini orders currently fulfil on Gelato's softcover mini - see the UID
    // map above - but that's an implementation detail, not a user-facing one.)
    const binding = "hardcover";

    return new Response(
      JSON.stringify({
        print: printMarkup.toFixed(2),
        shipping: shippingMarkup.toFixed(2),
        cost: costPerUnit.toFixed(2),
        price: (totalPriceCents / 100).toFixed(2),
        binding,
        isHardcoverAvailable: true,
        pagesRequiredForHardcover: 0,
        totalPages: totalPages,
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  },
};

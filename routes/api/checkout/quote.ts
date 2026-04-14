import { Handlers } from "fresh";

export const handler: Handlers = {
  async GET(req, _ctx) {
    const url = new URL(req.url);
    const pages = parseInt(url.searchParams.get("pages") || "0", 10);
    const format = url.searchParams.get("format") || "classic";
    
    // In production, we fetch `https://api.gelato.com/v1/quote`
    // using `Deno.env.get("GELATO_API_KEY")` here.
    
    // We'll calculate a proxy "Gelato Cost" based on their standard wholesale tiers.
    // Pricing typically structured around base cost + per extra page fee.
    const isHardcover = pages >= 26;
    let gelatoCost = isHardcover ? 14.50 : 5.50; // base wholesale estimate
    gelatoCost += pages * (isHardcover ? 0.20 : 0.15); // printing cost per page
    
    // Flat shipping fee estimate via Gelato Standard integration
    const shippingCost = 4.99;
    const fulfillmentCost = gelatoCost + shippingCost;

    // The user requested a 60% gross margin markup model
    // target price = cost * 1.6
    const markupMultiplier = 1.6;
    const finalPrice = fulfillmentCost * markupMultiplier;

    return new Response(JSON.stringify({
      cost: fulfillmentCost.toFixed(2),
      price: finalPrice.toFixed(2),
      binding: isHardcover ? "hardcover" : "saddle_stitch",
      isHardcoverAvailable: isHardcover,
      pagesRequiredForHardcover: Math.max(0, 26 - pages),
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }
};

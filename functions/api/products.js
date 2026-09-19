export async function onRequest(context) {
  try {
    // Fetch products.json from the current deployment
    const url = new URL(context.request.url);
    const assetUrl = `${url.origin}/products.json`;
    const res = await fetch(assetUrl);
    const data = await res.json();

    // Get current date in IST (UTC+5:30)
    const now = new Date();
    const istOptions = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' };
    const todayIST = new Intl.DateTimeFormat('en-CA', istOptions).format(now);

    // Filter out all future products
    const liveProducts = (data.products || [])
      .filter(p => p.publishDate <= todayIST)
      .sort((a, b) => b.publishDate.localeCompare(a.publishDate) || b.code.localeCompare(a.code));

    return new Response(JSON.stringify({ products: liveProducts }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to process products' }), { status: 500 });
  }
}

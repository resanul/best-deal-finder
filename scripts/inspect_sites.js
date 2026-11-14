const urls = [
  'https://www.amadercart.com.bd/',
  'https://amazingcollections.net/',
  'https://premiumsubscriptionsbd.com/',
  'https://digitalseba.com.bd/',
  'https://egoodies.net/',
  'https://www.gamershopbd.com/',
  'https://vertexbazaar.com/',
  'https://ebdsolution.com/',
  'https://tech-haat.com/',
  'https://amadercraft.com/',
  'https://www.fanflixbd.com/',
  'https://premiumbangladesh.com/',
  'https://subscriptionsmartbd.com/',
  'https://subsbhai.com/',
  'https://www.netflixshopbd.com/'
];

async function check() {
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        signal: AbortSignal.timeout(7000)
      });
      const text = await res.text();
      const title = text.match(/<title>(.*?)<\/title>/i)?.[1]?.trim() || 'No title';
      
      // Look for sample products/categories
      const products = [];
      const prodRegex = /<h[2-4][^>]*class=["'][^"']*(?:product|title|name)[^"']*["'][^>]*>([\s\S]*?)<\/h[2-4]>/gi;
      let m;
      while ((m = prodRegex.exec(text)) !== null && products.length < 5) {
        products.push(m[1].replace(/<[^>]+>/g, '').trim());
      }

      console.log(`\n=== ${url} ===`);
      console.log(`Status: ${res.status} | Title: ${title}`);
      if (products.length > 0) {
        console.log(`Sample Products:`, products.slice(0, 5));
      }
    } catch (e) {
      console.log(`\n=== ${url} ===`);
      console.log(`Error: ${e.message}`);
    }
  }
}
check();

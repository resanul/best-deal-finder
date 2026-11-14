import https from 'https';

https.get('https://www.startech.com.bd/component/processor', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
}, (res) => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    // Look for filter section
    const filterIdx = html.indexOf('class="c-left"');
    if (filterIdx !== -1) {
      console.log('--- FOUND C-LEFT FILTER BLOCK ---');
      console.log(html.substring(filterIdx, filterIdx + 2000));
    } else {
      const filterSection = html.indexOf('id="column-left"');
      if (filterSection !== -1) {
        console.log('--- FOUND COLUMN-LEFT ---');
        console.log(html.substring(filterSection, filterSection + 2000));
      } else {
        console.log('--- SEARCHING FOR FILTER HEADINGS ---');
        const priceIdx = html.indexOf('Price Range');
        console.log(html.substring(priceIdx - 200, priceIdx + 1500));
      }
    }
  });
});

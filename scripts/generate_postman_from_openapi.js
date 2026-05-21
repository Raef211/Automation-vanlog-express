const fs = require('fs');
const fetch = require('node-fetch');
const converter = require('openapi-to-postmanv2');

(async () => {
  try {
    const url = process.env.OPENAPI_URL || 'http://localhost:6001/api-json';
    console.log('Fetching OpenAPI spec from', url);
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch OpenAPI spec: ' + res.status);
    const spec = await res.json();

    converter.convert({ type: 'json', data: spec }, {}, (err, result) => {
      if (err) {
        console.error('Conversion error:', err);
        process.exit(1);
      }
      if (!result.result) {
        console.error('Conversion failed:', result);
        process.exit(1);
      }
      const out = result.output && result.output[0] && result.output[0].data;
      if (!out) {
        console.error('No output from converter');
        process.exit(1);
      }
      const outPath = 'postman/TUNLOG_full_postman_collection.json';
      fs.mkdirSync('postman', { recursive: true });
      fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
      console.log('Wrote', outPath);
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();

// index.js
const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const DB_FILE = path.join(__dirname, 'urls.json');
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple base62 alphabet (0-9, a-z, A-Z)
const CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function encodeBase62(num) {
  if (num === 0) return '0';
  let s = '';
  while (num > 0) {
    s = CHARS[num % 62] + s;
    num = Math.floor(num / 62);
  }
  return s;
}

// In-memory DB (persisted to DB_FILE)
let db = { lastId: 0, urls: {} };

// Load DB from file (or create new file if not found)
async function loadDb() {
  try {
    const raw = await fs.readFile(DB_FILE, 'utf8');
    db = JSON.parse(raw);
    console.log('DB loaded:', Object.keys(db.urls).length, 'short URLs');
  } catch (err) {
    if (err.code === 'ENOENT') {
      await saveDb(); // create empty DB file
      console.log('Created new DB file at', DB_FILE);
    } else {
      console.error('Failed to load DB file:', err);
    }
  }
}

// Save DB to file
async function saveDb() {
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

// Validate a URL string using the WHATWG URL API
function isValidUrl(s) {
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
}

// API: create short URL
// POST /api/shorten   { "url": "https://example.com", "customAlias": "myalias" (optional) }
app.post('/api/shorten', async (req, res) => {
  const { url, customAlias } = req.body;
  if (!url) return res.status(400).json({ error: 'Missing "url" in request body' });
  if (!isValidUrl(url)) return res.status(400).json({ error: 'Invalid URL' });

  const normalized = new URL(url).toString();

  // Custom alias handling
  if (customAlias) {
    if (typeof customAlias !== 'string' || !/^[0-9A-Za-z_-]+$/.test(customAlias)) {
      return res.status(400).json({ error: 'Invalid customAlias. Use letters, numbers, _ or -' });
    }
    if (db.urls[customAlias]) {
      return res.status(409).json({ error: 'Custom alias already in use' });
    }
    db.urls[customAlias] = { url: normalized, createdAt: new Date().toISOString(), visits: 0 };
    await saveDb();
    return res.json({ shortUrl: `${req.protocol}://${req.get('host')}/${customAlias}` });
  }

  // Generate a new short code using incrementing ID -> base62
  let code;
  do {
    db.lastId++;
    code = encodeBase62(db.lastId);
  } while (db.urls[code]); // extremely unlikely, but safe

  db.urls[code] = { url: normalized, createdAt: new Date().toISOString(), visits: 0 };
  await saveDb();

  res.json({ shortUrl: `${req.protocol}://${req.get('host')}/${code}` });
});

// Redirect: GET /:code
app.get('/:code', async (req, res) => {
  const code = req.params.code;
  const meta = db.urls[code];
  if (!meta) return res.status(404).send('Short URL not found');

  // increment visit counter and persist (simple approach)
  meta.visits = (meta.visits || 0) + 1;
  meta.lastVisited = new Date().toISOString();
  try { await saveDb(); } catch (err) { console.error('Failed to save visit count', err); }

  // Redirect (302)
  res.redirect(meta.url);
});

// Stats endpoint: GET /api/stats/:code
app.get('/api/stats/:code', (req, res) => {
  const meta = db.urls[req.params.code];
  if (!meta) return res.status(404).json({ error: 'Not found' });
  res.json({ code: req.params.code, ...meta });
});

// Tiny front-end form for convenience
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Simple URL Shortener</title></head>
      <body style="font-family: Arial; padding: 20px;">
        <h2>URL Shortener</h2>
        <form method="POST" action="/api/shorten" onsubmit="submitForm(event)">
          <input name="url" id="url" placeholder="https://example.com" style="width:400px" required />
          <input name="customAlias" id="customAlias" placeholder="custom alias (optional)" />
          <button type="submit">Shorten</button>
        </form>
        <p id="result"></p>
        <script>
          async function submitForm(e){
            e.preventDefault();
            const url = document.getElementById('url').value;
            const customAlias = document.getElementById('customAlias').value;
            const body = { url };
            if(customAlias) body.customAlias = customAlias;
            const res = await fetch('/api/shorten', {
              method:'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify(body)
            });
            const data = await res.json();
            if(res.ok) {
              document.getElementById('result').innerHTML = 'Short URL: <a href="' + data.shortUrl + '">' + data.shortUrl + '</a>';
            } else {
              document.getElementById('result').textContent = 'Error: ' + (data.error || 'unknown');
            }
          }
        </script>
      </body>
    </html>
  `);
});

// Start server
(async () => {
  await loadDb();
  app.listen(PORT, () => console.log(`URL shortener listening on http://localhost:${PORT}`));
})();

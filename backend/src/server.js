// Minimal Express server scaffold for Invoice App
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const upload = multer({ dest: path.join(__dirname, '..', 'uploads') });

app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/static', express.static(path.join(__dirname, '..', 'public')));

// Simple in-memory store (replace with real DB)
const DATAFILE = path.join(__dirname, '..', 'data', 'db.json');
if (!fs.existsSync(path.dirname(DATAFILE))) fs.mkdirSync(path.dirname(DATAFILE), { recursive: true });
if (!fs.existsSync(DATAFILE)) fs.writeFileSync(DATAFILE, JSON.stringify({ invoices: [], templates: [], users: [] }, null, 2));

function readDB() { return JSON.parse(fs.readFileSync(DATAFILE)); }
function writeDB(obj) { fs.writeFileSync(DATAFILE, JSON.stringify(obj, null, 2)); }

// Auth (simple single-user registration for MVP)
app.post('/api/auth/signup', (req, res) => {
  const { email, passwordHash } = req.body;
  const db = readDB();
  if (db.users.length > 0) return res.status(400).json({ error: 'User already exists (single-user app)' });
  const user = { id: uuidv4(), email, passwordHash };
  db.users.push(user);
  writeDB(db);
  res.json({ ok: true });
});

// Invoice create/read/list
app.post('/api/invoices', (req, res) => {
  const db = readDB();
  const invoice = req.body;
  invoice.id = uuidv4();
  invoice.created_at = new Date().toISOString();
  db.invoices.push(invoice);
  writeDB(db);
  res.json(invoice);
});

app.get('/api/invoices', (req, res) => {
  const db = readDB();
  res.json(db.invoices);
});

app.get('/api/invoices/:id', (req, res) => {
  const db = readDB();
  const inv = db.invoices.find(i => i.id === req.params.id);
  if (!inv) return res.status(404).json({ error: 'Not found' });
  res.json(inv);
});

// Logo upload
app.post('/api/upload/logo', upload.single('logo'), (req, res) => {
  // Return accessible path to logo
  const tmp = req.file;
  const destDir = path.join(__dirname, '..', 'public', 'logos');
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const ext = path.extname(tmp.originalname) || '.png';
  const dest = path.join(destDir, tmp.filename + ext);
  fs.renameSync(tmp.path, dest);
  res.json({ url: '/static/logos/' + path.basename(dest) });
});

// PDF generation endpoint (uses puppeteer)
const handlebars = require('handlebars');
app.post('/api/invoices/:id/generate-pdf', async (req, res) => {
  const db = readDB();
  const inv = db.invoices.find(i => i.id === req.params.id);
  if (!inv) return res.status(404).json({ error: 'Invoice not found' });

  // render a minimal HTML invoice using handlebars
  const tpl = fs.readFileSync(path.join(__dirname, 'templates', 'invoice.hbs'), 'utf8');
  const html = handlebars.compile(tpl)(inv);

  // write to temp html
  const tmpHtml = path.join(__dirname, '..', 'temp', `${inv.id}.html`);
  const tmpPdf = path.join(__dirname, '..', 'temp', `${inv.id}.pdf`);
  if (!fs.existsSync(path.dirname(tmpHtml))) fs.mkdirSync(path.dirname(tmpHtml), { recursive: true });
  fs.writeFileSync(tmpHtml, html);

  // Use Puppeteer to generate PDF
  const puppeteer = require('puppeteer');
  try {
    // const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const browser = await puppeteer.launch({
      executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({ path: tmpPdf, format: 'A4', printBackground: true });
    await browser.close();

    // stream to client and then delete
    res.download(tmpPdf, `${inv.invoice_number || inv.id}.pdf`, err => {
      try { fs.unlinkSync(tmpPdf); fs.unlinkSync(tmpHtml); } catch (e) {/*ignore*/ }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'PDF generation failed on host' });
  }
});

// Serve built frontend in production (if you build and copy frontend/dist to backend/public)
app.use(express.static(path.join(__dirname, '..', 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Invoice backend listening on', PORT));

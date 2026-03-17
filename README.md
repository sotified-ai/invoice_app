# Invoice App v2 — Invoice Generator

A single-user invoice generation web application. Create professional invoices, preview them, and export to PDF.

## Tech Stack

- **Frontend**: React + Vite (port 5173)
- **Backend**: Node.js + Express (port 3000)
- **PDF Engine**: Puppeteer (uses system Chrome)
- **Database**: JSON file (`backend/data/db.json`)

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [Google Chrome](https://www.google.com/chrome/) installed (required for PDF generation)
- npm (comes with Node.js)

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/sotified-ai/invoice_app.git
cd invoice_app
```

### 2. Install Backend dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend dependencies

```bash
cd ../frontend
npm install
```

---

## Running the Project

You need **two terminals** — one for the backend and one for the frontend.

### Terminal 1 — Start the Backend

```bash
cd backend
node src/server.js
```

✅ Expected output: `Invoice backend listening on 3000`

### Terminal 2 — Start the Frontend

```bash
cd frontend
npx vite --port 5173
```

✅ Expected output: `VITE vX.X.X  ready → Local: http://localhost:5173/`

### Open the App

Open your browser and go to:

```
http://localhost:5173
```

---

## Environment Variables (Optional)

The backend reads from `backend/.env`. A default file is created automatically, but you can customize it:

```bash
# backend/.env
PORT=3000
NODE_ENV=development
```

---

## Features

- Fill in complete invoice details (seller, bill-to, ship-to, line items)
- Auto-calculate subtotal, tax, discount, shipping, and total
- Upload company logo
- Save invoice to local JSON database
- Generate and download PDF invoice

---

## Project Structure

```
invoice_app_v2/
├── backend/
│   ├── src/
│   │   ├── server.js          # Express API server
│   │   └── templates/
│   │       └── invoice.hbs    # Handlebars PDF template
│   ├── data/
│   │   └── db.json            # JSON database (auto-created)
│   ├── public/
│   │   └── logos/             # Uploaded logos
│   ├── temp/                  # Temporary PDF files
│   ├── .env                   # Environment config
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── InvoiceForm.jsx
│   │   └── styles.css
│   ├── vite.config.js         # Vite config with API proxy
│   ├── index.html
│   └── package.json
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register single user |
| POST | `/api/invoices` | Create invoice |
| GET | `/api/invoices` | List all invoices |
| GET | `/api/invoices/:id` | Get invoice by ID |
| POST | `/api/invoices/:id/generate-pdf` | Generate PDF |
| POST | `/api/upload/logo` | Upload company logo |

---

## Notes

- PDF generation uses Chrome at `C:\Program Files\Google\Chrome\Application\chrome.exe` on Windows. If Chrome is in a different location, update the `executablePath` in `backend/src/server.js`.
- This is a **single-user app** — only one account can be registered.
- All data is stored locally in `backend/data/db.json`.

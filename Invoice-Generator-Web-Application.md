# Invoice Generator Web Application

## Overview

This application is a single-user invoice generation system that allows you to:

* Create invoices with full flexibility (all fields optional but available)
* Add multiple line items with detailed descriptions
* Upload logos
* Preview invoices before generation
* Generate professional PDF invoices
* Store invoice data locally in a JSON-based database

---

## Architecture

### Frontend

* React (Vite)
* Handles UI, form input, preview

### Backend

* Node.js + Express
* Handles API, PDF generation, file handling

### Database

* JSON file storage
* Path: `backend/data/db.json`

### PDF Engine

* Puppeteer (HTML → PDF rendering)

---

## Project Structure

```
invoice_app_v2/
├── frontend/
├── backend/
│   ├── src/
│   ├── data/
│   ├── public/
│   └── temp/
├── README.md
```

---

## Application Workflow

### 1. User Authentication (Basic)

* Single-user system
* Signup creates one user
* No multi-user role management

---

### 2. Invoice Creation Flow

#### Step 1: Open Invoice Form

User lands on form with all fields available.

#### Step 2: Fill Invoice Metadata

* Invoice Number (free text)
* Invoice Date
* Due Date (manual)
* Terms
* Order No
* PO No
* Customer Account No

#### Step 3: Seller Information

* Company Name
* Address
* Phone
* Email
* Website
* EIN / Tax ID

#### Step 4: Customer Details

**Bill To**

* Name
* Company
* Address
* Phone
* Email

**Ship To**

* Same structure as Bill To

#### Step 5: Line Items

Each row includes:

* Quantity
* SKU / Item Number
* Manufacturer Part Number
* Description (multi-line textarea)
* Unit Price
* Line Total (auto-calculated)

Users can:

* Add rows
* Remove rows

#### Step 6: Financial Calculations

System automatically calculates:

```
subtotal = sum(line_total)
taxable_amount = subtotal - discount + shipping
tax_amount = taxable_amount * tax_percent / 100
total = taxable_amount + tax_amount
```

Fields:

* Discount (fixed)
* Shipping (manual)
* Tax % (invoice-level)

#### Step 7: Payment Details

* Payment Method
* Bank Name
* Account Number
* Routing Number
* Payment Notes

#### Step 8: Notes / Footer

* Custom message
* Thank you note

---

### 3. Save Invoice

* Clicking **Save Invoice** stores data in:

```
backend/data/db.json
```

* No external database required

---

### 4. Preview Invoice

* Renders HTML version of invoice
* Matches PDF layout
* Ensures WYSIWYG experience

---

### 5. PDF Generation Flow

#### Step 1: Generate PDF

* Frontend sends invoice data to backend

#### Step 2: Template Rendering

* Handlebars template is populated

#### Step 3: Puppeteer Execution

* Launch headless browser
* Render HTML
* Convert to PDF

#### Step 4: Download

* PDF sent to browser
* Automatically downloaded

#### Step 5: Cleanup

* Temporary PDF deleted from server

---

## File Handling

### Logo Upload

* Stored in: `backend/public/logos/`
* Referenced in invoice

### Temporary Files

* PDFs stored in: `backend/temp/`
* Deleted after download

---

## Data Persistence

* All invoices stored in JSON
* No relational database used

Example structure:

```json
{
  "invoices": [],
  "templates": [],
  "users": []
}
```

---

## API Endpoints

### Auth

* POST `/api/auth/signup`

### Invoice

* POST `/api/invoices`
* GET `/api/invoices`
* GET `/api/invoices/:id`

### PDF

* POST `/api/invoices/:id/generate-pdf`

### Upload

* POST `/api/upload/logo`

---

## Local Setup

### Backend

```
cd backend
npm install
npm run dev
```

### Frontend

```
cd frontend
npm install
npm run dev
```

Open:

```
http://localhost:5173
```

---

## Known Limitations

* Single-user only
* No authentication security hardening
* JSON DB not scalable
* Puppeteer may fail on restricted hosting

---

## Future Improvements

* MySQL/PostgreSQL integration
* Multi-user system
* Invoice templates UI
* Email sending
* Stripe/Payment integration
* cPanel optimized deployment

---

## Deployment Notes

### Local

Fully supported

### cPanel

* May not support Puppeteer
* Recommended: VPS or Node-supported hosting

---

## Summary

This application is designed for:

* Personal use
* Small business invoicing
* Quick PDF generation without complex setup

It provides a complete workflow from data entry to downloadable invoice with minimal dependencies.

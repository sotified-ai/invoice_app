import React, { useState } from 'react'
import axios from 'axios'

const emptyItem = () => ({ id: Date.now(), quantity:1, sku:'', mfg_part:'', description:'', unit_price:0, line_total:'0.00' })

export default function InvoiceForm(){
  const [invoice, setInvoice] = useState({
    // header / seller
    seller_name: 'Your Company Ltd.',
    seller_address: '123 Business Road\nCity, State ZIP',
    seller_phone: '',
    seller_email: '',
    seller_website: '',
    seller_ein: '',
    // metadata
    invoice_number: '',
    invoice_date: '',
    due_date: '',
    terms: '',
    order_no: '',
    po_no: '',
    customer_account_no: '',
    // parties
    bill_to_name: '',
    bill_to_company: '',
    bill_to_address: '',
    bill_to_phone: '',
    bill_to_email: '',
    ship_to_name: '',
    ship_to_company: '',
    ship_to_address: '',
    ship_to_phone: '',
    ship_to_email: '',
    // items and financials
    items: [emptyItem()],
    tax_percent: 0,
    discount_fixed: 0,
    shipping_amount: 0,
    subtotal: '0.00',
    tax_amount: '0.00',
    total: '0.00',
    currency: 'USD',
    // payment
    payment_method: '',
    bank_name: '',
    account_number: '',
    routing_number: '',
    payment_notes: '',
    notes: 'Thank you for your business.',
    logo_url: ''
  })

  function recalc(items, overrides={}){
    const subtotal = items.reduce((s,it)=> s + (parseFloat(it.line_total||0) || 0),0)
    const discount = parseFloat((overrides.discount_fixed ?? invoice.discount_fixed) || 0) || 0
    const shipping = parseFloat((overrides.shipping_amount ?? invoice.shipping_amount) || 0) || 0
    const taxable = subtotal - discount + shipping
    const tax_amount = taxable * (parseFloat((overrides.tax_percent ?? invoice.tax_percent) || 0)/100)
    const total = taxable + tax_amount
    setInvoice(prev => ({ ...prev, items, subtotal: subtotal.toFixed(2), tax_amount: tax_amount.toFixed(2), total: total.toFixed(2), ...overrides }))
  }

  function updateItem(idx, field, value){
    const items = [...invoice.items]
    items[idx] = {...items[idx], [field]: value}
    items[idx].line_total = ( (parseFloat(items[idx].quantity||0) || 0) * (parseFloat(items[idx].unit_price||0) || 0) ).toFixed(2)
    recalc(items)
  }

  function addRow(){ const items = [...invoice.items, emptyItem()]; setInvoice(prev=>({...prev, items})); recalc(items) }
  function removeRow(i){ const items = invoice.items.filter((_,idx)=>idx!==i); setInvoice(prev=>({...prev, items})); recalc(items) }

  async function save(){
    const res = await axios.post('/api/invoices', invoice)
    alert('Saved. Invoice ID: ' + res.data.id)
  }

  async function generatePDF(){
    const res = await axios.post('/api/invoices', invoice)
    const id = res.data.id
    const resp = await axios.post(`/api/invoices/${id}/generate-pdf`, {}, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([resp.data]))
    const a = document.createElement('a'); a.href = url; a.download = (invoice.invoice_number||id)+'.pdf'; document.body.appendChild(a); a.click(); a.remove();
  }

  return (
    <div className="form">
      <section className="meta">
        <label>Invoice #<input value={invoice.invoice_number} onChange={e=>setInvoice({...invoice, invoice_number:e.target.value})} /></label>
        <label>Invoice Date<input type="date" value={invoice.invoice_date} onChange={e=>setInvoice({...invoice, invoice_date:e.target.value})} /></label>
        <label>Due Date<input type="date" value={invoice.due_date} onChange={e=>setInvoice({...invoice, due_date:e.target.value})} /></label>
        <label>Terms<input value={invoice.terms} onChange={e=>setInvoice({...invoice, terms:e.target.value})} /></label>
        <label>Order No<input value={invoice.order_no} onChange={e=>setInvoice({...invoice, order_no:e.target.value})} /></label>
        <label>P.O. No<input value={invoice.po_no} onChange={e=>setInvoice({...invoice, po_no:e.target.value})} /></label>
      </section>

      <section className="seller">
        <h4>Seller Details</h4>
        <input placeholder="Company name" value={invoice.seller_name} onChange={e=>setInvoice({...invoice, seller_name:e.target.value})} />
        <textarea placeholder="Address" value={invoice.seller_address} onChange={e=>setInvoice({...invoice, seller_address:e.target.value})}></textarea>
        <input placeholder="Phone" value={invoice.seller_phone} onChange={e=>setInvoice({...invoice, seller_phone:e.target.value})} />
        <input placeholder="Email" value={invoice.seller_email} onChange={e=>setInvoice({...invoice, seller_email:e.target.value})} />
        <input placeholder="Website" value={invoice.seller_website} onChange={e=>setInvoice({...invoice, seller_website:e.target.value})} />
        <input placeholder="EIN / Tax ID" value={invoice.seller_ein} onChange={e=>setInvoice({...invoice, seller_ein:e.target.value})} />
      </section>

      <section className="addresses">
        <div>
          <h4>Bill To</h4>
          <input placeholder="Contact name" value={invoice.bill_to_name} onChange={e=>setInvoice({...invoice, bill_to_name:e.target.value})} />
          <input placeholder="Company (optional)" value={invoice.bill_to_company} onChange={e=>setInvoice({...invoice, bill_to_company:e.target.value})} />
          <textarea placeholder="Address" value={invoice.bill_to_address} onChange={e=>setInvoice({...invoice, bill_to_address:e.target.value})}></textarea>
          <input placeholder="Phone" value={invoice.bill_to_phone} onChange={e=>setInvoice({...invoice, bill_to_phone:e.target.value})} />
          <input placeholder="Email" value={invoice.bill_to_email} onChange={e=>setInvoice({...invoice, bill_to_email:e.target.value})} />
        </div>
        <div>
          <h4>Ship To</h4>
          <input placeholder="Contact name" value={invoice.ship_to_name} onChange={e=>setInvoice({...invoice, ship_to_name:e.target.value})} />
          <input placeholder="Company (optional)" value={invoice.ship_to_company} onChange={e=>setInvoice({...invoice, ship_to_company:e.target.value})} />
          <textarea placeholder="Address" value={invoice.ship_to_address} onChange={e=>setInvoice({...invoice, ship_to_address:e.target.value})}></textarea>
          <input placeholder="Phone" value={invoice.ship_to_phone} onChange={e=>setInvoice({...invoice, ship_to_phone:e.target.value})} />
          <input placeholder="Email" value={invoice.ship_to_email} onChange={e=>setInvoice({...invoice, ship_to_email:e.target.value})} />
        </div>
      </section>

      <section className="items">
        <h4>Line Items</h4>
        <table>
          <thead><tr><th>Qty</th><th>SKU / Item No</th><th>MFG Part #</th><th>Description</th><th>Unit</th><th>Line Total</th><th></th></tr></thead>
          <tbody>
            {invoice.items.map((it, idx)=>(
              <tr key={it.id}>
                <td><input type="number" value={it.quantity} onChange={e=>updateItem(idx,'quantity', e.target.value)} /></td>
                <td><input value={it.sku} onChange={e=>updateItem(idx,'sku', e.target.value)} /></td>
                <td><input value={it.mfg_part} onChange={e=>updateItem(idx,'mfg_part', e.target.value)} /></td>
                <td><textarea rows={3} value={it.description} onChange={e=>updateItem(idx,'description', e.target.value)} /></td>
                <td><input type="number" value={it.unit_price} onChange={e=>updateItem(idx,'unit_price', e.target.value)} /></td>
                <td style={{textAlign:'right'}}>{it.line_total}</td>
                <td><button onClick={()=>removeRow(idx)}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={addRow}>Add Row</button>
      </section>

      <section className="calculations">
        <label>Discount (fixed)<input type="number" value={invoice.discount_fixed} onChange={e=>{ setInvoice({...invoice, discount_fixed: e.target.value}); recalc(invoice.items,{ discount_fixed: parseFloat(e.target.value||0) }); }} /></label>
        <label>Shipping<input type="number" value={invoice.shipping_amount} onChange={e=>{ setInvoice({...invoice, shipping_amount: e.target.value}); recalc(invoice.items,{ shipping_amount: parseFloat(e.target.value||0) }); }} /></label>
        <label>Tax % <input type="number" value={invoice.tax_percent} onChange={e=>{ setInvoice({...invoice, tax_percent: e.target.value}); recalc(invoice.items,{ tax_percent: parseFloat(e.target.value||0) }); }} /></label>

        <div>Subtotal: {invoice.subtotal}</div>
        <div>Tax: {invoice.tax_amount}</div>
        <div>Total: {invoice.total}</div>
      </section>

      <section className="payment">
        <h4>Payment Details</h4>
        <input placeholder="Payment method (e.g., Bank Transfer)" value={invoice.payment_method} onChange={e=>setInvoice({...invoice, payment_method:e.target.value})} />
        <input placeholder="Bank name" value={invoice.bank_name} onChange={e=>setInvoice({...invoice, bank_name:e.target.value})} />
        <input placeholder="Account number" value={invoice.account_number} onChange={e=>setInvoice({...invoice, account_number:e.target.value})} />
        <input placeholder="Routing number" value={invoice.routing_number} onChange={e=>setInvoice({...invoice, routing_number:e.target.value})} />
        <textarea placeholder="Payment notes" value={invoice.payment_notes} onChange={e=>setInvoice({...invoice, payment_notes:e.target.value})}></textarea>
      </section>

      <section className="footer-notes">
        <textarea rows={3} value={invoice.notes} onChange={e=>setInvoice({...invoice, notes:e.target.value})}></textarea>
      </section>

      <section className="actions">
        <button onClick={save}>Save Invoice (DB)</button>
        <button onClick={generatePDF}>Generate PDF & Download</button>
      </section>
    </div>
  )
}

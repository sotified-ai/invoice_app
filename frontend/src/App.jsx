import React, { useState } from 'react'
import InvoiceForm from './InvoiceForm'

export default function App(){
  const [user] = useState({ email: 'you@example.com' })
  return (
    <div className="container">
      <header><h1>Invoice App (MVP)</h1></header>
      <main><InvoiceForm /></main>
      <footer className="footer">Single-user demo • Polished UI option</footer>
    </div>
  )
}

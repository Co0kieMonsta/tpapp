'use client'

import { FileJson } from 'lucide-react'

// Define a type that matches the quote structure we need
type ExportQuote = {
  id: string
  createdAt: Date
  customerName: string
  total: number
  items: {
    quantity: number
    priceAtQuote: number
    product: {
      name: string
      unitOfMeasure: string
      description: string | null
    }
  }[]
}

export function ExportXMLButton({ quote }: { quote: ExportQuote }) {
  const downloadXML = () => {
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<quote id="${quote.id}">
  <header>
    <customerName>${quote.customerName}</customerName>
    <date>${quote.createdAt.toISOString()}</date>
    <total>${quote.total.toFixed(2)}</total>
  </header>
  <items>
    ${quote.items.map(item => `
    <item>
      <productName>${item.product.name}</productName>
      <description>${item.product.description || ''}</description>
      <quantity>${item.quantity}</quantity>
      <uom>${item.product.unitOfMeasure}</uom>
      <price>${item.priceAtQuote.toFixed(2)}</price>
      <total>${(item.quantity * item.priceAtQuote).toFixed(2)}</total>
    </item>
    `).join('').trim()}
  </items>
</quote>`

    const blob = new Blob([xmlContent], { type: 'text/xml' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quote-${quote.id.slice(0, 8)}.xml`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={downloadXML}
      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
    >
      <FileJson className="h-4 w-4" />
      Export XML
    </button>
  )
}

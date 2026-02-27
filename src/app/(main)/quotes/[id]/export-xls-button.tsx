'use client'

import { FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'

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

export function ExportXLSButton({ quote }: { quote: ExportQuote }) {
  const downloadXLS = () => {
    // Flatten data for Excel
    const rows = quote.items.map(item => ({
      QuoteID: quote.id.slice(0, 8),
      Date: quote.createdAt.toLocaleDateString(),
      Customer: quote.customerName,
      Product: item.product.name,
      Description: item.product.description || '',
      Quantity: item.quantity,
      UOM: item.product.unitOfMeasure,
      UnitPrice: item.priceAtQuote,
      Total: item.quantity * item.priceAtQuote
    }))

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Quote Details")

    // Generate Excel file
    XLSX.writeFile(workbook, `Quote_${quote.id.slice(0, 8)}.xlsx`)
  }

  return (
    <button
      onClick={downloadXLS}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
    >
      <FileSpreadsheet className="h-4 w-4" />
      Export Excel
    </button>
  )
}

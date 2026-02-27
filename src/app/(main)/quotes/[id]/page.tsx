import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, Edit } from 'lucide-react'
import { DownloadPDFButton } from './download-pdf-button'

interface Product {
  id: string
  name: string
  description: string | null
  unitOfMeasure: string
}

interface QuoteItem {
  id: string
  quantity: number
  priceAtQuote: number
  product: Product
}

export default async function QuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  })

  if (!quote || quote.userId !== user.id) {
    redirect('/quotes')
  }

  return (
    <div className="max-w-4xl mx-auto print:max-w-none">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 print:hidden">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href={`/quotes/${id}/edit`} className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors w-full sm:w-auto">
            <Edit className="h-4 w-4" />
            Edit Quote
          </Link>
          <DownloadPDFButton quoteId={quote.id} customerName={quote.customerName} />
        </div>
      </div>

      <div id="quote-content" className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden print:shadow-none print:border-none">
{/*

 
        <div className="px-8 py-10 bg-gray-50 border-b border-gray-100 print:bg-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">COT.</h1>
              <p className="text-gray-500 mt-2">#{quote.id.slice(0, 8)}</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-semibold text-gray-900">My Company Name</h2>
            </div>
          </div>
        </div>

        
        <div className="px-8 py-8 grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Bill To</h3>
            <p className="text-lg font-medium text-gray-900">{quote.customerName}</p>
            {quote.customerEmail && <p className="text-gray-500">{quote.customerEmail}</p>}
          </div>
          <div className="text-right">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quote Details</h3>
            <div className="space-y-1">
              <p className="text-gray-500">Date: <span className="text-gray-900 font-medium">{quote.createdAt.toLocaleDateString()}</span></p>

            </div>
          </div>
        </div> 
*/}


        {/* Items Table */}
        <div className="px-8 py-2 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-24">CANT.</th>
                <th className="py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-24">UNIDAD</th>
                <th className="py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">DESCRIPCIÓN</th>
                <th className="py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">P. UNITARIO</th>
                <th className="py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {quote.items.map((item: QuoteItem) => (
                <tr key={item.id} className="even:bg-gray-50">
                  <td className="py-1 text-left text-sm text-gray-900">{item.quantity.toString().padStart(2, '0')}</td>
                  <td className="py-1 text-left text-sm text-gray-500">{item.product.unitOfMeasure}</td>
                  <td className="py-1 text-sm text-gray-900">
                    <div className="font-medium">{item.product.name}</div>
                    <div className="text-gray-500">{item.product.description}</div>
                  </td>
                  <td className="py-1 text-right text-sm text-gray-900">S/ {item.priceAtQuote.toFixed(2)}</td>
                  <td className="py-1 text-right text-sm font-semibold text-gray-900">
                    S/ {(item.quantity * item.priceAtQuote).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="px-8 py-2 bg-gray-50 border-t border-gray-100 flex justify-end print:bg-white">
          <div className="w-64">         
            <div className="flex justify-between items-center text-2xl font-bold text-black mt-4 pt-4 border-t border-gray-200">
              <span>Total</span>
              <span>S/ {quote.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

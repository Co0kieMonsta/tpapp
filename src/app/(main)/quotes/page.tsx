import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Plus, FileText, Trash, Eye, Edit } from 'lucide-react'
import { DeleteQuoteButton } from './delete-quote-button'

interface QuoteItem {
  id: string
  quoteId: string
  productId: string
  quantity: number
  priceAtQuote: number
}

interface Quote {
  id: string
  customerName: string
  total: number
  createdAt: Date
  updatedAt: Date
  userId: string
}

export default async function QuotesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const quotes = await prisma.quote.findMany({
    where: {
      userId: user.id
    },
    orderBy: { createdAt: 'desc' },
    include: {
        items: true
    }
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Quotes</h2>
        <Link 
          href="/quotes/new"
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Quote
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {quotes.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  No quotes found. Create one to get started.
                </td>
              </tr>
            ) : (
              quotes.map((quote: Quote & { items: QuoteItem[] }) => (
                <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{quote.customerName}</div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    S/ {quote.total.toFixed(2)}
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {quote.items.length} items
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-3">
                      <Link href={`/quotes/${quote.id}`} className="text-green-600 hover:text-green-900">
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link href={`/quotes/${quote.id}/edit`} className="text-orange-600 hover:text-orange-900">
                        <Edit className="h-4 w-4" />
                      </Link>
                      <DeleteQuoteButton id={quote.id} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

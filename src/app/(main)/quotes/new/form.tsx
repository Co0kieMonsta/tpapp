'use client'

import { createQuote } from '../actions'
import { useState, useEffect } from 'react'
import { Plus, Trash, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

type Product = {
  id: string
  name: string
  sellPrice: number
  unitOfMeasure: string
}

type QuoteItem = {
  productId: string
  productName: string // for display
  productUOM: string // for display
  quantity: number
  priceAtQuote: number
}

export default function NewQuoteForm({ products }: { products: Product[] }) {
  const router = useRouter()
  const [items, setItems] = useState<QuoteItem[]>([])
  // ... (rest of simple state lines if any, or just leave them matching context)
  const [error, setError] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Selection state
  const [selectedProductId, setSelectedProductId] = useState<string>('')

  const handleAddItem = () => {
    if (!selectedProductId) return
    const product = products.find(p => p.id === selectedProductId)
    if (!product) return

    setItems(prev => [
      ...prev,
      {
        productId: product.id,
        productName: product.name,
        productUOM: product.unitOfMeasure,
        quantity: 1,
        priceAtQuote: product.sellPrice
      }
    ])
    setSelectedProductId('') // Reset selection
  }

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpdateItem = (index: number, field: keyof QuoteItem, value: any) => {
    setItems(prev => prev.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value }
      }
      return item
    }))
  }

  const grandTotal = items.reduce((sum, item) => sum + (item.quantity * item.priceAtQuote), 0)

  const handleSubmit = async (formData: FormData) => {
    if (items.length === 0) {
      setError({ form: ['Please add at least one item'] })
      return
    }

    setIsLoading(true)
    setError(null)
    
    // Append items as JSON
    formData.append('items', JSON.stringify(items))

    const result = await createQuote(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
      MySwal.fire({
        title: 'Error!',
        text: 'Failed to create quote. Please check the form.',
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      })
    } else if (result?.success) {
      await MySwal.fire({
        title: 'Success!',
        text: 'Quote created successfully.',
        icon: 'success',
        confirmButtonColor: '#4f46e5',
        timer: 1500,
        showConfirmButton: false
      })
      router.push('/quotes')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <form action={handleSubmit} className="space-y-8">
        {/* Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
              Customer Name
            </label>
            <input
              type="text"
              name="customerName"
              required
              className="block w-full rounded-lg border-gray-400 text-black shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-4 py-3 border"
              placeholder="e.g. Acme Corp"
            />
             {error?.customerName && <p className="mt-1 text-sm text-red-600">{error.customerName}</p>}
          </div>
          <div>
            <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-2">
              Customer Email (Optional)
            </label>
            <input
              type="email"
              name="customerEmail"
              className="block w-full rounded-lg border-gray-400 text-black shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-4 py-3 border"
              placeholder="contact@acme.com"
            />
             {error?.customerEmail && <p className="mt-1 text-sm text-red-600">{error.customerEmail}</p>}
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Item Selection */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Items</h3>
          
          <div className="flex gap-4 mb-6">
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="block w-full rounded-lg border-gray-400 text-black shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-4 py-3 border"
            >
              <option value="">Select a product...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} - ${p.sellPrice.toFixed(2)} / {p.unitOfMeasure}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAddItem}
              disabled={!selectedProductId}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>

          {/* Items Table */}
          {items.length > 0 ? (
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">UOM</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">Price</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-32">Total</th>
                    <th className="px-4 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-20 rounded border-gray-400 text-black shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-1 border"
                        />
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">{item.productUOM}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.productName}</td>
                      <td className="px-4 py-2">
                        <input
                           type="number"
                           min="0"
                           step="0.01"
                           value={item.priceAtQuote}
                           onChange={(e) => handleUpdateItem(index, 'priceAtQuote', parseFloat(e.target.value) || 0)}
                           className="w-28 rounded border-gray-400 text-black shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-1 border"
                        />
                      </td>
                      <td className="px-4 py-2 text-right text-sm font-medium text-gray-900">
                        ${(item.quantity * item.priceAtQuote).toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td colSpan={4} className="px-4 py-3 text-right text-sm font-bold text-gray-900">Grand Total:</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">${grandTotal.toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
             <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 text-gray-500">
                No items added yet. Select a product above.
             </div>
          )}
           {error?.form && <p className="text-sm text-red-600 text-center mt-2">{error.form}</p>}
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:opacity-70 font-medium"
          >
            <Save className="h-4 w-4" />
            {isLoading ? 'Creating...' : 'Create Quote'}
          </button>
        </div>
      </form>
    </div>
  )
}

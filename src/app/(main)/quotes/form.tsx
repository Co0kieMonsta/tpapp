'use client'

import { createQuote, updateQuote } from './actions'
import { useState } from 'react'
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

type QuoteFormProps = {
  products: Product[]
  initialData?: {
    id: string
    customerName: string
    items: QuoteItem[]
  }
}

export default function QuoteForm({ products, initialData }: QuoteFormProps) {
  const router = useRouter()
  const [items, setItems] = useState<QuoteItem[]>(initialData?.items || [])
  const [error, setError] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Selection state
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
    setSearchQuery('')
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

    let result
    if (initialData) {
      result = await updateQuote(initialData.id, formData)
    } else {
      result = await createQuote(formData)
    }
    
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
      MySwal.fire({
        title: 'Error!',
        text: initialData ? 'Failed to update quote.' : 'Failed to create quote.',
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      })
    } else if (result?.success) {
      await MySwal.fire({
        title: 'Success!',
        text: initialData ? 'Quote updated successfully.' : 'Quote created successfully.',
        icon: 'success',
        confirmButtonColor: '#4f46e5',
        timer: 1500,
        showConfirmButton: false
      })
      router.push('/quotes')
      router.refresh()
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <form action={handleSubmit} className="space-y-8">
        {/* Customer Info */}
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
              Customer Name
            </label>
            <input
              type="text"
              name="customerName"
              required
              defaultValue={initialData?.customerName}
              className="block w-full rounded-lg border-gray-400 text-black shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-4 py-3 border"
              placeholder="e.g. TP Solutions"
            />
             {error?.customerName && <p className="mt-1 text-sm text-red-600">{error.customerName}</p>}
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Item Selection */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Items</h3>
          
          <div className="flex gap-4 mb-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search and select a product..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setSelectedProductId('') // clear selection when typing
                  setIsDropdownOpen(true)
                }}
                onFocus={() => setIsDropdownOpen(true)}
                onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)} // delay to allow click on item
                className="block w-full rounded-lg border-gray-400 text-black shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-4 py-3 border"
              />
              {isDropdownOpen && (
                <ul className="absolute z-10 w-full mt-1 max-h-60 overflow-auto bg-white border border-gray-300 rounded-lg shadow-lg">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map(p => (
                      <li
                        key={p.id}
                        onClick={(e) => {
                           e.stopPropagation()
                           setSelectedProductId(p.id)
                           setSearchQuery(`${p.name} - S/ ${p.sellPrice.toFixed(2)} / ${p.unitOfMeasure}`)
                           setIsDropdownOpen(false)
                        }}
                        className="cursor-pointer px-4 py-3 hover:bg-orange-50 text-sm border-b border-gray-100 last:border-0"
                      >
                         <div className="font-medium text-gray-900">{p.name}</div>
                         <div className="text-gray-500 text-xs mt-1">S/ {p.sellPrice.toFixed(2)} / {p.unitOfMeasure}</div>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-3 text-sm text-gray-500 text-center">No products found</li>
                  )}
                </ul>
              )}
            </div>
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
                        S/ {(item.quantity * item.priceAtQuote).toFixed(2)}
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
                    <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">S/ {grandTotal.toFixed(2)}</td>
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
            {isLoading ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Update Quote' : 'Create Quote')}
          </button>
        </div>
      </form>
    </div>
  )
}

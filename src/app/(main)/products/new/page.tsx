'use client'

import { createProduct } from '../actions'

import { useFormState } from 'react-dom'
// Need to create a client component wrapper for form state if I use useFormState, 
// OR just use a simple form with explicit state.
// Start simple: Client component form.

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

export default function NewProductPage() {
  const router = useRouter()
  const [error, setError] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)
    const result = await createProduct(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
      MySwal.fire({
        title: 'Error!',
        text: 'Failed to create product. Please check the form.',
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      })
    } else if (result?.success) {
       await MySwal.fire({
        title: 'Success!',
        text: 'Product created successfully.',
        icon: 'success',
        confirmButtonColor: '#4f46e5',
        timer: 1500,
        showConfirmButton: false
      })
      router.push('/products')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/products" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Product</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Product Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="block w-full rounded-lg border-gray-400 text-black shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-4 py-3 border"
                placeholder="Use Capital Letters"
              />
              {error?.name && <p className="mt-1 text-sm text-red-600">{error.name}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="sellPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Sell Price
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">S/</span>
                  </div>
                  <input
                    type="number"
                    name="sellPrice"
                    id="sellPrice"
                    step="0.01"
                    required
                    className="block w-full rounded-lg border-gray-400 text-black pl-7 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-4 py-3 border"
                    placeholder="0.00"
                  />
                </div>
                {error?.sellPrice && <p className="mt-1 text-sm text-red-600">{error.sellPrice}</p>}
              </div>

              <div>
                <label htmlFor="buyPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Buy Price
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">S/</span>
                  </div>
                  <input
                    type="number"
                    name="buyPrice"
                    id="buyPrice"
                    step="0.01"
                    required
                    className="block w-full rounded-lg border-gray-400 text-black pl-7 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-4 py-3 border"
                    placeholder="0.00"
                  />
                </div>
                {error?.buyPrice && <p className="mt-1 text-sm text-red-600">{error.buyPrice}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="unitOfMeasure" className="block text-sm font-medium text-gray-700 mb-2">
                  Unit of Measure
                </label>
                <select
                  name="unitOfMeasure"
                  id="unitOfMeasure"
                  required
                  defaultValue="UND"
                  className="block w-full rounded-lg border-gray-400 text-black shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-4 py-3 border"
                >
                  <option value="BALD">BALDE</option>
                  <option value="BRL">BARRIL</option>
                  <option value="BOLS">BOLSA</option>
                  <option value="BOT">BOTELLA</option>
                  <option value="CAJ">CAJA</option>
                  <option value="CRR">CARRETE</option>
                  <option value="CTON">CARTON</option>
                  <option value="CIL">CILINDRO</option>
                  <option value="DOC">DOCENA</option>
                  <option value="ENV">ENVASE</option>
                  <option value="FCO">FRASCO</option>
                  <option value="GL">GALÓN INGLÉS (4,54L)</option>
                  <option value="JGO">JUEGO</option>
                  <option value="KG">KILOGRAMO</option>
                  <option value="KIT">KIT</option>
                  <option value="LAT">LATA</option>
                  <option value="M">METRO</option>
                  <option value="PQT">PAQUETE</option>
                  <option value="PAR">PAR</option>
                  <option value="PZ">PIEZA</option>
                  <option value="SCO">SACO</option>
                  <option value="UND">UNIDAD</option>
                  <option value="GL">US GALLON (3,78L)</option>
                </select>
                {error?.unitOfMeasure && <p className="mt-1 text-sm text-red-600">{error.unitOfMeasure}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows={4}
                className="block w-full rounded-lg border-gray-400 text-black shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-4 py-3 border"
                placeholder="Product details..."
              />
            </div>
          </div>

          {error?.form && <p className="text-sm text-red-600 text-center">{error.form}</p>}

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:opacity-70 font-medium"
            >
              <Save className="h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

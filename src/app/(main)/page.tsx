import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      redirect('/login')
    }

    const [productCount, quoteCount] = await Promise.all([
      prisma.product.count({ where: { userId: user.id } }),
      prisma.quote.count({ where: { userId: user.id } }),
    ])

    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium">Total Quotes</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">{quoteCount}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium">Total Products</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">{productCount}</p>
          </div>
        </div>
      </div>
    )
  } catch (error: any) {
    return (
      <div className="p-8 bg-red-50 text-red-900 border border-red-200 rounded-lg whitespace-pre-wrap">
        <h2 className="text-xl font-bold mb-4">Dashboard Server Error</h2>
        {error.message || String(error)}
        <br/><br/>
        {error.stack}
      </div>
    )
  }
}

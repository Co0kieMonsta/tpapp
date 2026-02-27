import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import QuoteForm from '../../form'

export default async function EditQuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [quote, products] = await Promise.all([
    prisma.quote.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    }),
    prisma.product.findMany({
      where: { userId: user.id },
      orderBy: { name: 'asc' }
    })
  ])

  if (!quote || quote.userId !== user.id) {
    redirect('/quotes')
  }

  // Transform quote data for form
  const initialData = {
    id: quote.id,
    customerName: quote.customerName,
    customerEmail: quote.customerEmail,
    items: quote.items.map((item: any) => ({
      productId: item.productId,
      productName: item.product.name,
      productUOM: item.product.unitOfMeasure,
      quantity: item.quantity,
      priceAtQuote: item.priceAtQuote
    }))
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Quote</h2>
      <QuoteForm products={products} initialData={initialData} />
    </div>
  )
}

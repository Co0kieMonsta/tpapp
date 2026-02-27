import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import QuoteForm from '../form'

export default async function NewQuotePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const products = await prisma.product.findMany({
    where: {
      userId: user.id
    },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Create New Quote</h1>
      <QuoteForm products={products} />
    </div>
  )
}

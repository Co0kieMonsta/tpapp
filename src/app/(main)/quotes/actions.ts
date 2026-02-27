'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

// Schema for validation
const quoteItemSchema = z.object({
  productId: z.string(),
  quantity: z.coerce.number().min(1),
  priceAtQuote: z.coerce.number().min(0),
})

const quoteSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email().optional().or(z.literal('')),
  items: z.array(quoteItemSchema).min(1, 'At least one item is required'),
})

export async function createQuote(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Parse items from JSON string (client will stringify)
  const itemsJson = formData.get('items') as string
  let items: any[] = []
  try {
    items = JSON.parse(itemsJson)
  } catch (e) {
    return { error: { form: ['Invalid items data'] } }
  }

  const rawData = {
    customerName: formData.get('customerName'),
    customerEmail: formData.get('customerEmail'),
    items,
  }

  const result = quoteSchema.safeParse(rawData)

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors }
  }

  // Calculate total
  const total = result.data.items.reduce((sum, item) => sum + (item.quantity * item.priceAtQuote), 0)

  try {
    await prisma.quote.create({
      data: {
        customerName: result.data.customerName,
        customerEmail: result.data.customerEmail || null,
        total,
        userId: user.id,

        items: {
          create: result.data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtQuote: item.priceAtQuote
          }))
        }
      },
    })
  } catch (e) {
    console.error(e)
    return { error: { form: ['Failed to create quote'] } }
  }

  revalidatePath('/quotes')
  return { success: true }
}

export async function deleteQuote(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
  
    if (!user) {
      redirect('/login')
    }
  
    const existingQuote = await prisma.quote.findUnique({
      where: { id },
    })
  
    if (!existingQuote || existingQuote.userId !== user.id) {
      return { error: 'Quote not found or access denied' }
    }
  
    try {
      await prisma.quote.delete({
        where: { id },
      })
    } catch (e) {
      return { error: 'Failed to delete quote' }
    }
  
    revalidatePath('/quotes')
    return { error: null }
  }

export async function updateQuote(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const existingQuote = await prisma.quote.findUnique({
    where: { id },
  })

  if (!existingQuote || existingQuote.userId !== user.id) {
    return { error: { form: ['Quote not found or access denied'] } }
  }

  // Parse items
  const itemsJson = formData.get('items') as string
  let items: any[] = []
  try {
    items = JSON.parse(itemsJson)
  } catch (e) {
    return { error: { form: ['Invalid items data'] } }
  }

  const rawData = {
    customerName: formData.get('customerName'),
    customerEmail: formData.get('customerEmail'),
    items,
  }

  const result = quoteSchema.safeParse(rawData)

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors }
  }

  const total = result.data.items.reduce((sum, item) => sum + (item.quantity * item.priceAtQuote), 0)

  try {
    await prisma.$transaction([
      // Delete existing items
      prisma.quoteItem.deleteMany({
        where: { quoteId: id },
      }),
      // Update quote details
      prisma.quote.update({
        where: { id },
        data: {
          customerName: result.data.customerName,
          customerEmail: result.data.customerEmail || null,
          total,
          updatedAt: new Date(),
        },
      }),
      // Create new items
      prisma.quoteItem.createMany({
        data: result.data.items.map(item => ({
          quoteId: id,
          productId: item.productId,
          quantity: item.quantity,
          priceAtQuote: item.priceAtQuote,
        })),
      }),
    ])
  } catch (e) {
    console.error(e)
    return { error: { form: ['Failed to update quote'] } }
  }

  revalidatePath('/quotes')
  revalidatePath(`/quotes/${id}`)
  return { success: true }
}

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  sellPrice: z.coerce.number().min(0, 'Sell price must be positive'),
  buyPrice: z.coerce.number().min(0, 'Buy price must be positive'),
  unitOfMeasure: z.enum(['BALD', 'BRL', 'BOLS', 'BOT', 'CAJ', 'CRR', 'CTON', 'CIL', 'DOC', 'ENV', 'FCO', 'GL', 'JGO', 'KG', 'KIT', 'LAT', 'M', 'PQT', 'PAR', 'PZ', 'SCO', 'UND']),
})

export async function createProduct(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const rawData = {
    name: formData.get('name'),
    description: formData.get('description'),
    sellPrice: formData.get('sellPrice'),
    buyPrice: formData.get('buyPrice'),
    unitOfMeasure: formData.get('unitOfMeasure'),
  }

  const result = productSchema.safeParse(rawData)

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors }
  }

  try {
    await prisma.product.create({
      data: {
        ...result.data,
        userId: user.id,
      },
    })
  } catch (e) {
    console.error(e)
    return { error: { form: ['Failed to create product'] } }
  }

  revalidatePath('/products')
  return { success: true }
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const rawData = {
    name: formData.get('name'),
    description: formData.get('description'),
    sellPrice: formData.get('sellPrice'),
    buyPrice: formData.get('buyPrice'),
    unitOfMeasure: formData.get('unitOfMeasure'),
  }

  const result = productSchema.safeParse(rawData)

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors }
  }

  // Verify ownership
  const existingProduct = await prisma.product.findUnique({
    where: { id },
  })

  if (!existingProduct || existingProduct.userId !== user.id) {
    return { error: { form: ['Product not found or access denied'] } }
  }

  try {
    await prisma.product.update({
      where: { id },
      data: result.data,
    })
  } catch (e) {
    return { error: { form: ['Failed to update product'] } }
  }

  revalidatePath('/products')
  return { success: true }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify ownership
  const existingProduct = await prisma.product.findUnique({
    where: { id },
  })

  if (!existingProduct || existingProduct.userId !== user.id) {
    return { error: 'Product not found or access denied' }
  }

  try {
    await prisma.product.delete({
      where: { id },
    })
  } catch (e) {
    return { error: 'Failed to delete product' }
  }

  revalidatePath('/products')
  return { success: true }
}

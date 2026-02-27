'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/utils/supabase/admin'

export async function adminCreateUser(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  // Create user using the admin client
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm the user
  })

  if (error) {
    return { error: error.message }
  }

  // Record user in our public.User table as well
  // Assuming there's a trigger in Supabase to do this, or we need to do it manually.
  // Checking the schema...
  
  revalidatePath('/admin/users')
  return { success: true, message: 'User created successfully' }
}

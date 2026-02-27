'use client'
 
import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'
 
export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus()
 
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:opacity-70 font-medium"
    >
      {pending && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
      {children}
    </button>
  )
}

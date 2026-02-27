'use client'

import { useState } from 'react'
import { adminCreateUser } from './actions'
import { Loader2 } from 'lucide-react'

export default function AdminUsersPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setMessage(null)
    
    try {
      const result = await adminCreateUser(formData)
      if (result.error) {
        setMessage({ text: result.error, type: 'error' })
      } else {
        setMessage({ text: result.message || 'User created successfully', type: 'success' })
        // Optional: clear form
      }
    } catch (e) {
      setMessage({ text: 'An unexpected error occurred.', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
        <p className="mt-2 text-sm text-gray-700">
          Create new users who can access the application.
        </p>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Create New User
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Enter the email and password for the new user.</p>
          </div>
          <form className="mt-5 sm:flex sm:items-center space-y-3 sm:space-y-0 sm:space-x-3" action={handleSubmit}>
            <div className="w-full sm:max-w-xs">
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border text-black"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="w-full sm:max-w-xs">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border text-black"
                placeholder="Password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-70"
            >
              {isLoading && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
              Create
            </button>
          </form>
          
          {message && (
             <div className={`mt-4 text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
               {message.text}
             </div>
          )}
        </div>
      </div>
    </div>
  )
}

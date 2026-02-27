'use client'

import { useEffect } from 'react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Server execution error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h2>
        <div className="bg-gray-100 p-4 rounded text-left overflow-auto text-sm text-gray-800 mb-6 max-h-64">
          <p className="font-semibold">Error Message:</p>
          <p className="whitespace-pre-wrap font-mono">{error.message}</p>
          {error.digest && (
            <p className="mt-2 text-xs text-gray-500">Digest: {error.digest}</p>
          )}
        </div>
        <button
          onClick={() => reset()}
          className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

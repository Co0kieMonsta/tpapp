'use client'

import { deleteQuote } from './actions'
import { useState } from 'react'
import { Trash, Loader2 } from 'lucide-react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

export function DeleteQuoteButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    })

    if (result.isConfirmed) {
      setIsDeleting(true)
      const actionResult = await deleteQuote(id)
      setIsDeleting(false)
      
      if (!actionResult?.error) {
        await MySwal.fire({
          title: 'Deleted!',
          text: 'Quote has been deleted.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        })
      } else {
        await MySwal.fire({
          title: 'Error!',
          text: 'Failed to delete quote',
          icon: 'error'
        })
      }
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-900 disabled:opacity-50"
    >
      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
    </button>
  )
}

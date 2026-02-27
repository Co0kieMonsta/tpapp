'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Home, Package, FileText, LogOut, Users } from 'lucide-react'
import { usePathname } from 'next/navigation'

export function MobileNav({ userEmail, signOutAction }: { userEmail: string, signOutAction: () => Promise<void> }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/products', label: 'Products', icon: Package },
    { href: '/quotes', label: 'Quotes', icon: FileText },
    { href: '/admin/users', label: 'Users', icon: Users },
  ]

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <>
      <header className="bg-white border-b border-gray-200 md:hidden p-4 flex justify-between items-center sticky top-0 z-20">
        <h1 className="text-xl font-bold text-orange-600">TPSoluciones</h1>
        <button onClick={toggleMenu} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-out Menu */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-40 md:hidden flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-orange-600 flex items-center gap-2">
            <FileText className="h-8 w-8" />
            TPSoluciones
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 py-4">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-orange-50 text-orange-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="px-4 py-3 text-sm text-gray-500 truncate mb-2">
            {userEmail}
          </div>
          <form action={signOutAction}>
             <button className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium">
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

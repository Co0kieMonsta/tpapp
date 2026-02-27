import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { LogOut, Package, FileText, Home, Users } from 'lucide-react'
import { redirect } from 'next/navigation'
import { MobileNav } from './mobile-nav'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      redirect('/login')
    }

    const signOut = async () => {
      'use server'
      const supabase = await createClient()
      await supabase.auth.signOut()
      redirect('/login')
    }

    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-orange-600 flex items-center gap-2">
              <FileText className="h-8 w-8" />
              TPSoluciones
            </h1>
          </div>
          
          <nav className="flex-1 px-4 space-y-2">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors">
              <Home className="h-5 w-5" />
              Dashboard
            </Link>
            <Link href="/products" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors">
              <Package className="h-5 w-5" />
              Products
            </Link>
            <Link href="/quotes" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors">
              <FileText className="h-5 w-5" />
              Quotes
            </Link>
            <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors">
              <Users className="h-5 w-5" />
              Users
            </Link>
          </nav>

          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 px-4 py-3 text-sm text-gray-500">
              <div className="flex-1 truncate">
                {user.email}
              </div>
            </div>
            <form action={signOut}>
              <button className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium">
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </form>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <MobileNav userEmail={user.email!} signOutAction={signOut} />
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    )
  } catch (error: any) {
    return (
      <div className="p-8 m-8 bg-red-50 text-red-900 border border-red-200 rounded-lg whitespace-pre-wrap">
        <h2 className="text-xl font-bold mb-4">Layout Server Error</h2>
        {error.message || String(error)}
        <br/><br/>
        {error.stack}
      </div>
    )
  }
}

import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'

// Force dynamic rendering for admin pages that use auth()
export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/signin')
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: 'var(--rr-light-bg)' }}>
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <AdminHeader userSession={session} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="lg:hidden h-16"></div>
          {children}
        </main>
      </div>
    </div>
  )
}
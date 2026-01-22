'use client'
import { usePathname } from 'next/navigation'
import { useUser } from '@clerk/clerk-react'
import NavBarTitle from './NavBarTitle'
import NavBarOptions from './NavBarOptions'

export default function NavBar({
  boardTitle,
  onEditBoard,
  onFilter,
  filterCount = 0
}: {
  boardTitle?: string
  onEditBoard?: () => void
  onFilter?: () => void
  filterCount?: number
}) {
  const { isSignedIn } = useUser()
  const pathname = usePathname()
  const isHomePage = pathname === '/'
  const isDashboard = pathname === '/dashboard'

  return (
    <header className="bg-white/70 dark:bg-neutral-900/70 border-b border-gray-200 dark:border-gray-800 backdrop-blur-sm sticky top-0 z-50">
      <div className="px-4 py-3 sm:py-4 flex items-center justify-between  text-secondary-500">
        <NavBarTitle isDashboard={isDashboard} boardTitle={boardTitle} onEditBoard={onEditBoard} />
        <div className="flex items-center space-x-2">
          <NavBarOptions
            isSignedIn={isSignedIn}
            isHomePage={isHomePage}
            onFilter={onFilter}
            filterCount={filterCount}
          />
        </div>
      </div>
    </header>
  )
}

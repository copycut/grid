import Link from 'next/link'
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/clerk-react'
import { Badge, Button } from 'antd'
import { ArrowRightOutlined, FilterOutlined } from '@ant-design/icons'

export default function NavBarOptions({
  isSignedIn,
  isHomePage,
  isDashboard,
  onFilter,
  filterCount = 0
}: {
  isSignedIn: boolean | undefined
  isHomePage: boolean
  isDashboard: boolean
  onFilter?: () => void
  filterCount?: number
}) {
  const { user } = useUser()
  if (isHomePage && isSignedIn) {
    return (
      <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-1 space-x-2 sm:space-y-0 sm:space-x4">
        <span className="text-xs sm:text-sm text-primary-500">
          Welcome to the Grid, {user?.firstName ?? user?.emailAddresses[0]?.emailAddress}
        </span>
        <Link href="/dashboard">
          <Button color="primary" variant="solid" className="no-shadow">
            Dashboard
            <ArrowRightOutlined />
          </Button>
        </Link>
      </div>
    )
  }

  if (isSignedIn && isDashboard) {
    return <UserButton />
  }

  if (isSignedIn) {
    return (
      <div className="flex items-center space-x-4">
        <Button icon={<FilterOutlined />} onClick={onFilter}>
          <span className="hidden sm:inline">Filter</span>
          <Badge count={filterCount} />
        </Button>
        <UserButton />
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center space-x-2">
        <SignInButton>
          <Button color="default" variant="solid">
            Sign In
          </Button>
        </SignInButton>
        <SignUpButton>
          <Button color="primary" variant="solid">
            Sign Up
          </Button>
        </SignUpButton>
      </div>
    )
  }
}

'use client'
import { SignInButton, useUser } from '@clerk/nextjs'
import { Button } from 'antd'
import Link from 'next/link'
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useUser()

  if (!isSignedIn) {
    return (
      <div className="flex flex-col gap-4 w-[90vw] max-w-100 mx-auto p-10 items-center">
        <h1 className="text-2xl font-bold">You need to be signed in to view this page</h1>
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button color="default" variant="solid">
              <ArrowLeftOutlined />
              Home
            </Button>
          </Link>
          <SignInButton>
            <Button color="primary" variant="solid">
              <UserOutlined />
              Sign In
            </Button>
          </SignInButton>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

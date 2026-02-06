'use client'
import { SignUpButton } from '@clerk/clerk-react'
import { useUser } from '@clerk/clerk-react'
import { Button } from 'antd'
import Link from 'next/link'

export default function HomePageSignInButton({
  children,
  color = 'primary'
}: {
  children: React.ReactNode
  color?: 'primary' | 'default'
}) {
  const { isSignedIn } = useUser()

  return isSignedIn ? (
    <Link href="/dashboard">
      <Button size="large" color={color} variant="solid">
        {children}
      </Button>
    </Link>
  ) : (
    <SignUpButton>
      <Button size="large" color={color} variant="solid">
        {children}
      </Button>
    </SignUpButton>
  )
}

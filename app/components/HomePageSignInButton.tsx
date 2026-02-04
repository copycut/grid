'use client'
import { SignInButton, SignUpButton } from '@clerk/clerk-react'
import { useUser } from '@clerk/clerk-react'
import { Button } from 'antd'

export default function HomePageSignInButton({
  children,
  color = 'primary'
}: {
  children: React.ReactNode
  color?: 'primary' | 'default'
}) {
  const { isSignedIn } = useUser()

  return isSignedIn ? (
    <SignInButton>
      <Button size="large" color={color} variant="solid">
        {children}
      </Button>
    </SignInButton>
  ) : (
    <SignUpButton>
      <Button size="large" color={color} variant="solid">
        {children}
      </Button>
    </SignUpButton>
  )
}

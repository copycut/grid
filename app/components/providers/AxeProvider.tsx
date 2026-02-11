'use client'
import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'

export default function AxeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      import('@axe-core/react').then((axe) => {
        axe.default(React, ReactDOM, 1000)
      })
    }
  }, [])

  return <>{children}</>
}

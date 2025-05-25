// app/auth/layout.tsx
'use client'
import React from 'react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full flex items-center justify-center p-6">
      <div className="bg-white backdrop-blur-md bg-opacity-80 rounded-xl shadow-xl p-8 max-w-md w-full">
        {children}
      </div>
    </div>
  )
}

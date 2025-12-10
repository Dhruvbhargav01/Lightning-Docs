import type { ReactNode } from 'react'
import './globals.css'

export const metadata = {
  title: 'Docs Store',
  description: 'Upload and extract documents'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white antialiased">
        {children}
      </body>
    </html>
  )
}

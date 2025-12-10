import { ReactNode } from 'react'

export default function NeonFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex items-center justify-center">
      <div className="relative px-10 py-12 md:px-16 md:py-16 bg-black/70 backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] border border-pink-500/60 shadow-[0_0_40px_rgba(255,0,127,0.9)]" />
        <div className="absolute -top-24 -left-16 h-40 w-40 rounded-full bg-pink-600/40 blur-3xl" />
        <div className="absolute -bottom-24 -right-16 h-40 w-40 rounded-full bg-pink-600/40 blur-3xl" />
        <div className="relative">{children}</div>
      </div>
    </div>
  )
}

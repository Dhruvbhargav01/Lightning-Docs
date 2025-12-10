'use client'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Login() {
  const router = useRouter()
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })
  }
  
useEffect(() => {
  supabase.auth.getSession().then(({ data, error }) => {
    console.log('SESSION', data, error)
    const session = data.session
    if (session) router.push('/dashboard')
  })

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      console.log('AUTH EVENT', event, session)
      if (event === 'SIGNED_IN' && session) router.push('/dashboard')
    }
  )

  return () => subscription.unsubscribe()
}, [router, supabase])


  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4">
      <div className="lightning-glow -top-32 right-4" />
      <div className="lightning-streak top-6 right-20 h-72" />
      <div className="lightning-streak bottom-10 left-16 h-64" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/80 to-transparent" />

      <div className="glass-panel relative max-w-md w-full px-8 py-9 md:px-10 md:py-11">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl md:text-4xl font-semibold">
              <span className="bg-gradient-to-r from-sky-200 via-cyan-200 to-blue-300 bg-clip-text text-transparent">
                Sign in to Docs Store
              </span>
            </h1>
            <p className="text-xs md:text-sm text-slate-300/80">
              Use your Google account to access lightning-fast document storage.
            </p>
          </div>

          <Button
            onClick={handleGoogleLogin}
            className="w-full h-11 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold tracking-wide rounded-full shadow-[0_0_28px_rgba(56,189,248,0.9)] border border-sky-200/70"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
            </svg>
            Continue with Google
          </Button>

          <p className="text-[11px] text-center text-slate-400">
            By continuing you agree to secure storage and text extraction of your uploaded documents.
          </p>
        </div>
      </div>
    </div>
  )
}

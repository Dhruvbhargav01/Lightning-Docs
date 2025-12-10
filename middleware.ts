// import { NextResponse } from 'next/server'
// import { createClient } from './lib/supabase-server'
// import { NextRequest } from 'next/server'

// export async function middleware(req: NextRequest) {
//   const res = NextResponse.next()
//   const supabase = await createClient()

//   const { data: { session } } = await supabase.auth.getSession()

//   if (req.nextUrl.pathname.startsWith('/dashboard') && !session) {
//     return NextResponse.redirect(new URL('/login', req.url))
//   }

//   if (req.nextUrl.pathname === '/' && session) {
//     return NextResponse.redirect(new URL('/dashboard', req.url))
//   }

//   return res
// }

// export const config = {
//   matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)', '/']
// }

// temprorily

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)', '/']
}

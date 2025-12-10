export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4">
      <div className="lightning-glow -top-40 right-10" />
      <div className="lightning-streak top-10 right-24 h-80" />
      <div className="lightning-streak top-32 left-10 h-64" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/80 to-transparent" />

      <div className="glass-panel relative max-w-3xl w-full px-8 py-10 md:px-14 md:py-14">
        <div className="flex flex-col gap-6 md:gap-8">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-sky-300/80">
              Lightning Docs
            </p>
            <h1 className="mt-3 text-4xl md:text-5xl font-semibold leading-tight">
              <span className="text-slate-50">
                Store, scan and extract
              </span>
              <span className="block bg-gradient-to-r from-sky-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                documents in a flash
              </span>
            </h1>
          </div>

          <p className="text-sm md:text-base text-slate-300/80 max-w-xl">
            Upload PDF and DOCX files, keep them safe in the cloud and
            read their extracted text in a clean, dark lightning interface.
          </p>

          <div className="flex flex-wrap gap-4 items-center">
            <a
              href="/login"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-[0_0_30px_rgba(56,189,248,0.8)] transition-colors"
            >
              Continue to login
            </a>
            <span className="text-xs text-slate-400">
              Google sign in • Secured by Supabase
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

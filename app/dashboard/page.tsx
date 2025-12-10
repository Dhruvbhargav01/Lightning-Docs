// 'use client'

// import { useEffect, useState, type ChangeEvent } from 'react'
// import { createClient } from '@/lib/supabase-client'
// import { Button } from '@/components/ui/button'

// type DocumentRow = {
//   id: string
//   original_filename: string
//   file_path: string
//   uploaded_at: string
//   extracted_text: string | null
// }

// export default function Dashboard() {
//   const supabase = createClient()
//   const [docs, setDocs] = useState<DocumentRow[]>([])
//   const [file, setFile] = useState<File | null>(null)
//   const [loadingUpload, setLoadingUpload] = useState(false)
//   const [deletingId, setDeletingId] = useState<string | null>(null)
//   const [activeDoc, setActiveDoc] = useState<DocumentRow | null>(null)
//   const [userEmail, setUserEmail] = useState<string | null>(null)
//   const [userAvatar, setUserAvatar] = useState<string | null>(null)

//   const fetchUser = async () => {
//     const { data } = await supabase.auth.getUser()
//     const user = data.user
//     setUserEmail(user?.email ?? null)
//     const avatar =
//       (user?.user_metadata as any)?.avatar_url ||
//       (user?.user_metadata as any)?.picture ||
//       null
//     setUserAvatar(avatar)
//   }

//   const fetchDocs = async () => {
//     const { data, error } = await supabase
//       .from('documents')
//       .select('*')
//       .order('uploaded_at', { ascending: false })
//     if (!error && data) {
//       setDocs(data as DocumentRow[])
//     }
//   }

//   useEffect(() => {
//     fetchUser()
//     fetchDocs()
//   }, [])

//   const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const f = e.target.files?.[0]
//     if (!f) return
//     const allowedTypes = [
//       'application/pdf',
//       'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//     ]
//     if (!allowedTypes.includes(f.type)) {
//       alert('Only PDF and DOCX allowed')
//       return
//     }
//     if (f.size > 10 * 1024 * 1024) {
//       alert('Max size 10MB')
//       return
//     }
//     setFile(f)
//   }

//   const extractTextLocally = async (file: File): Promise<string> => {
//     try {
//       if (file.type === 'application/pdf') {
//         const pdfjs = await import('pdfjs-dist')
//         pdfjs.GlobalWorkerOptions.workerSrc = ''
//         const arrayBuffer = await file.arrayBuffer()
//         const loadingTask = pdfjs.getDocument({ data: arrayBuffer, verbosity: 0 })
//         const pdf = await loadingTask.promise
//         let text = ''
//         for (let i = 1; i <= pdf.numPages; i++) {
//           const page = await pdf.getPage(i)
//           const content = await page.getTextContent()
//           text += content.items.map((item: any) => item.str).join(' ') + '\n'
//         }
//         pdf.destroy()
//         return text.trim()
//       }

//       if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
//         const mammoth = await import('mammoth')
//         const arrayBuffer = await file.arrayBuffer()
//         const { value } = await mammoth.extractRawText({ arrayBuffer })
//         return value
//       }

//       return ''
//     } catch (error) {
//       console.error('Text extraction failed:', error)
//       return ''
//     }
//   }

//   const handleUpload = async () => {
//     if (!file) return
//     setLoadingUpload(true)

//     const { data: userData } = await supabase.auth.getUser()
//     const userId = userData.user?.id
//     if (!userId) {
//       setLoadingUpload(false)
//       return
//     }

//     const fileExt = file.name.split('.').pop()
//     const filePath = `${userId}/${Date.now()}.${fileExt}`

//     const { error: uploadError } = await supabase.storage
//       .from('doc-store-bucket')
//       .upload(filePath, file)

//     if (uploadError) {
//       alert('Upload failed: ' + uploadError.message)
//       setLoadingUpload(false)
//       return
//     }

//     const extracted = await extractTextLocally(file)

//     const { data: inserted, error: insertError } = await supabase
//       .from('documents')
//       .insert({
//         user_id: userId,
//         file_path: filePath,
//         original_filename: file.name,
//         extracted_text: extracted || null,
//       })
//       .select('id, original_filename, file_path, uploaded_at, extracted_text')
//       .single()

//     if (insertError || !inserted) {
//       alert('DB insert failed: ' + (insertError?.message || 'Unknown error'))
//       setLoadingUpload(false)
//       return
//     }

//     setFile(null)
//     setDocs(prev => [inserted as DocumentRow, ...prev])
//     setActiveDoc(inserted as DocumentRow)
//     setLoadingUpload(false)
//   }

//   const handleDownload = async (doc: DocumentRow) => {
//     const { data, error } = await supabase.storage
//       .from('doc-store-bucket')
//       .download(doc.file_path)

//     if (error || !data) {
//       alert('Download failed')
//       return
//     }

//     const url = URL.createObjectURL(data)
//     const a = document.createElement('a')
//     a.href = url
//     a.download = doc.original_filename
//     document.body.appendChild(a)
//     a.click()
//     document.body.removeChild(a)
//     URL.revokeObjectURL(url)
//   }

//   const handleDelete = async (doc: DocumentRow) => {
//     setDeletingId(doc.id)

//     await supabase.storage
//       .from('doc-store-bucket')
//       .remove([doc.file_path])

//     const { error } = await supabase
//       .from('documents')
//       .delete()
//       .eq('id', doc.id)

//     if (error) {
//       alert('Delete failed: ' + error.message)
//       setDeletingId(null)
//       return
//     }

//     setDocs(prev => prev.filter(d => d.id !== doc.id))
//     if (activeDoc?.id === doc.id) {
//       setActiveDoc(null)
//     }
//     setDeletingId(null)
//   }

//   const handleLogout = async () => {
//     await supabase.auth.signOut()
//     window.location.href = '/login'
//   }

//   return (
//     <div
//       className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100"
//       style={{ fontFamily: '"Times New Roman", serif' }}
//     >
//       <div className="pointer-events-none absolute inset-0">
//         <div className="absolute -top-40 left-10 w-80 h-80 bg-sky-400/25 blur-3xl" />
//         <div className="absolute top-10 right-0 w-[28rem] h-80 bg-cyan-400/30 blur-3xl" />
//         <div className="absolute bottom-0 left-1/3 w-[30rem] h-72 bg-indigo-500/20 blur-3xl" />
//         <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/80 to-transparent" />
//       </div>

//       <header className="relative z-10 w-full border-b border-slate-800/60 bg-slate-950/70 backdrop-blur-xl">
//         <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
//           <div className="flex items-center gap-3">
//             <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-sky-400 to-cyan-400 shadow-xl shadow-sky-500/40 flex items-center justify-center text-slate-900 text-xl font-black">
//               L
//             </div>
//             <div>
//               <h1 className="text-xl md:text-2xl font-bold tracking-wide bg-gradient-to-r from-sky-200 via-cyan-200 to-blue-200 bg-clip-text text-transparent">
//                 Lightning Docs
//               </h1>
//               <p className="text-xs text-slate-400 tracking-wide">
//                 Secure document storage and instant reading
//               </p>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             <div className="flex items-center gap-2">
//               {userAvatar && (
//                 <img
//                   src={userAvatar}
//                   alt="User avatar"
//                   className="h-8 w-8 rounded-full border border-slate-600 object-cover"
//                 />
//               )}
//               <div className="hidden sm:flex flex-col items-end">
//                 <span className="text-xs text-slate-300">
//                   Welcome
//                 </span>
//                 <span className="text-sm font-semibold text-slate-100">
//                   {userEmail || ''}
//                 </span>
//               </div>
//             </div>
//             <Button
//               onClick={handleLogout}
//               className="h-9 px-4 rounded-full bg-slate-800/90 hover:bg-slate-700/90 text-xs md:text-sm font-semibold text-slate-100 border border-slate-600/70"
//             >
//               Logout
//             </Button>
//           </div>
//         </div>
//       </header>

//       <main className="relative z-10 max-w-6xl mx-auto px-6 py-8 md:py-10">
//         <div className="grid lg:grid-cols-[1.1fr_1.4fr] gap-8">
//           <div className="space-y-6">
//             <div className="rounded-3xl border border-sky-500/35 bg-slate-950/70 backdrop-blur-xl p-6 shadow-2xl shadow-sky-500/25">
//               <h2 className="text-sm font-semibold text-sky-200 mb-4 tracking-wide">
//                 Upload document
//               </h2>
//               <div className="border-2 border-dashed border-sky-400/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-slate-900/70">
//                 <input
//                   type="file"
//                   accept=".pdf,.docx"
//                   onChange={handleFileChange}
//                   className="block w-full text-xs text-slate-200 cursor-pointer file:mr-3 file:rounded-full file:border-0 file:bg-sky-500 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-slate-950 hover:file:bg-sky-400"
//                 />
//                 <p className="mt-3 text-[11px] text-slate-400">
//                   PDF or DOCX, maximum 10MB
//                 </p>
//                 <Button
//                   onClick={handleUpload}
//                   disabled={!file || loadingUpload}
//                   className="mt-4 h-9 px-6 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold disabled:opacity-50"
//                 >
//                   {loadingUpload ? 'Uploading…' : 'Upload and extract'}
//                 </Button>
//               </div>
//             </div>

//             <div className="rounded-3xl border border-slate-700/60 bg-slate-950/70 backdrop-blur-xl p-6 max-h-[460px] overflow-y-auto">
//               <h2 className="text-sm font-semibold text-sky-200 mb-4 tracking-wide">
//                 Your documents
//               </h2>
//               {docs.length === 0 ? (
//                 <p className="text-xs text-slate-400">
//                   No documents yet. Upload a file to see it here.
//                 </p>
//               ) : (
//                 <div className="space-y-3">
//                   {docs.map(doc => (
//                     <div
//                       key={doc.id}
//                       className={`p-4 rounded-2xl border cursor-pointer transition-colors ${
//                         activeDoc?.id === doc.id
//                           ? 'border-sky-500/70 bg-sky-500/10'
//                           : 'border-slate-700/70 bg-slate-900/80 hover:border-sky-400/60 hover:bg-slate-900'
//                       }`}
//                       onClick={() => setActiveDoc(doc)}
//                     >
//                       <div className="flex items-center justify-between gap-2 mb-2">
//                         <p className="text-xs md:text-sm text-slate-100 truncate">
//                           {doc.original_filename}
//                         </p>
//                         <span className="text-[10px] text-slate-400">
//                           {new Date(doc.uploaded_at).toLocaleString()}
//                         </span>
//                       </div>
//                       <div className="flex gap-2 mt-1">
//                         <Button
//                           onClick={e => {
//                             e.stopPropagation()
//                             handleDownload(doc)
//                           }}
//                           className="h-7 px-3 rounded-full bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-100"
//                         >
//                           Download
//                         </Button>
//                         <Button
//                           onClick={e => {
//                             e.stopPropagation()
//                             setActiveDoc(doc)
//                           }}
//                           className="h-7 px-3 rounded-full bg-sky-500 hover:bg-sky-400 text-[11px] text-slate-950"
//                         >
//                           View text
//                         </Button>
//                         <Button
//                           onClick={e => {
//                             e.stopPropagation()
//                             handleDelete(doc)
//                           }}
//                           disabled={deletingId === doc.id}
//                           className="h-7 px-3 rounded-full bg-red-500/80 hover:bg-red-500 text-[11px] text-slate-50 disabled:opacity-60"
//                         >
//                           {deletingId === doc.id ? 'Deleting…' : 'Delete'}
//                         </Button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="rounded-3xl border border-slate-700/60 bg-slate-950/75 backdrop-blur-xl p-6 flex flex-col">
//             <h2 className="text-sm font-semibold text-sky-200 mb-4 tracking-wide">
//               Extracted text
//             </h2>
//             {!activeDoc ? (
//               <div className="flex-1 flex items-center justify-center">
//                 <p className="text-xs text-slate-400 text-center max-w-sm">
//                   Select a document from the list and click “View text” to read its extracted content.
//                 </p>
//               </div>
//             ) : (
//               <div className="flex-1 flex flex-col min-h-0">
//                 <p className="text-xs text-slate-300 mb-2">
//                   {activeDoc.original_filename}
//                 </p>
//                 <div className="flex-1 border border-slate-800/70 rounded-2xl bg-slate-900/80 p-4 text-xs md:text-sm text-slate-100 whitespace-pre-wrap overflow-y-auto">
//                   {activeDoc.extracted_text || 'No text extracted for this document.'}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </main>
//     </div>
//   )
// }

'use client'

import { useEffect, useState, type ChangeEvent } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'

type DocumentRow = {
  id: string
  original_filename: string
  file_path: string
  uploaded_at: string
  extracted_text: string | null
}

export default function Dashboard() {
  const supabase = createClient()
  const [docs, setDocs] = useState<DocumentRow[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [loadingUpload, setLoadingUpload] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [activeDoc, setActiveDoc] = useState<DocumentRow | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userAvatar, setUserAvatar] = useState<string | null>(null)

  const fetchUser = async () => {
    const { data } = await supabase.auth.getUser()
    const user = data.user
    setUserEmail(user?.email ?? null)
    const avatar =
      (user?.user_metadata as any)?.avatar_url ||
      (user?.user_metadata as any)?.picture ||
      null
    setUserAvatar(avatar)
  }

  const fetchDocs = async () => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('uploaded_at', { ascending: false })
    if (!error && data) {
      setDocs(data as DocumentRow[])
    }
  }

  useEffect(() => {
    fetchUser()
    fetchDocs()
  }, [])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    if (!allowedTypes.includes(f.type)) {
      alert('Only PDF and DOCX allowed')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      alert('Max size 10MB')
      return
    }
    setFile(f)
  }

  const handleUpload = async () => {
  if (!file) return
  setLoadingUpload(true)

  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id
  if (!userId) {
    setLoadingUpload(false)
    return
  }

  const fileExt = file.name.split('.').pop()
  const filePath = `${userId}/${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('doc-store-bucket')
    .upload(filePath, file)

  if (uploadError) {
    alert('Upload failed: ' + uploadError.message)
    setLoadingUpload(false)
    return
  }

  const { data: inserted, error: insertError } = await supabase
    .from('documents')
    .insert({
      user_id: userId,
      file_path: filePath,
      original_filename: file.name,
      extracted_text: null,
    })
    .select('id, original_filename, file_path, uploaded_at, extracted_text')
    .single()

  if (insertError || !inserted) {
    alert('DB insert failed: ' + (insertError?.message || 'Unknown error'))
    setLoadingUpload(false)
    return
  }

  setFile(null)
  setDocs(prev => [inserted as DocumentRow, ...prev])
  setActiveDoc(inserted as DocumentRow)

  try {
    await fetch('/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docId: inserted.id }),
    })
    await fetchDocs()
  } catch (error) {
    console.error('Text extraction trigger failed:', error)
  }

  setLoadingUpload(false)
}

  const handleDownload = async (doc: DocumentRow) => {
    const { data, error } = await supabase.storage
      .from('doc-store-bucket')
      .download(doc.file_path)

    if (error || !data) {
      alert('Download failed')
      return
    }

    const url = URL.createObjectURL(data)
    const a = document.createElement('a')
    a.href = url
    a.download = doc.original_filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDelete = async (doc: DocumentRow) => {
    setDeletingId(doc.id)

    await supabase.storage
      .from('doc-store-bucket')
      .remove([doc.file_path])

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', doc.id)

    if (error) {
      alert('Delete failed: ' + error.message)
      setDeletingId(null)
      return
    }

    setDocs(prev => prev.filter(d => d.id !== doc.id))
    if (activeDoc?.id === doc.id) {
      setActiveDoc(null)
    }
    setDeletingId(null)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100"
      style={{ fontFamily: '"Times New Roman", serif' }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-10 w-80 h-80 bg-sky-400/25 blur-3xl" />
        <div className="absolute top-10 right-0 w-[28rem] h-80 bg-cyan-400/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[30rem] h-72 bg-indigo-500/20 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/80 to-transparent" />
      </div>

      <header className="relative z-10 w-full border-b border-slate-800/60 bg-slate-950/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-sky-400 to-cyan-400 shadow-xl shadow-sky-500/40 flex items-center justify-center text-slate-900 text-xl font-black">
              L
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-wide bg-gradient-to-r from-sky-200 via-cyan-200 to-blue-200 bg-clip-text text-transparent">
                Lightning Docs
              </h1>
              <p className="text-xs text-slate-400 tracking-wide">
                Secure document storage and instant reading
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {userAvatar && (
                <img
                  src={userAvatar}
                  alt="User avatar"
                  className="h-8 w-8 rounded-full border border-slate-600 object-cover"
                />
              )}
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs text-slate-300">
                  Welcome
                </span>
                <span className="text-sm font-semibold text-slate-100">
                  {userEmail || ''}
                </span>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              className="h-9 px-4 rounded-full bg-slate-800/90 hover:bg-slate-700/90 text-xs md:text-sm font-semibold text-slate-100 border border-slate-600/70"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8 md:py-10">
        <div className="grid lg:grid-cols-[1.1fr_1.4fr] gap-8">
          <div className="space-y-6">
            <div className="rounded-3xl border border-sky-500/35 bg-slate-950/70 backdrop-blur-xl p-6 shadow-2xl shadow-sky-500/25">
              <h2 className="text-sm font-semibold text-sky-200 mb-4 tracking-wide">
                Upload document
              </h2>
              <div className="border-2 border-dashed border-sky-400/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-slate-900/70">
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-slate-200 cursor-pointer file:mr-3 file:rounded-full file:border-0 file:bg-sky-500 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-slate-950 hover:file:bg-sky-400"
                />
                <p className="mt-3 text-[11px] text-slate-400">
                  PDF or DOCX, maximum 10MB
                </p>
                <Button
                  onClick={handleUpload}
                  disabled={!file || loadingUpload}
                  className="mt-4 h-9 px-6 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold disabled:opacity-50"
                >
                  {loadingUpload ? 'Uploading…' : 'Upload and extract'}
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-700/60 bg-slate-950/70 backdrop-blur-xl p-6 max-h-[460px] overflow-y-auto">
              <h2 className="text-sm font-semibold text-sky-200 mb-4 tracking-wide">
                Your documents
              </h2>
              {docs.length === 0 ? (
                <p className="text-xs text-slate-400">
                  No documents yet. Upload a file to see it here.
                </p>
              ) : (
                <div className="space-y-3">
                  {docs.map(doc => (
                    <div
                      key={doc.id}
                      className={`p-4 rounded-2xl border cursor-pointer transition-colors ${
                        activeDoc?.id === doc.id
                          ? 'border-sky-500/70 bg-sky-500/10'
                          : 'border-slate-700/70 bg-slate-900/80 hover:border-sky-400/60 hover:bg-slate-900'
                      }`}
                      onClick={() => setActiveDoc(doc)}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <p className="text-xs md:text-sm text-slate-100 truncate">
                          {doc.original_filename}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          {new Date(doc.uploaded_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-1">
                        <Button
                          onClick={e => {
                            e.stopPropagation()
                            handleDownload(doc)
                          }}
                          className="h-7 px-3 rounded-full bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-100"
                        >
                          Download
                        </Button>
                        <Button
                          onClick={e => {
                            e.stopPropagation()
                            setActiveDoc(doc)
                          }}
                          className="h-7 px-3 rounded-full bg-sky-500 hover:bg-sky-400 text-[11px] text-slate-950"
                        >
                          View text
                        </Button>
                        <Button
                          onClick={e => {
                            e.stopPropagation()
                            handleDelete(doc)
                          }}
                          disabled={deletingId === doc.id}
                          className="h-7 px-3 rounded-full bg-red-500/80 hover:bg-red-500 text-[11px] text-slate-50 disabled:opacity-60"
                        >
                          {deletingId === doc.id ? 'Deleting…' : 'Delete'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-700/60 bg-slate-950/75 backdrop-blur-xl p-6 flex flex-col">
            <h2 className="text-sm font-semibold text-sky-200 mb-4 tracking-wide">
              Extracted text
            </h2>
            {!activeDoc ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xs text-slate-400 text-center max-w-sm">
                  Select a document from the list and click "View text" to read its extracted content.
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0">
                <p className="text-xs text-slate-300 mb-2">
                  {activeDoc.original_filename}
                </p>
                <div className="flex-1 border border-slate-800/70 rounded-2xl bg-slate-900/80 p-4 text-xs md:text-sm text-slate-100 whitespace-pre-wrap overflow-y-auto">
                  {activeDoc.extracted_text === null 
                    ? 'Extracting text... please wait a moment.' 
                    : activeDoc.extracted_text || 'No text extracted for this document.'
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getDocumentProxy, extractText } from 'unpdf'

export async function POST(request: NextRequest) {
  try {
    const { docId } = await request.json()

    if (!docId) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('id, file_path, original_filename')
      .eq('id', docId)
      .single()

    if (docError || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const { data: fileData, error: downloadError } = await supabase.storage
      .from('doc-store-bucket')
      .download(doc.file_path)

    if (downloadError || !fileData) {
      return NextResponse.json({ error: 'File download failed' }, { status: 500 })
    }

    const buffer = await fileData.arrayBuffer()
    const uint8Array = new Uint8Array(buffer)

    let extractedText = ''

    try {
      const pdf = await getDocumentProxy(uint8Array)
      const { text } = await extractText(pdf, { mergePages: true })
      extractedText = text
    } catch (pdfError) {
      console.error('PDF extraction failed:', pdfError)
      extractedText = 'Text extraction failed for this document.'
    }

    const { error: updateError } = await supabase
      .from('documents')
      .update({ extracted_text: extractedText })
      .eq('id', docId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to save extracted text' }, { status: 500 })
    }

    return NextResponse.json({ success: true, text: extractedText })
  } catch (error) {
    console.error('Extract route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

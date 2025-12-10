Lightning Docs

A secure document storage and text-extraction application built with Next.js and Supabase that allows users to upload PDF files, store them safely, and read extracted text inside a smooth, authenticated dashboard.
Live application: https://pdfvault.vercel.app/

Screenshots

1. Home - <img width="1920" height="1080" alt="Screenshot 2025-12-10 151729" src="https://github.com/user-attachments/assets/6196b65d-032f-4dcd-909c-2dcc61cbf69e" />
2. Signup - <img width="1920" height="1080" alt="Screenshot 2025-12-10 151749" src="https://github.com/user-attachments/assets/a0013413-c6de-483b-a86d-87bd8a89a7fe" />
3. Dashboard - <img width="1920" height="1080" alt="Screenshot 2025-12-10 151817" src="https://github.com/user-attachments/assets/e1085568-b39d-4a19-83a3-4708c25d843b" />

Features

Secure Google Authentication powered by Supabase Auth

PDF upload with support for files up to 10 MB

Automatic extraction and storage of text content from uploaded PDFs

Clean dashboard to view, read, download, and delete stored documents

Modern interface built using shadcn/ui and Tailwind CSS

Tech Stack

Framework: Next.js 15 (App Router)

Authentication: Supabase Auth

Storage: Supabase Storage

UI Components: shadcn/ui

Styling: Tailwind CSS

Language: TypeScript

Getting Started
Prerequisites

Node.js 18 or higher

A Supabase account + configured project

Environment Variables

Create a .env.local file in the root of the project and include:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key


You can find these inside your Supabase project dashboard under API settings.

Installation

Clone the repository

Install dependencies

npm install


Start the dev server

npm run dev


Visit http://localhost:3000
 to use the application

Usage

Sign in using Google on the homepage

Upload PDF files from the dashboard

View extracted text in the document viewer

Download or delete documents directly from the dashboard

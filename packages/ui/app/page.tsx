'use client'
import { Form } from '@/components/form'
import { Header } from '@/components/header'
import { History } from '@/components/history'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 flex flex-col items-center justify-center gap-8 min-h-[calc(100vh-80px)]">
        <Form />
        <History />
      </main>
    </div>
  )
}

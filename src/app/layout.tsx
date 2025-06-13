import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Imobiliária Moderna - Encontre seu imóvel ideal',
  description: 'Site moderno para imobiliária com os melhores imóveis da região. Casas, apartamentos, terrenos e muito mais.',
  keywords: 'imobiliária, imóveis, casas, apartamentos, terrenos, venda, aluguel',
  authors: [{ name: 'Imobiliária Moderna' }],
//  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'Imobiliária Moderna - Encontre seu imóvel ideal',
    description: 'Site moderno para imobiliária com os melhores imóveis da região.',
    type: 'website',
    locale: 'pt_BR',
  },
}
export const viewport = {
  width: 'device-width',
  initialScale: 1
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  )
}
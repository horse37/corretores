import { Suspense } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import PropertyList from '@/components/properties/PropertyList'
import PropertyFilters from '@/components/properties/PropertyFilters'
import Hero from '@/components/home/Hero'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <Hero />
        
        {/* Filtros e Listagem de Imóveis */}
        <section className="py-12 bg-white">
          <div className="container">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Imóveis Disponíveis
              </h2>
              <p className="text-gray-600 max-w-2xl">
                Encontre o imóvel perfeito para você. Use os filtros abaixo para refinar sua busca.
              </p>
            </div>
            
            {/* Filtros */}
            <div className="mb-8">
              <Suspense fallback={<LoadingSpinner />}>
                <PropertyFilters />
              </Suspense>
            </div>
            
            {/* Lista de Imóveis */}
            <Suspense fallback={<LoadingSpinner />}>
              <PropertyList />
            </Suspense>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  )
}
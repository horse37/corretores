'use client'

import { useEffect } from 'react'
import Script from 'next/script'

interface GoogleAnalyticsProps {
  gaId: string
}

export default function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  useEffect(() => {
    if (typeof window !== 'undefined' && gaId) {
      // Configurar dataLayer
      window.dataLayer = window.dataLayer || []
      const gtag = (...args: any[]) => {
        window.dataLayer.push(args)
      }
      gtag('js', new Date())
      gtag('config', gaId, {
        page_title: document.title,
        page_location: window.location.href,
      })
    }
  }, [gaId])

  if (!gaId) {
    return null
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_title: document.title,
              page_location: window.location.href,
            });
          `,
        }}
      />
    </>
  )
}

// Função para rastrear eventos personalizados
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Função para rastrear visualizações de imóveis
export const trackPropertyView = (propertyId: string, propertyTitle: string) => {
  trackEvent('view_item', 'property', `${propertyId} - ${propertyTitle}`)
}

// Função para rastrear contatos
export const trackContact = (method: string, propertyId?: string) => {
  trackEvent('contact', 'engagement', `${method}${propertyId ? ` - Property ${propertyId}` : ''}`)
}

// Função para rastrear buscas
export const trackSearch = (searchTerm: string, filters?: any) => {
  trackEvent('search', 'property_search', searchTerm)
}

// Declaração de tipos para TypeScript
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}
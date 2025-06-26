import { query } from '@/lib/db'

export async function GET() {
  try {
    // Buscar todos os imóveis ativos
    const imoveis = await query(`
      SELECT id, created_at, updated_at 
      FROM imoveis 
      WHERE status IN ('disponivel', 'vendido', 'alugado')
      ORDER BY created_at DESC
    `)

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://cooperativa.com.br'
    
    // URLs estáticas
    const staticUrls = [
      {
        url: baseUrl,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily',
        priority: 1.0
      },
      {
        url: `${baseUrl}/imoveis`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily',
        priority: 0.9
      },
      {
        url: `${baseUrl}/contato`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'monthly',
        priority: 0.7
      }
    ]

    // URLs dinâmicas dos imóveis
    const imovelUrls = imoveis.map((imovel: any) => ({
      url: `${baseUrl}/imovel/${imovel.id}`,
      lastModified: (imovel.updated_at || imovel.created_at).toISOString(),
      changeFrequency: 'weekly',
      priority: 0.8
    }))

    const allUrls = [...staticUrls, ...imovelUrls]

    // Gerar XML do sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${url.url}</loc>
    <lastmod>${url.lastModified}</lastmod>
    <changefreq>${url.changeFrequency}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    })
  } catch (error) {
    console.error('Erro ao gerar sitemap:', error)
    return new Response('Erro interno do servidor', { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const corretor = requireAuth(request)
    if (!corretor) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Buscar estatísticas
    const [imoveisResult, imoveisDisponiveisResult, corretoresResult, mensagensResult] = await Promise.all([
      query('SELECT COUNT(*) as total FROM imoveis'),
      query('SELECT COUNT(*) as total FROM imoveis WHERE status = $1', ['disponivel']),
      query('SELECT COUNT(*) as total FROM corretores'),
      query('SELECT COUNT(*) as total FROM contatos WHERE status = $1', ['pendente']),
    ])

    const stats = {
      totalImoveis: parseInt(imoveisResult.rows[0].total),
      imoveisDisponiveis: parseInt(imoveisDisponiveisResult.rows[0].total),
      totalCorretores: parseInt(corretoresResult.rows[0].total),
      mensagensPendentes: parseInt(mensagensResult.rows[0].total),
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
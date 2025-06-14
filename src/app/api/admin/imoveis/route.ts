import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// Função para salvar arquivo
async function saveFile(file: File, folder: string): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  
  const fileExtension = path.extname(file.name)
  const fileName = `${uuidv4()}${fileExtension}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder)
  const filePath = path.join(uploadDir, fileName)
  
  // Criar diretório se não existir
  await mkdir(uploadDir, { recursive: true })
  
  // Salvar arquivo
  await writeFile(filePath, buffer)
  
  return `/uploads/${folder}/${fileName}`
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const authResult = await requireAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const tipo = searchParams.get('tipo')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Construir query dinamicamente
    let whereConditions = []
    let queryParams = []
    let paramIndex = 1

    if (status) {
      whereConditions.push(`status = $${paramIndex}`)
      queryParams.push(status)
      paramIndex++
    }

    if (tipo) {
      whereConditions.push(`tipo = $${paramIndex}`)
      queryParams.push(tipo)
      paramIndex++
    }

    if (search) {
      whereConditions.push(`(titulo ILIKE $${paramIndex} OR cidade ILIKE $${paramIndex} OR endereco ILIKE $${paramIndex})`)
      queryParams.push(`%${search}%`)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Query para buscar imóveis
    const imoveisQuery = `
      SELECT 
        id, titulo, tipo, status, preco, cidade, estado, 
        quartos, banheiros, area_total, created_at
      FROM imoveis 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    queryParams.push(limit, offset)

    // Query para contar total
    const countQuery = `SELECT COUNT(*) as total FROM imoveis ${whereClause}`
    const countParams = queryParams.slice(0, -2) // Remove limit e offset

    const [imoveisResult, countResult] = await Promise.all([
      query(imoveisQuery, queryParams),
      query(countQuery, countParams)
    ])

    const total = parseInt(countResult[0].total)
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      imoveis: imoveisResult,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  } catch (error) {
    console.error('Erro ao buscar imóveis:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const authResult = await requireAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      )
    }

    const contentType = request.headers.get('content-type')
    let data: any
    let fotos: File[] = []
    let videos: File[] = []

    if (contentType?.includes('multipart/form-data')) {
      // Processar FormData (com arquivos)
      const formData = await request.formData()
      
      data = {
        titulo: formData.get('titulo') as string,
        descricao: formData.get('descricao') as string,
        tipo: formData.get('tipo') as string,
        finalidade: formData.get('finalidade') as string,
        preco: formData.get('preco') ? parseFloat(formData.get('preco') as string) : null,
        area_total: formData.get('area_total') ? parseFloat(formData.get('area_total') as string) : null,
        area_construida: formData.get('area_construida') ? parseFloat(formData.get('area_construida') as string) : null,
        quartos: formData.get('quartos') ? parseInt(formData.get('quartos') as string) : null,
        banheiros: formData.get('banheiros') ? parseInt(formData.get('banheiros') as string) : null,
        vagas_garagem: formData.get('vagas_garagem') ? parseInt(formData.get('vagas_garagem') as string) : null,
        endereco: formData.get('endereco') as string,
        bairro: formData.get('bairro') as string,
        cidade: formData.get('cidade') as string,
        estado: formData.get('estado') as string,
        cep: formData.get('cep') as string,
        caracteristicas: formData.get('caracteristicas') ? JSON.parse(formData.get('caracteristicas') as string) : []
      }
      
      // Processar fotos e vídeos
      fotos = formData.getAll('fotos') as File[]
      videos = formData.getAll('videos') as File[]
    } else {
      // Processar JSON (sem arquivos)
      data = await request.json()
    }

    const {
      titulo,
      descricao,
      tipo,
      finalidade,
      preco,
      area_total,
      area_construida,
      quartos,
      banheiros,
      vagas_garagem,
      endereco,
      bairro,
      cidade,
      estado,
      cep,
      caracteristicas = [],
      latitude,
      longitude,
    } = data

    // Validações básicas
    if (!titulo || !tipo || !finalidade || !preco || !endereco || !cidade) {
      return NextResponse.json(
        { message: 'Campos obrigatórios: título, tipo, finalidade, preço, endereço, cidade' },
        { status: 400 }
      )
    }

    // Processar upload de fotos
    const fotosUrls: string[] = []
    for (const foto of fotos) {
      if (foto.size > 0) {
        const fotoUrl = await saveFile(foto, 'imoveis')
        fotosUrls.push(fotoUrl)
      }
    }

    // Processar upload de vídeos
    const videosUrls: string[] = []
    for (const video of videos) {
      if (video.size > 0) {
        const videoUrl = await saveFile(video, 'imoveis/videos')
        videosUrls.push(videoUrl)
      }
    }

    // Inserir imóvel
    const result = await query(
      `INSERT INTO imoveis (
        titulo, descricao, tipo, finalidade, preco, area_total, area_construida,
        quartos, banheiros, vagas_garagem, endereco, bairro, cidade, estado, cep,
        caracteristicas, fotos, videos, latitude, longitude, corretor_id, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
      ) RETURNING *`,
      [
        titulo, descricao, tipo, finalidade, preco, area_total, area_construida,
        quartos, banheiros, vagas_garagem, endereco, bairro, cidade, estado, cep,
        JSON.stringify(caracteristicas), JSON.stringify(fotosUrls), JSON.stringify(videosUrls), latitude, longitude, authResult.userId, 'disponivel'
      ]
    )

    return NextResponse.json({
      message: 'Imóvel cadastrado com sucesso',
      imovel: result[0],
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao cadastrar imóvel:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
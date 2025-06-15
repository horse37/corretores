# Dockerfile para projeto Next.js
# Multi-stage build para otimizar o tamanho da imagem
# Configurado para banco de dados externo

# Stage 1: Dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json* ./
RUN npm ci --include=dev

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

# Copiar arquivos essenciais para build
COPY tsconfig.json .         # ⬅️ Necessário para resolver aliases como @/components
COPY . .

# Desativar telemetria
ENV NEXT_TELEMETRY_DISABLED 1

# Build da aplicação com ambiente de desenvolvimento
RUN NODE_ENV=development npm run build

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app

# Definir variáveis de ambiente para produção
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Criar usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos públicos (como imagens e uploads)
COPY --from=builder /app/public ./public

# Criar diretórios de upload e aplicar permissões
RUN mkdir -p ./public/uploads/imoveis ./public/uploads/corretores
RUN chown -R nextjs:nodejs ./public/uploads

# Copiar arquivos de build do Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Garantir que os componentes e código fonte estejam disponíveis
COPY --from=builder --chown=nextjs:nodejs /app/src ./src

# Copiar arquivos de configuração
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/package.json ./

# Alternar para usuário não-root
USER nextjs

# Expor porta usada pela aplicação
EXPOSE 3000

# Definir variáveis de ambiente padrão
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Comando para iniciar a aplicação
CMD ["node", "server.js"]

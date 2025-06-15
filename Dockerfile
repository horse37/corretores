tentei fazer o # Dockerfile para projeto Next.js
# Multi-stage build para otimizar o tamanho da imagem
# Configurado para banco de dados externo

# Stage 1: Dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Definir variáveis de ambiente para build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build da aplicação
RUN npm run build

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos necessários do builder
COPY --from=builder /app/public ./public

# Criar diretório de uploads com permissões corretas
RUN mkdir -p ./public/uploads/imoveis ./public/uploads/corretores
RUN chown -R nextjs:nodejs ./public/uploads

# Copiar arquivos de build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar arquivos de configuração necessários
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/package.json ./

# Mudar para usuário não-root
USER nextjs

# Expor porta 4000 (conforme configurado no package.json)
EXPOSE 4000

ENV PORT 4000
ENV HOSTNAME "0.0.0.0"

# Comando para iniciar a aplicação
CMD ["node", "server.js"]
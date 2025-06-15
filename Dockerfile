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

# Copiar dependências do estágio anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar todo o projeto (inclui tsconfig.json, src/, public/ etc.)
COPY . .

# Desativar telemetria
ENV NEXT_TELEMETRY_DISABLED=1

# Build com ambiente de desenvolvimento (se necessário, use NODE_ENV=production aqui)
RUN NODE_ENV=development npm run build

# Stage 3: Runner (Imagem final e enxuta)
FROM node:18-alpine AS runner
WORKDIR /app

# Variáveis de ambiente
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Criar usuário não-root para produção
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos públicos e build
COPY --from=builder /app/public ./public

# Criar pastas para uploads e aplicar permissões
RUN mkdir -p ./public/uploads/imoveis ./public/uploads/corretores
RUN chown -R nextjs:nodejs ./public/uploads

# Copiar build standalone do Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar código fonte e arquivos de configuração necessários
COPY --from=builder --chown=nextjs:nodejs /app/src ./src
COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.js ./

# Trocar para o usuário seguro
USER nextjs

# Expor porta da aplicação
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["node", "server.js"]

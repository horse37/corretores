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

# Preparar o diretório node_modules/@
RUN mkdir -p ./node_modules/@/components ./node_modules/@/lib ./node_modules/@/app

# Copiar diretamente os componentes para node_modules/@
# Isso permite que importações como '@/components/...' funcionem corretamente durante o build
RUN cp -r ./src/components/* ./node_modules/@/components/
RUN cp -r ./src/lib/* ./node_modules/@/lib/
RUN cp -r ./src/app/* ./node_modules/@/app/

# Criar jsconfig.json para ajudar na resolução de caminhos durante o build
RUN echo '{"compilerOptions":{"baseUrl":".","paths":{"@/*":["./src/*"]}}}' > jsconfig.json

# Copiar jsconfig.json para node_modules/@ para garantir resolução de caminhos
RUN cp jsconfig.json ./node_modules/@/

# Desativar telemetria
ENV NEXT_TELEMETRY_DISABLED=1

# Build com ambiente de produção (padrão do Next.js)
# Adicionando --no-lint para evitar problemas durante o build
RUN npm run build -- --no-lint

# Garantir que os componentes estejam disponíveis nos diretórios .next/server e .next/standalone
RUN mkdir -p ./.next/server/app/components ./.next/server/src/components ./.next/standalone/src/components ./.next/standalone/src/lib ./.next/standalone/src/app
RUN cp -r ./src/components/* ./.next/server/app/components/
RUN cp -r ./src/components/* ./.next/server/src/components/
RUN cp -r ./src/components/* ./.next/standalone/src/components/
RUN cp -r ./src/lib/* ./.next/standalone/src/lib/
RUN cp -r ./src/app/* ./.next/standalone/src/app/

# Copiar jsconfig.json para o diretório standalone
RUN cp jsconfig.json ./.next/standalone/

# Copiar node_modules/@ para o diretório standalone
RUN mkdir -p ./.next/standalone/node_modules/@
RUN cp -r ./node_modules/@/* ./.next/standalone/node_modules/@/

# Stage 3: Runner (Imagem final e enxuta)
FROM node:18-alpine AS runner
WORKDIR /app

# Variáveis de ambiente
# Usando NODE_ENV=production que é o valor padrão esperado pelo Next.js em produção
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

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

# Copiar código fonte completo para garantir que todos os componentes estejam disponíveis
COPY --from=builder --chown=nextjs:nodejs /app/src ./src

# Configurar estrutura de diretórios para garantir que os componentes sejam encontrados durante a execução
# Criar diretórios para o alias '@' dentro de node_modules
RUN mkdir -p /app/node_modules/@/components /app/node_modules/@/lib /app/node_modules/@/app

# Copiar diretamente os componentes e outros diretórios importantes para node_modules/@
# Isso permite que importações como '@/components/...' funcionem corretamente
COPY --from=builder --chown=nextjs:nodejs /app/src/components/ /app/node_modules/@/components/
COPY --from=builder --chown=nextjs:nodejs /app/src/lib/ /app/node_modules/@/lib/
COPY --from=builder --chown=nextjs:nodejs /app/src/app/ /app/node_modules/@/app/

# Copiar arquivos de configuração necessários
COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/jsconfig.json ./

# Copiar jsconfig.json para node_modules/@ para garantir resolução de caminhos
COPY --from=builder --chown=nextjs:nodejs /app/jsconfig.json /app/node_modules/@/

# Trocar para o usuário seguro
USER nextjs

# Expor porta da aplicação
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["node", "server.js"]

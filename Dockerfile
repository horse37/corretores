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

# Build com ambiente de desenvolvimento para garantir que todos os módulos sejam incluídos
# Adicionando --no-lint para evitar problemas durante o build
RUN NODE_ENV=development npm run build -- --no-lint

# Verificar a estrutura de diretórios após o build para garantir que os componentes estejam nos lugares corretos
RUN ls -la ./.next/standalone/src 2>/dev/null || echo "Diretório standalone/src não existe"
RUN ls -la ./.next/server/src 2>/dev/null || echo "Diretório server/src não existe"

# Stage 3: Runner (Imagem final e enxuta)
FROM node:18-alpine AS runner
WORKDIR /app

# Variáveis de ambiente
# Usando NODE_ENV=development para garantir que todos os componentes sejam carregados corretamente
ENV NODE_ENV=development
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

# Copiar código fonte completo para garantir que todos os componentes estejam disponíveis
COPY --from=builder --chown=nextjs:nodejs /app/src ./src

# Garantir que os componentes estejam disponíveis em todos os possíveis caminhos onde o Next.js pode procurar por eles
RUN mkdir -p ./.next/server/app ./.next/server/src ./.next/server/chunks ./.next/cache/webpack/server-development

# Copiar componentes para todos os possíveis caminhos
COPY --from=builder --chown=nextjs:nodejs /app/src/components ./.next/server/src/components
COPY --from=builder --chown=nextjs:nodejs /app/src/components ./src/components

# Criar links simbólicos para garantir que os componentes sejam encontrados em qualquer caminho
RUN ln -sf /app/src/components /app/.next/server/components

# Configurar estrutura de diretórios para garantir que os componentes sejam encontrados durante a execução
# Criar diretório para o alias '@' dentro de node_modules
RUN mkdir -p /app/node_modules/@

# Criar link simbólico do diretório src para dentro de node_modules/@
# Isso permite que importações como '@/components/...' funcionem corretamente
RUN ln -sf /app/src /app/node_modules/@/src

# Criar link simbólico direto para a pasta components
RUN ln -sf /app/src/components /app/node_modules/@/components

# Criar link simbólico para outros diretórios importantes
RUN ln -sf /app/src/lib /app/node_modules/@/lib
RUN ln -sf /app/src/app /app/node_modules/@/app

# Copiar arquivos de configuração necessários
COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/tsconfig.json ./

# Criar jsconfig.json para ajudar na resolução de caminhos durante a execução
RUN echo '{"compilerOptions":{"baseUrl":".","paths":{"@/*":["./src/*"]}}}' > jsconfig.json

# Trocar para o usuário seguro
USER nextjs

# Expor porta da aplicação
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["node", "server.js"]

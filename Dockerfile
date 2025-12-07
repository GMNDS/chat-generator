# Build stage
FROM oven/bun:latest as builder

WORKDIR /app

# Copiar arquivos de dependência
COPY package.json bun.lockb* ./

# Instalar dependências
RUN bun install --frozen-lockfile

# Copiar código fonte
COPY . .

# Build
RUN bun run build

# Production stage
FROM oven/bun:latest

WORKDIR /app

# Copiar package.json
COPY package.json ./

# Instalar apenas dependências de produção
RUN bun install --production --frozen-lockfile

# Copiar build do stage anterior
COPY --from=builder /app/build ./build

# Expor porta
EXPOSE 3000

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Start
CMD ["node", "build/index.js"]

# Etapa de build
FROM node:lts-alpine AS builder

WORKDIR /usr/src/app

# Copiar arquivos de dependências primeiro
COPY package.json pnpm-lock.yaml ./

# Instalar PNPM e dependências
RUN npm install

# Copiar código-fonte
COPY . .

# Construir a aplicação
RUN npm run build

# Etapa final
FROM node:lts-alpine AS runner

WORKDIR /usr/src/app


# Copiar apenas arquivos necessários para produção
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/dist ./dist

# Expor a porta
EXPOSE 5000

# Rodar migrations e seed na inicialização
CMD ["sh", "-c", "npm run migration:run && npm run seed:run && npm run start:prod"]

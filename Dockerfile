# Etapa 1: Build
FROM node:18-slim AS builder

WORKDIR /app

# Instal·la dependències
COPY package*.json ./
RUN npm install --production

# Copia el codi font
COPY . .

# Compila l'aplicació (Next.js o qualsevol framework)
RUN npm run build

# Etapa 2: Execució amb distroless
FROM gcr.io/distroless/nodejs18-debian11 AS runner

WORKDIR /app

# Copiem només el que és necessari
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server.js ./start-server.js

# Port exposat
EXPOSE 3000

# Comanda per executar l'aplicació
CMD ["start-server.js"]

# Etapa 1: Build
FROM node:18-slim AS builder

ARG BASE_CONTENT_DIR
ENV BASE_CONTENT_DIR=${BASE_CONTENT_DIR}

ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}

# DEBUG SHOW VALUES OF ENV VARS
RUN echo "BASE_CONTENT_DIR=${BASE_CONTENT_DIR}"
RUN echo "NODE_ENV=${NODE_ENV}"

WORKDIR /app

# Instal·la dependències
COPY package*.json ./
RUN npm install --production

# Copia el codi font
COPY . .

# Elimina les carpetes public i posts per assegurar que no col·lisionen amb el volum
RUN rm -rf public posts

# Compila l'aplicació (Next.js o qualsevol framework)
RUN npm run build

# Etapa 2: Execució amb distroless
#FROM gcr.io/distroless/nodejs18-debian11 AS runner
FROM node:18-alpine AS runner

WORKDIR /app

# Copiem només el que és necessari
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/start-server.js ./start-server.js
COPY --from=builder /app/posts ./posts
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/./next-i18next.config.js ./next-i18next.config.js

# Port exposat
EXPOSE 3000

# Comanda per executar l'aplicació
#CMD ["start-server.js"]

# Run with Node.js explicitly
CMD ["start-server.js"]

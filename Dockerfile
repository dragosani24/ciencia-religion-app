# --- ETAPA 1: Procesamiento del Libro con Python ---
FROM python:3.9-slim AS parser
WORKDIR /app
# Instalar dependencia para leer PDF
RUN pip install pymupdf
# Copiar el script y el PDF
COPY scripts/parser.py .
COPY ciencia_y_religion_modificado_directo.pdf .
# Ejecutar el script (esto genera init_data.sql)
RUN python parser.py

# --- ETAPA 2: Construcción de la App (Node.js) ---
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm install
COPY src ./src
COPY . .
# Copiamos el SQL generado en la etapa anterior para tenerlo disponible
COPY --from=parser /app/init_data.sql ./init_data.sql
RUN npx prisma generate
RUN npm run build

# --- ETAPA 3: Ejecución ---
FROM node:18-alpine AS runner
WORKDIR /app
# Instalar OpenSSL para Prisma
RUN apk add --no-cache openssl libc6-compat
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
# Copiamos el archivo SQL a la raíz por si necesitamos consultarlo
COPY --from=builder /app/init_data.sql ./init_data.sql

EXPOSE 3000
CMD ["npm", "start"]
# ── Stage développement (utilisé par Docker Compose) ─────────────────────────
FROM node:20-alpine AS dev

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]


# ── Stage build production ────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# ── Stage production (Nginx) ──────────────────────────────────────────────────
FROM nginx:alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html

# Métriques Prometheus (format texte) pour scrape depuis le conteneur
COPY docker-metrics.txt /etc/nginx/docker-metrics.txt

# Config Nginx SPA : redirige toutes les routes vers index.html (React Router)
RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location = /metrics {\n\
        alias /etc/nginx/docker-metrics.txt;\n\
        default_type text/plain;\n\
        charset utf-8;\n\
    }\n\
    location / { try_files $uri $uri/ /index.html; }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

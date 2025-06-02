# Dockerfile multi-stage para aplicación Angular

# Etapa 1: Build de la aplicación
FROM node:22.16.0-alpine AS build

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Debug: mostrar estructura completa
RUN echo "=== Estructura completa de dist ===" && \
    find /app/dist -type f -name "*.html" -o -name "*.js" -o -name "*.css" | head -20 && \
    echo "=== Archivos en dist ===" && \
    ls -la /app/dist/ && \
    if [ -d "/app/dist" ]; then find /app/dist -mindepth 1 -maxdepth 2 -type d -exec echo "Dir: {}" \; -exec ls -la {} \;; fi

# Etapa 2: Servir la aplicación con Nginx
FROM nginx:alpine AS production

# Eliminar página por defecto de nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar TODA la carpeta dist temporalmente
COPY --from=build /app/dist /tmp/angular-dist

# Script para encontrar y copiar los archivos correctos
RUN echo "=== Buscando archivos Angular ===" && \
    INDEX_FILE=$(find /tmp/angular-dist -name "index.html" | head -1) && \
    if [ -n "$INDEX_FILE" ]; then \
        echo "Index encontrado en: $INDEX_FILE" && \
        ANGULAR_DIR=$(dirname "$INDEX_FILE") && \
        echo "Copiando desde: $ANGULAR_DIR" && \
        cp -r "$ANGULAR_DIR"/* /usr/share/nginx/html/ && \
        echo "Archivos copiados:" && \
        ls -la /usr/share/nginx/html/; \
    else \
        echo "ERROR: No se encontró index.html" && \
        echo "Contenido de /tmp/angular-dist:" && \
        find /tmp/angular-dist -type f | head -20; \
    fi

# Asegurar permisos correctos
RUN chmod -R 755 /usr/share/nginx/html/

# Configuración básica de Nginx para Angular
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]
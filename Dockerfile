# Utiliza la imagen de Alpine como base
FROM alpine:latest

# Instalar Node.js y npm
RUN apk add --update nodejs npm

# Crear un directorio para la aplicación
WORKDIR /app

# Copiar el archivo del servidor de Node.js
COPY app/ .

# Instalar cualquier paquete necesario
RUN npm install

# Instalar nodemon globalmente
RUN npm install -g nodemon

# Ejecutar el servidor de Node.js usando nodemon
CMD ["npm", "run", "dev"]

# Step 1: Build the Vite app
FROM node:20-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Step 2: Serve with Nginx
FROM nginx:alpine
# Copy the 'dist' folder from the build stage to Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Update Nginx to listen on the port Cloud Run provides ($PORT)
CMD ["/bin/sh", "-c", "sed -i 's/listen  80;/listen '\"${PORT:-8080}\"';/' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
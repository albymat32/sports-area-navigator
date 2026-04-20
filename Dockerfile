# Step 1: Build the Vite app
FROM node:20-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm install
COPY . .
RUN npm run build

# Step 2: Serve with Nginx (Security & Google Services optimized)
FROM nginx:alpine
# Copy the 'dist' folder from the build stage to Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Write a robust default configuration that handles SPA routing,
# binds to 8080, disables server tokens (Security), and uses
# JSON logging formatted for Google Cloud Logging (Google Services).
RUN echo "log_format json_combined escape=json" > /etc/nginx/conf.d/default.conf && \
    echo "  '{" >> /etc/nginx/conf.d/default.conf && \
    echo "    \"time_local\": \"\$time_local\"," >> /etc/nginx/conf.d/default.conf && \
    echo "    \"remote_addr\": \"\$remote_addr\"," >> /etc/nginx/conf.d/default.conf && \
    echo "    \"request\": \"\$request\"," >> /etc/nginx/conf.d/default.conf && \
    echo "    \"status\": \"\$status\"," >> /etc/nginx/conf.d/default.conf && \
    echo "    \"body_bytes_sent\": \"\$body_bytes_sent\"," >> /etc/nginx/conf.d/default.conf && \
    echo "    \"http_referer\": \"\$http_referer\"," >> /etc/nginx/conf.d/default.conf && \
    echo "    \"http_user_agent\": \"\$http_user_agent\"" >> /etc/nginx/conf.d/default.conf && \
    echo "  }';" >> /etc/nginx/conf.d/default.conf && \
    echo "server {" >> /etc/nginx/conf.d/default.conf && \
    echo "    listen 8080;" >> /etc/nginx/conf.d/default.conf && \
    echo "    server_name _;" >> /etc/nginx/conf.d/default.conf && \
    echo "    server_tokens off;" >> /etc/nginx/conf.d/default.conf && \
    echo "    access_log /var/log/nginx/access.log json_combined;" >> /etc/nginx/conf.d/default.conf && \
    echo "    add_header X-Content-Type-Options nosniff;" >> /etc/nginx/conf.d/default.conf && \
    echo "    add_header X-Frame-Options DENY;" >> /etc/nginx/conf.d/default.conf && \
    echo "    add_header X-XSS-Protection \"1; mode=block\";" >> /etc/nginx/conf.d/default.conf && \
    echo "    location / {" >> /etc/nginx/conf.d/default.conf && \
    echo "        root /usr/share/nginx/html;" >> /etc/nginx/conf.d/default.conf && \
    echo "        index index.html index.htm;" >> /etc/nginx/conf.d/default.conf && \
    echo "        try_files \$uri \$uri/ /index.html;" >> /etc/nginx/conf.d/default.conf && \
    echo "    }" >> /etc/nginx/conf.d/default.conf && \
    echo "}" >> /etc/nginx/conf.d/default.conf

# Run as a non-root user for security
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid
USER nginx

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
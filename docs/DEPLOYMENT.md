# Deployment Guide

## Environment Setup

### Development Environment
```bash
# Clone repository
git clone https://github.com/nischay-32/SynergySphere.git
cd SynergySphere

# Install dependencies
npm run install:all

# Setup environment
npm run setup

# Start development
npm run dev
```

### Production Environment

#### Prerequisites
- Node.js 18+ LTS
- MongoDB 6.0+
- PM2 (for process management)
- Nginx (reverse proxy)
- SSL certificate

#### Server Setup
```bash
# Install PM2 globally
npm install -g pm2

# Install dependencies
npm run install:all

# Build frontend
cd frontend && npm run build

# Setup environment variables
cp backend/.env.example backend/.env
# Edit .env with production values
```

#### Environment Variables (Production)
```bash
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://your-production-db/synergysphere
JWT_SECRET=your-super-secure-production-secret
CLIENT_URL=https://your-domain.com
```

#### PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'synergysphere-backend',
    script: './backend/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # Frontend
    location / {
        root /path/to/SynergySphere/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Docker Deployment

### Dockerfile (Backend)
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

USER node

CMD ["npm", "start"]
```

### Dockerfile (Frontend)
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: synergysphere-db
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"

  backend:
    build: ./backend
    container_name: synergysphere-backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      MONGO_URI: mongodb://admin:password@mongodb:27017/synergysphere?authSource=admin
      JWT_SECRET: your-production-secret
    depends_on:
      - mongodb
    ports:
      - "5000:5000"

  frontend:
    build: ./frontend
    container_name: synergysphere-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

## CI/CD Pipeline

### GitHub Actions
The project includes automated CI/CD pipeline that:
- Runs tests on every PR
- Performs security audits
- Deploys to staging on `develop` branch
- Deploys to production on `main` branch

### Manual Deployment Commands
```bash
# Production deployment
git checkout main
git pull origin main
npm run install:all
cd frontend && npm run build
pm2 restart ecosystem.config.js
```

## Monitoring & Logging

### PM2 Monitoring
```bash
# View logs
pm2 logs

# Monitor processes
pm2 monit

# Restart application
pm2 restart synergysphere-backend
```

### Health Checks
```bash
# Backend health
curl https://your-domain.com/api/v1/health

# Frontend health
curl https://your-domain.com
```

## Backup Strategy

### Database Backup
```bash
# Create backup
mongodump --uri="mongodb://your-connection-string" --out=/backup/$(date +%Y%m%d)

# Restore backup
mongorestore --uri="mongodb://your-connection-string" /backup/20240101
```

### Automated Backup Script
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/synergysphere"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR/db_$DATE"

# Application backup
tar -czf "$BACKUP_DIR/app_$DATE.tar.gz" /path/to/SynergySphere

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -type f -mtime +7 -delete
```

## Security Considerations

### SSL/TLS
- Use Let's Encrypt for free SSL certificates
- Configure HTTPS redirects
- Enable HSTS headers

### Environment Security
- Never commit `.env` files
- Use strong JWT secrets
- Implement rate limiting
- Regular security updates

### Database Security
- Enable MongoDB authentication
- Use connection string with credentials
- Regular database backups
- Network security (firewall rules)

## Performance Optimization

### Backend Optimization
- Enable gzip compression
- Implement caching strategies
- Database indexing
- Connection pooling

### Frontend Optimization
- Code splitting
- Lazy loading
- Image optimization
- CDN for static assets

## Troubleshooting

### Common Issues
1. **Port conflicts**: Check if ports 5000/3000 are available
2. **Database connection**: Verify MongoDB is running and accessible
3. **Environment variables**: Ensure all required variables are set
4. **File permissions**: Check read/write permissions for uploads

### Log Analysis
```bash
# Backend logs
pm2 logs synergysphere-backend

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# System logs
journalctl -u nginx -f
```

## Rollback Procedures

### Quick Rollback
```bash
# Rollback to previous version
git checkout HEAD~1
npm run install:all
cd frontend && npm run build
pm2 restart synergysphere-backend
```

### Database Rollback
```bash
# Restore from backup
mongorestore --uri="$MONGO_URI" --drop /backup/previous_version
```

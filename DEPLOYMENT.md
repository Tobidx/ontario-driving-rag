# MTO RAG App - Deployment Guide

## 🚀 Production Deployment Options

### Option 1: Docker Compose (Recommended for VPS)

**Prerequisites:**
- Docker and Docker Compose installed
- Domain name configured
- SSL certificate (Let's Encrypt recommended)

**Steps:**
1. Clone the repository:
   ```bash
   git clone https://github.com/Tobidx/mto-rag-app.git
   cd mto-rag-app
   ```

2. Set up environment variables:
   ```bash
   cp .env.docker .env
   # Edit .env with your production values
   ```

3. Deploy with Docker Compose:
   ```bash
   docker-compose up -d
   ```

4. Run database migrations:
   ```bash
   docker-compose exec backend npm run db:migrate
   ```

**Your app will be available at:**
- Frontend: `http://your-domain.com:3000`
- Backend API: `http://your-domain.com:3001`

### Option 2: Cloudflare Pages + Workers

**Prerequisites:**
- Cloudflare account
- Domain configured in Cloudflare
- Wrangler CLI installed

**Steps:**
1. Install Wrangler:
   ```bash
   npm install -g wrangler
   ```

2. Deploy frontend to Pages:
   ```bash
   cd frontend
   npm run build
   wrangler pages deploy dist --project-name=mto-rag-app
   ```

3. Set up backend (requires adaptation for Workers or external VPS)

### Option 3: Traditional VPS Deployment

**For Ubuntu/Debian servers:**

1. Install dependencies:
   ```bash
   sudo apt update
   sudo apt install nodejs npm postgresql python3 python3-pip nginx
   ```

2. Set up PostgreSQL:
   ```bash
   sudo -u postgres createdb mto_rag_db
   sudo -u postgres createuser mto_user
   ```

3. Clone and setup:
   ```bash
   git clone https://github.com/Tobidx/mto-rag-app.git
   cd mto-rag-app
   ./setup.sh
   ```

4. Configure Nginx reverse proxy
5. Set up SSL with Let's Encrypt
6. Use PM2 for process management

## 🔧 Configuration

### Environment Variables

**Required for all deployments:**
```bash
# API Keys
XAI_API_KEY=your_grok_api_key
VOYAGE_API_KEY=your_voyage_api_key

# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# JWT Secret
JWT_SECRET=your_secure_jwt_secret

# Server
NODE_ENV=production
PORT=3001
```

### Database Setup

1. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

2. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

## 🏗️ Build Process

### Backend
```bash
cd backend
npm run build
npm run db:generate
```

### Frontend
```bash
cd frontend
npm run build
```

## 🔍 Health Checks

- Backend: `GET /api/health`
- Database: Prisma connection test
- RAG Engine: Python dependencies check

## 📊 Monitoring

Monitor these endpoints:
- `/api/health` - Overall system health
- `/api/rag/stats` - RAG system statistics
- Database connection status
- Python RAG engine status

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **JWT Secret**: Use a strong, unique secret in production
3. **Database**: Use strong passwords and limit access
4. **API Keys**: Rotate regularly and limit permissions
5. **HTTPS**: Always use SSL in production
6. **Rate Limiting**: Configure appropriate limits

## 🐞 Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Verify PostgreSQL is running
   - Check network connectivity

2. **Python RAG Engine Issues**
   - Verify Python dependencies installed
   - Check API keys are valid
   - Ensure data/knowledge_base.json exists

3. **Build Failures**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify TypeScript compilation

### Log Locations:
- Backend: `backend/logs/`
- Frontend: Browser developer console
- Docker: `docker-compose logs`

## 📈 Scaling

For high-traffic production:

1. **Database**: Use connection pooling (PgBouncer)
2. **Caching**: Add Redis for session/query caching
3. **Load Balancing**: Use Nginx or Cloudflare
4. **CDN**: Serve static assets via CDN
5. **Monitoring**: Set up Prometheus + Grafana

---

**Support**: For deployment issues, check the GitHub repository or create an issue.
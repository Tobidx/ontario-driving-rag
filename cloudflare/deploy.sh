#!/bin/bash

# Cloudflare Deployment Script for MTO RAG App
echo "🚀 Deploying MTO RAG App to Cloudflare..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Login to Cloudflare (if not already)
echo "🔐 Checking Cloudflare authentication..."
wrangler whoami || wrangler login

# Set environment variables (only run once)
echo "🔑 Setting up environment variables..."
echo "Please set these secrets manually:"
echo "wrangler secret put XAI_API_KEY"
echo "wrangler secret put VOYAGE_API_KEY"
echo "wrangler secret put JWT_SECRET"
echo "wrangler secret put DATABASE_URL"

# Build frontend for static hosting
echo "🏗️  Building frontend..."
cd ../frontend
npm run build

# Deploy frontend to Cloudflare Pages
echo "📦 Deploying frontend to Cloudflare Pages..."
wrangler pages deploy dist --project-name=mto-rag-frontend

# Deploy backend as Cloudflare Worker (if using Workers)
echo "⚡ Backend deployment note:"
echo "For production, consider using:"
echo "1. Cloudflare Workers + D1 database"
echo "2. Or traditional VPS with Docker Compose"

echo "✅ Deployment script completed!"
echo "🌐 Your app will be available at your custom domain"
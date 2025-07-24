#!/bin/bash

echo "🚀 Setting up MTO RAG Application..."

# Copy environment file
if [ ! -f .env ]; then
    cp .env.docker .env
    echo "✅ Environment file created"
fi

# Start services with Docker Compose
echo "🐳 Starting all services..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 15

# Run database migrations
echo "🔨 Setting up database..."
docker-compose exec backend npm run db:migrate

echo "✅ Setup complete!"
echo "🌟 Access your app at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:3001"
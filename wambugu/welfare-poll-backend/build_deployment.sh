#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment build process..."

# Define paths
BACKEND_DIR="./"
FRONTEND_DIR="../welfare-poll-frontend"
BUILD_DIR="../welfare_poll_build"

# Clean up previous build
echo "🧹 Cleaning up previous build..."
rm -rf "$BUILD_DIR"
rm -f welfare-poll-cpanel.zip

# Create build directory
mkdir -p "$BUILD_DIR"
mkdir -p "$BUILD_DIR/public"

# Build Frontend
echo "📦 Building Frontend..."
cd "$FRONTEND_DIR"
npm install
npm run build
cd - > /dev/null

# Copy Frontend build to Backend public folder in build dir
echo "mb Copying Frontend build to deployment package..."
cp -r "$FRONTEND_DIR/dist/"* "$BUILD_DIR/public/"

# Copy Backend files
echo "mb Copying Backend files..."
cp -r "$BACKEND_DIR/src" "$BUILD_DIR/"
cp "$BACKEND_DIR/package.json" "$BUILD_DIR/"
cp "$BACKEND_DIR/package-lock.json" "$BUILD_DIR/"
cp "$BACKEND_DIR/.env.example" "$BUILD_DIR/"
cp "$BACKEND_DIR/app.js" "$BUILD_DIR/" 2>/dev/null || true # In case app.js is in root, but it's in src
# Check if there are other root files needed
cp -r "$BACKEND_DIR/seeders" "$BUILD_DIR/" 2>/dev/null || true
cp -r "$BACKEND_DIR/config" "$BUILD_DIR/" 2>/dev/null || true
cp -r "$BACKEND_DIR/migrations" "$BUILD_DIR/" 2>/dev/null || true

# Create a production .env template
echo "📝 Creating production .env template..."
cat > "$BUILD_DIR/.env" << EOL
NODE_ENV=production
PORT=3000
# Database (PostgreSQL is default, change to 'mysql' if using MySQL/MariaDB)
DB_DIALECT=postgres
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
# Security
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=24h
# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@snapsynk.co.ke
# Admin
ADMIN_EMAIL=admin@snapsynk.co.ke
ADMIN_INITIAL_PASSWORD=ChangeMe123!
# CORS (Domain)
CORS_ORIGIN=https://snapsynk.co.ke
EOL

# Zip the build
echo "🤐 Zipping deployment package..."
cd "$BUILD_DIR"
zip -r ../welfare-poll-cpanel.zip .
cd - > /dev/null

echo "✅ Build complete! File 'welfare-poll-cpanel.zip' is ready for upload."
echo "📂 Location: $(pwd)/../welfare-poll-cpanel.zip"

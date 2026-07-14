#!/bin/bash
set -e

export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8

echo "========================================"
echo "   Ziddy Document Print System"
echo "   One-Click Startup"
echo "========================================"
echo ""

echo "[1/3] Checking Node.js environment..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
    echo "Node.js detected: $NODE_VERSION"
else
    echo "WARNING: Node.js version $NODE_VERSION is below recommended $REQUIRED_VERSION"
fi
echo ""

echo "[2/3] Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi
echo "Dependencies check passed."
echo ""

echo "[3/3] Starting services..."
echo ""

hasBackend=0
if [ -d "backend" ] && [ -f "backend/package.json" ]; then
    hasBackend=1
fi
if [ -d "server" ] && [ -f "server/package.json" ]; then
    hasBackend=1
fi

if [ $hasBackend -eq 1 ]; then
    echo "Starting backend server..."
    cd backend && npm run dev &
    BACKEND_PID=$!
    cd ..
    sleep 3
fi

echo "Starting frontend development server..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "   Services are starting..."
echo "========================================"
echo ""
echo "Frontend will be available at: http://localhost:5173"
echo ""
if [ $hasBackend -eq 1 ]; then
    echo "Backend will be available at: http://localhost:3000"
    echo ""
fi

echo "Press Ctrl+C to stop all services..."

trap "echo 'Stopping services...'; kill $FRONTEND_PID 2>/dev/null; if [ $hasBackend -eq 1 ]; then kill $BACKEND_PID 2>/dev/null; fi; exit 0" INT

wait
#!/bin/bash
#
# Install Phase 5 Dependencies
# Run this script to install authentication and database dependencies
#

echo "========================================"
echo "Installing Phase 5 Dependencies"
echo "========================================"
echo ""

echo "📦 Installing core dependencies..."
pip install sqlalchemy==2.0.36

echo "📦 Installing authentication dependencies..."
pip install passlib[bcrypt]==1.7.4
pip install python-jose[cryptography]==3.3.0

echo "📦 Installing AI/ML dependencies..."
pip install sentence-transformers==3.3.1

echo ""
echo "✅ All dependencies installed!"
echo ""
echo "Next steps:"
echo "  1. Run tests: python test_auth_flow.py"
echo "  2. Start server: uvicorn app.main:app --reload"
echo ""

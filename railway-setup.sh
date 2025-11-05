#!/bin/bash
# Railway Setup Script for Express x402 Service
# Run this AFTER: railway login

echo "🚂 Railway CLI Setup for Express x402 Service"
echo ""

# Link to project (if not already linked)
echo "1. Linking to Railway project..."
railway link

# Check available services
echo ""
echo "2. Checking services..."
railway service list

# For Express service - set root directory
echo ""
echo "3. Setting Express service root directory to x402-server..."
echo "Select the Express/x402 service when prompted:"
railway service

# Set root directory
railway variables set RAILWAY_ROOT_DIRECTORY=x402-server

# Or use the service-specific command if available
# railway service --service <service-name> --root-directory x402-server

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Verify variables are set in Railway dashboard"
echo "2. Check Express service URL in Railway → Settings → Networking"
echo "3. Set X402_SERVER_URL in Next.js service with Express URL"


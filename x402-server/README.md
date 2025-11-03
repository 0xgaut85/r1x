# r1x x402 Express Server

Serveur Express dédié pour les paiements x402 utilisant le middleware PayAI officiel.

## 📦 Installation locale

```bash
cd x402-server
npm install
npm run dev
```

Le serveur démarrera sur `http://localhost:4021`

## 🚀 Déploiement Railway

Voir le guide complet dans [RAILWAY.md](./RAILWAY.md)

## 🔧 Variables d'environnement requises

- `MERCHANT_ADDRESS` - Adresse wallet merchant (Base network)
- `FACILITATOR_URL` - URL du facilitateur PayAI (default: https://facilitator.payai.network)
- `NETWORK` - Réseau (base ou base-sepolia)
- `CDP_API_KEY_ID` - Coinbase Developer Platform API Key ID (requis pour Base mainnet)
- `CDP_API_KEY_SECRET` - Coinbase Developer Platform API Key Secret
- `ANTHROPIC_API_KEY` - Pour r1x Agent chat
- `PORT` - Port du serveur (Railway le définit automatiquement)

## 📡 Endpoints

- `POST /api/r1x-agent/chat` - Chat avec r1x Agent (0.25 USDC par message)
- `POST /api/x402/pay` - Paiement pour services marketplace
- `GET /health` - Health check endpoint

## 📚 Documentation

- [PayAI x402 Express Documentation](https://docs.payai.network/x402/servers/typescript/express)
- [Railway Deployment Guide](./RAILWAY.md)


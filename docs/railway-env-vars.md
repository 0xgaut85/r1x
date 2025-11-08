# Variables d'environnement Railway

## 📍 Où configurer les variables sur Railway

Dans Railway, chaque **service** a ses propres variables d'environnement.

### Accès aux variables :

1. Va sur https://railway.app
2. Sélectionne ton projet
3. Clique sur le **service** (Next.js ou Express x402)
4. Va dans l'onglet **"Variables"**
5. Clique sur **"New Variable"** pour ajouter chaque variable

### Variables partagées entre services :

Tu peux aussi définir des variables au **niveau du projet** (tous les services les héritent) :
1. Dans le projet Railway → **Settings** → **Variables**
2. Variables définies ici sont disponibles pour tous les services

---

## 🔧 Variables pour Service Next.js

```env
# Database (depuis Railway PostgreSQL)
DATABASE_URL=postgresql://... # Généré automatiquement par Railway DB

# x402 Payment
MERCHANT_ADDRESS=0x... # Ton adresse wallet merchant (Base network)
FEE_RECIPIENT_ADDRESS=0x... # r1x wallet pour recevoir les fees (Base)
PLATFORM_FEE_PERCENTAGE=5

# PayAI Facilitator (EVM networks: Base, Polygon, etc.)
FACILITATOR_URL=https://facilitator.payai.network
NETWORK=base
CDP_API_KEY_ID=... # Coinbase Developer Platform API Key ID
CDP_API_KEY_SECRET=... # Coinbase Developer Platform API Key Secret
PAYAI_FACILITATOR_ADDRESS=... # Optionnel

# Daydreams Facilitator (Solana network)
DAYDREAMS_FACILITATOR_URL=https://facilitator.daydreams.systems
SOLANA_FEE_RECIPIENT_ADDRESS=F... # Adresse Solana (public key base58) pour recevoir les fees
NEXT_PUBLIC_SOLANA_RPC_URL=https://YOUR-ENDPOINT.solana-mainnet.quiknode.pro/YOUR-API-KEY/ # QuickNode Solana Mainnet RPC
# Alternative providers:
# - QuickNode: https://YOUR-ENDPOINT.solana-mainnet.quiknode.pro/YOUR-API-KEY/
# - Alchemy: https://solana-mainnet.g.alchemy.com/v2/YOUR-API-KEY
# - Helius: https://mainnet.helius-rpc.com/?api-key=YOUR-API-KEY

# AI Agent
ANTHROPIC_API_KEY=sk-ant-... # Anthropic API key

# Application URLs
NEXT_PUBLIC_BASE_URL=https://ton-nextjs-url.up.railway.app # URL du service Next.js Railway
X402_SERVER_URL=https://ton-x402-url.up.railway.app # URL du service Express Railway (server-side proxy only)
# NOTE: NEXT_PUBLIC_X402_SERVER_URL no longer needed - client uses Next.js API routes (/api/...)

# Optional
SERVER_WALLET_PRIVATE_KEY=0x... # Pour transfer fees automatique (EVM)
SYNC_SECRET=... # Secret pour protéger /api/sync/payai

# Third-party APIs (optional - fallback to hardcoded values if not set)
NEXT_PUBLIC_LOGOKIT_API_KEY=pk_... # LogoKit API key for crypto logos (optional)
NEXT_PUBLIC_APIFLASH_ACCESS_KEY=... # ApiFlash access key for service screenshots (optional)
```

---

## 🔧 Variables pour Service Express x402

```env
# PayAI Facilitator
FACILITATOR_URL=https://facilitator.payai.network
NETWORK=base
MERCHANT_ADDRESS=0x... # Même adresse que Next.js
CDP_API_KEY_ID=... # Coinbase Developer Platform API Key ID
CDP_API_KEY_SECRET=... # Coinbase Developer Platform API Key Secret

# AI Agent
ANTHROPIC_API_KEY=sk-ant-... # Anthropic API key
```

**Note** : `PORT` est défini automatiquement par Railway, pas besoin de l'ajouter.

---

## 📝 Comment obtenir les valeurs

### MERCHANT_ADDRESS & FEE_RECIPIENT_ADDRESS
- Adresses wallet sur Base network (commencent par `0x...`)
- Utilise MetaMask ou ton wallet pour obtenir ces adresses

### SOLANA_FEE_RECIPIENT_ADDRESS
- Adresse Solana (base58) qui recevra les fees (ex: Phantom → Copy Address)
- Doit correspondre au destinataire (`to`) dans la preuve de paiement pour /api/x402/solana/fee

### CDP_API_KEY_ID & CDP_API_KEY_SECRET
1. Va sur https://portal.cdp.coinbase.com/
2. Crée un nouveau projet
3. Crée une API Key
4. Copie l'ID et le Secret

### ANTHROPIC_API_KEY
1. Va sur https://console.anthropic.com/
2. Crée une API key
3. Copie la clé (commence par `sk-ant-...`)

### DATABASE_URL
- Railway génère automatiquement cette URL quand tu crées une PostgreSQL database
- Va dans Railway → Service Database → Variables → `DATABASE_URL`

### NEXT_PUBLIC_BASE_URL & X402_SERVER_URL
- `NEXT_PUBLIC_BASE_URL`: URL générée automatiquement par Railway pour le service Next.js
- `X402_SERVER_URL`: URL du service Express Railway (pour proxy server-side uniquement)
- Après avoir déployé les services, va dans Settings → Networking → Generate Domain
- Copie les URLs générées et ajoute-les comme variables

---

## ⚠️ Important

- Les variables `NEXT_PUBLIC_*` sont exposées côté client (dans le navigateur)
- Ne mets JAMAIS de secrets dans `NEXT_PUBLIC_*`
- `X402_SERVER_URL` (sans NEXT_PUBLIC) est utilisée côté serveur uniquement pour proxy
- **Client-side**: Utilise les routes Next.js API (`/api/r1x-agent/chat`, `/api/x402/pay`) - même origine, pas de CORS
- **Architecture**: Browser → Next.js API routes → Express server (server-to-server)


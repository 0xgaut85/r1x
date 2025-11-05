# Migration Railway - Guide complet

## 🎯 Architecture Railway

Railway va héberger **2 services** :

1. **Service Next.js** - Application principale (frontend + API routes)
2. **Service Express x402** - Serveur PayAI pour les paiements (port 4021)

## 📋 Étape 1 : Créer le projet Railway

1. Va sur https://railway.app
2. Clique sur **"New Project"**
3. Sélectionne **"Deploy from GitHub repo"**
4. Choisis ton repository `r1x`
5. Railway crée le projet

## 📋 Étape 2 : Service Next.js (Application principale)

1. Dans le projet Railway, clique sur **"New Service"**
2. Sélectionne **"GitHub Repo"** → ton repo `r1x`
3. Railway détecte automatiquement Next.js

### Configuration Service Next.js :

**Settings → Root Directory** : Laisser vide (racine du projet)

**Settings → Build Command** :
```bash
npm install && npm run build
```

**Settings → Start Command** :
```bash
npm start
```

**Settings → Variables** (voir section Variables d'environnement ci-dessous)

## 📋 Étape 3 : Service Express x402 (Paiements)

1. Dans le même projet Railway, clique sur **"New Service"**
2. Sélectionne **"GitHub Repo"** → ton repo `r1x`

### Configuration Service Express :

**Settings → Root Directory** : `x402-server`

**Settings → Build Command** :
```bash
npm install && npm run build
```

**Settings → Start Command** :
```bash
npm start
```

**Settings → Variables** (voir section Variables d'environnement ci-dessous)

**Settings → Networking** : Génère un domaine pour ce service (ex: `r1x-x402.up.railway.app`)

## 📋 Étape 4 : Variables d'environnement Railway

### Pour le Service Next.js :

Dans Railway → Service Next.js → Variables, ajoute :

```env
# Database
DATABASE_URL=postgresql://... # Connection string PostgreSQL (Railway peut créer une DB PostgreSQL)

# x402 Payment
MERCHANT_ADDRESS=0x... # Ton adresse wallet merchant (Base network)
FEE_RECIPIENT_ADDRESS=0x... # r1x wallet pour recevoir les fees
PLATFORM_FEE_PERCENTAGE=5

# PayAI Facilitator
FACILITATOR_URL=https://facilitator.payai.network
NETWORK=base
CDP_API_KEY_ID=... # Coinbase Developer Platform API Key ID
CDP_API_KEY_SECRET=... # Coinbase Developer Platform API Key Secret
PAYAI_FACILITATOR_ADDRESS=... # Optionnel, auto-fetch si vide

# AI Agent
ANTHROPIC_API_KEY=sk-ant-... # Anthropic API key

# Application
NEXT_PUBLIC_BASE_URL=https://ton-url-railway.app # URL du service Next.js Railway
X402_SERVER_URL=https://r1x-x402.up.railway.app # URL du service Express Railway

# Optional
SERVER_WALLET_PRIVATE_KEY=0x... # Pour transfer fees automatique
SYNC_SECRET=... # Secret pour protéger /api/sync/payai
```

### Pour le Service Express x402 :

Dans Railway → Service Express → Variables, ajoute :

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

**Note** : Railway définit automatiquement `PORT` pour chaque service, pas besoin de l'ajouter.

## 📋 Étape 5 : Database PostgreSQL sur Railway

1. Dans le projet Railway, clique sur **"New Service"**
2. Sélectionne **"Database"** → **"PostgreSQL"**
3. Railway crée automatiquement une DB PostgreSQL
4. Railway génère automatiquement `DATABASE_URL` et l'ajoute aux variables d'environnement
5. **Important** : Utilise cette `DATABASE_URL` dans le service Next.js

### Migration Database :

Une fois la DB créée, dans Railway → Service Next.js → Deployments → View Logs, tu peux exécuter :

```bash
npx prisma migrate deploy
```

Ou via Railway CLI :
```bash
railway run npx prisma migrate deploy
```

## 📋 Étape 6 : Routes Next.js

Les routes Next.js suivantes ont été supprimées car elles sont maintenant gérées par Express Railway :
- `/api/r1x-agent/chat` → Utilise directement Express Railway
- `/api/x402/pay` → Utilise directement Express Railway  
- `/api/x402/verify` → Géré automatiquement par middleware PayAI

Les routes suivantes restent dans Next.js (nécessitent la DB) :
- `/api/marketplace/services` → Liste les services depuis la DB
- `/api/sync/payai` → Sync PayAI services vers la DB
- `/api/panel/*` → Panels utilisateur et plateforme

## ✅ Checklist de déploiement

- [ ] Projet Railway créé
- [ ] Service Next.js créé et configuré
- [ ] Service Express x402 créé et configuré
- [ ] Database PostgreSQL créée sur Railway
- [ ] Variables d'environnement ajoutées aux deux services
- [ ] `DATABASE_URL` configuré dans Next.js (depuis Railway DB)
- [ ] `X402_SERVER_URL` configuré dans Next.js (URL du service Express)
- [ ] Build et déploiement réussis pour les deux services
- [ ] Health check Express réussi (`/health`)
- [ ] Routes Next.js modifiées pour utiliser `X402_SERVER_URL`

## 🔍 URLs importantes

- **Next.js** : `https://ton-projet.up.railway.app` (URL principale)
- **Express x402** : `https://r1x-x402.up.railway.app` (URL du serveur Express)
- **Database** : Gérée automatiquement par Railway

## 📝 Notes

- Railway définit automatiquement `PORT` pour chaque service
- Les deux services peuvent partager certaines variables d'environnement (dans Railway → Project → Variables)
- Railway peut prendre 2-5 minutes pour le premier déploiement
- Les builds suivants sont plus rapides grâce au cache


# Guide de déploiement Railway - r1x x402 Server

## 📋 Étape par étape

### Étape 1 : Créer un compte Railway
1. Va sur https://railway.app
2. Crée un compte (GitHub login recommandé)
3. Connecte ton compte GitHub

### Étape 2 : Créer un nouveau projet
1. Clique sur **"New Project"**
2. Sélectionne **"Deploy from GitHub repo"**
3. Choisis ton repository `r1x` (ou le nom de ton repo)
4. Railway va créer le projet

### Étape 3 : Ajouter un nouveau service
1. Dans le projet Railway, clique sur **"New Service"**
2. Sélectionne **"GitHub Repo"**
3. Choisis ton repository `r1x`
4. Railway va détecter automatiquement le projet

### Étape 4 : Configurer le Root Directory
1. Clique sur le service créé
2. Va dans l'onglet **"Settings"**
3. Scroll jusqu'à **"Root Directory"**
4. Définis : `x402-server`
5. Sauvegarde (Railway va redéployer automatiquement)

### Étape 5 : Configurer les variables d'environnement
1. Dans le service Railway, va dans l'onglet **"Variables"**
2. Clique sur **"New Variable"**
3. Ajoute chacune de ces variables :

```env
MERCHANT_ADDRESS=0x... # Ton adresse wallet merchant (Base network)
FACILITATOR_URL=https://facilitator.payai.network
NETWORK=base
CDP_API_KEY_ID=... # Coinbase Developer Platform API Key ID
CDP_API_KEY_SECRET=... # Coinbase Developer Platform API Key Secret  
ANTHROPIC_API_KEY=... # Pour r1x Agent chat
```

### Étape 6 : Configurer le Build Command
1. Dans **Settings** → **Build Command**
2. Remplace par : `npm install && npm run build`

### Étape 7 : Configurer le Start Command
1. Dans **Settings** → **Start Command**
2. Remplace par : `npm start`

### Étape 8 : Obtenir l'URL publique
1. Railway va automatiquement générer une URL publique
2. Va dans l'onglet **"Settings"** → **"Networking"**
3. Clique sur **"Generate Domain"** si pas déjà fait
4. Note l'URL (ex: `https://r1x-x402-server-production.up.railway.app`)

### Étape 9 : Vérifier le déploiement
1. Attends que le build soit terminé (green checkmark)
2. Teste avec : `curl https://ton-url-railway.app/health`
3. Devrait retourner :
```json
{
  "status": "ok",
  "server": "x402-express",
  "facilitator": "https://facilitator.payai.network",
  "merchant": "0x..."
}
```

### Étape 10 : Configurer Next.js pour utiliser le serveur Railway
1. Va dans Vercel → Settings → Environment Variables
2. Ajoute : `X402_SERVER_URL=https://ton-url-railway.app`
3. Modifie les routes Next.js pour appeler cette URL au lieu de `/api/r1x-agent/chat`

## ✅ Checklist de déploiement

- [ ] Compte Railway créé
- [ ] Projet Railway créé
- [ ] Service créé depuis GitHub repo
- [ ] Root Directory configuré à `x402-server`
- [ ] Variables d'environnement ajoutées (MERCHANT_ADDRESS, FACILITATOR_URL, NETWORK, CDP_API_KEY_ID, CDP_API_KEY_SECRET, ANTHROPIC_API_KEY)
- [ ] Build Command configuré : `npm install && npm run build`
- [ ] Start Command configuré : `npm start`
- [ ] URL publique générée et notée
- [ ] Health check réussi (`/health` endpoint)
- [ ] Variable `X402_SERVER_URL` ajoutée dans Vercel
- [ ] Routes Next.js modifiées pour utiliser l'URL Railway

## 🔍 Troubleshooting

**Problème : Build échoue**
- Vérifie que `x402-server/package.json` existe
- Vérifie que `tsconfig.json` existe
- Vérifie les logs Railway pour voir l'erreur exacte

**Problème : Variables d'environnement manquantes**
- Vérifie que toutes les variables sont dans Railway → Variables
- Vérifie l'orthographe exacte (case-sensitive)

**Problème : Serveur ne démarre pas**
- Vérifie les logs Railway
- Vérifie que `PORT` est bien utilisé (Railway le définit automatiquement)
- Vérifie que le serveur écoute sur `0.0.0.0` (pas `localhost`)

**Problème : Timeout ou erreur 502**
- Vérifie que le serveur écoute bien sur le port défini par Railway
- Vérifie les logs Railway pour voir les erreurs

## 📝 Notes

- Railway définit automatiquement `PORT` dans les variables d'environnement
- Le serveur doit écouter sur `0.0.0.0` pour être accessible depuis l'extérieur
- Railway peut prendre 2-5 minutes pour le premier déploiement
- Les builds suivants sont plus rapides (cache)

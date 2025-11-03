# Guide : Ajouter un domaine personnalisé à Railway

## 📋 Méthode 1 : Via l'interface Railway

### Étape 1 : Générer un domaine Railway (optionnel)
1. Va sur https://railway.app
2. Sélectionne ton projet
3. Clique sur le **service** (Next.js ou Express)
4. Va dans l'onglet **"Settings"**
5. Scroll jusqu'à **"Networking"**
6. Clique sur **"Generate Domain"** si pas déjà fait
7. Railway génère automatiquement une URL (ex: `r1x-production.up.railway.app`)

### Étape 2 : Ajouter un domaine personnalisé
1. Dans **Settings** → **Networking**, scroll jusqu'à **"Custom Domains"**
2. Clique sur **"Add Domain"**
3. Entre ton domaine (ex: `r1x.com` ou `www.r1x.com`)
4. Railway va te donner des instructions pour configurer le DNS

### Étape 3 : Configurer le DNS

**Option A : CNAME (recommandé pour sous-domaines)**
- Type : `CNAME`
- Name : `www` (ou `api`, `docs`, etc.)
- Value : `ton-service.up.railway.app` (le domaine Railway généré)
- TTL : `3600` (ou laisser par défaut)

**Option B : A Record (pour domaine racine)**
- Railway ne supporte pas directement les A records pour le domaine racine
- Utilise un CNAME avec `www` et redirige le domaine racine vers `www`

**Option C : ALIAS/ANAME (si supporté par ton registrar)**
- Type : `ALIAS` ou `ANAME`
- Name : `@` (pour domaine racine)
- Value : `ton-service.up.railway.app`
- TTL : `3600`

### Étape 4 : Vérifier le domaine
1. Railway vérifie automatiquement la configuration DNS
2. Tu verras un statut :
   - 🟡 **Pending** : DNS en cours de propagation
   - 🟢 **Active** : Domaine configuré et actif
   - 🔴 **Failed** : Erreur de configuration DNS

### Étape 5 : Attendre la propagation DNS
- Propagation DNS : 5 minutes à 48 heures (généralement < 1 heure)
- Tu peux vérifier avec : `nslookup www.ton-domaine.com` ou `dig www.ton-domaine.com`

---

## 📋 Méthode 2 : Via Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# Add custom domain
railway domain add www.ton-domaine.com
```

---

## 🔧 Configuration pour plusieurs services

Si tu as plusieurs services (Next.js + Express) :

### Pour Next.js (service principal)
- Domaine principal : `r1x.com` ou `www.r1x.com`
- CNAME : `www.r1x.com` → `ton-nextjs-service.up.railway.app`

### Pour Express x402 (sous-domaine)
- Sous-domaine : `api.r1x.com` ou `x402.r1x.com`
- CNAME : `api.r1x.com` → `ton-express-service.up.railway.app`

---

## 📝 Configuration DNS recommandée

Exemple pour `r1x.com` :

```
Type    Name    Value                           TTL
CNAME   www     r1x-production.up.railway.app    3600
CNAME   api     r1x-x402.up.railway.app         3600
CNAME   docs    r1x-production.up.railway.app   3600
```

Pour le domaine racine (`r1x.com` sans www), tu dois :
1. Configurer une redirection HTTP au niveau du registrar vers `www.r1x.com`
2. Ou utiliser un service comme Cloudflare avec Page Rules

---

## ✅ Vérification

Une fois configuré :
1. Va sur `https://www.ton-domaine.com`
2. Vérifie que le site charge correctement
3. Vérifie que les routes API fonctionnent
4. Vérifie le certificat SSL (Railway génère automatiquement un certificat Let's Encrypt)

---

## 🔒 SSL/TLS

Railway génère automatiquement un certificat SSL gratuit via Let's Encrypt :
- ✅ HTTPS activé automatiquement
- ✅ Renouvellement automatique
- ✅ Pas de configuration supplémentaire nécessaire

---

## ⚠️ Notes importantes

1. **Domaine racine** : Railway ne supporte pas directement les A records pour le domaine racine. Utilise `www` ou configure une redirection.

2. **Propagation DNS** : Peut prendre jusqu'à 48h, mais généralement < 1h.

3. **Variables d'environnement** : Après avoir ajouté le domaine, mets à jour `NEXT_PUBLIC_BASE_URL` dans Railway avec le nouveau domaine.

4. **Multiple services** : Tu peux avoir plusieurs domaines pointant vers différents services dans le même projet Railway.

---

## 🐛 Troubleshooting

**Problème : Domaine reste "Pending"**
- Vérifie que le CNAME pointe bien vers le domaine Railway
- Vérifie la propagation DNS : `nslookup www.ton-domaine.com`
- Attends quelques minutes, Railway vérifie périodiquement

**Problème : SSL non généré**
- Railway génère automatiquement le SSL après validation DNS
- Peut prendre jusqu'à 10 minutes après activation du domaine

**Problème : Redirection en boucle**
- Vérifie que tu n'as pas de redirection configurée au niveau du registrar
- Vérifie les variables d'environnement dans Railway


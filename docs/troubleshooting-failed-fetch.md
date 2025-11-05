# Guide : Résoudre "Failed to fetch" - PayAI/x402

## 🔍 Causes possibles

### 1. **CORS non configuré sur le serveur Express**
Le serveur Express doit autoriser les requêtes depuis le client Next.js.

### 2. **URL du serveur x402 incorrecte**
La variable `NEXT_PUBLIC_X402_SERVER_URL` doit être correctement configurée.

### 3. **Serveur Express non accessible**
Le serveur Express doit être démarré et accessible.

### 4. **Format de requête incorrect**
Le client doit utiliser le bon format selon la documentation PayAI.

---

## ✅ Solutions

### Solution 1 : Ajouter CORS au serveur Express

Le serveur Express doit autoriser les requêtes depuis le domaine Next.js.

**Dans `x402-server/index.ts`**, ajoute :

```typescript
import cors from 'cors';

// Avant app.use(express.json())
app.use(cors({
  origin: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Payment', 'Authorization'],
}));
```

### Solution 2 : Vérifier les variables d'environnement

**Sur Railway**, vérifie que ces variables sont définies :

**Service Next.js :**
- `NEXT_PUBLIC_X402_SERVER_URL=https://ton-x402-service.up.railway.app`

**Service Express x402 :**
- `PORT` (automatique)
- `FACILITATOR_URL=https://facilitator.payai.network`
- `MERCHANT_ADDRESS=0x...`
- `ANTHROPIC_API_KEY=sk-ant-...`

### Solution 3 : Utiliser x402-fetch (recommandé par PayAI)

Selon la documentation PayAI, il est recommandé d'utiliser `x402-fetch` côté client.

**Installation :**
```bash
npm install x402-fetch
```

**Utilisation dans `R1xAgentContent.tsx` :**
```typescript
import { wrapFetchWithPayment } from 'x402-fetch';

const x402Fetch = wrapFetchWithPayment(fetch, {
  network: 'base',
  // Wallet provider sera injecté automatiquement
});

// Puis utilise x402Fetch au lieu de fetch
const response = await x402Fetch(`${x402ServerUrl}/api/r1x-agent/chat`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: updatedMessages.map(msg => ({
      role: msg.role,
      content: msg.content,
    })),
  }),
});
```

### Solution 4 : Améliorer la gestion des erreurs

Ajoute des logs détaillés pour voir exactement ce qui se passe :

```typescript
const handleSend = async () => {
  // ... code existant ...
  
  try {
    const x402ServerUrl = getX402ServerUrl();
    console.log('[Agent] Calling x402 server:', x402ServerUrl);
    console.log('[Agent] Request body:', {
      messages: updatedMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    });
    
    const response = await fetch(`${x402ServerUrl}/api/r1x-agent/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: updatedMessages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      }),
    });
    
    console.log('[Agent] Response status:', response.status);
    console.log('[Agent] Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok && response.status !== 402) {
      const errorText = await response.text();
      console.error('[Agent] Error response:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    // ... reste du code ...
  } catch (err: any) {
    console.error('[Agent] Full error:', err);
    console.error('[Agent] Error name:', err.name);
    console.error('[Agent] Error message:', err.message);
    console.error('[Agent] Error stack:', err.stack);
    
    // Message d'erreur plus détaillé
    if (err.message.includes('Failed to fetch')) {
      setError(`Cannot connect to x402 server. Please check:\n1. Server is running\n2. NEXT_PUBLIC_X402_SERVER_URL is set correctly\n3. CORS is configured\n\nOriginal error: ${err.message}`);
    } else {
      setError(err.message || 'An error occurred');
    }
    // ... reste du code ...
  }
};
```

---

## 🧪 Tests à faire

### Test 1 : Vérifier que le serveur Express répond
```bash
curl https://ton-x402-service.up.railway.app/health
```

Devrait retourner :
```json
{
  "status": "ok",
  "server": "x402-express",
  "facilitator": "https://facilitator.payai.network",
  "merchant": "0x..."
}
```

### Test 2 : Vérifier CORS
```bash
curl -X OPTIONS https://ton-x402-service.up.railway.app/api/r1x-agent/chat \
  -H "Origin: https://ton-nextjs-service.up.railway.app" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

Devrait retourner des headers `Access-Control-Allow-Origin`.

### Test 3 : Tester une requête réelle
```bash
curl -X POST https://ton-x402-service.up.railway.app/api/r1x-agent/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'
```

Devrait retourner un HTTP 402 avec une quote de paiement.

---

## 🔧 Checklist de vérification

- [ ] CORS est configuré sur le serveur Express
- [ ] `NEXT_PUBLIC_X402_SERVER_URL` est défini dans Railway (Next.js service)
- [ ] Le serveur Express est déployé et accessible
- [ ] Le endpoint `/health` répond correctement
- [ ] Les variables d'environnement sont correctes dans Railway
- [ ] Les logs du serveur Express montrent les requêtes entrantes
- [ ] La console du navigateur montre les erreurs détaillées

---

## 📝 Prochaines étapes

1. **Ajouter CORS** au serveur Express (Solution 1)
2. **Vérifier les variables d'environnement** sur Railway (Solution 2)
3. **Ajouter des logs détaillés** pour debug (Solution 4)
4. **Optionnel : Migrer vers x402-fetch** pour une meilleure intégration (Solution 3)


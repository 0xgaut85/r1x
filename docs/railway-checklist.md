# Checklist de configuration Railway - r1x

## ✅ Variables configurées

### Service Next.js
- [x] `NEXT_PUBLIC_BASE_URL=https://www.r1xlabs.com`
- [x] `X402_SERVER_URL=https://api.r1xlabs.com` (for server-side proxy)
- [ ] ~~`NEXT_PUBLIC_X402_SERVER_URL`~~ (no longer needed - client uses Next.js API routes)
- [ ] `DATABASE_URL` (PostgreSQL Railway)
- [ ] `MERCHANT_ADDRESS=0x...`
- [ ] `FEE_RECIPIENT_ADDRESS=0x...`
- [ ] `PLATFORM_FEE_PERCENTAGE=5`
- [ ] `FACILITATOR_URL=https://facilitator.payai.network`
- [ ] `NETWORK=base`
- [ ] `CDP_API_KEY_ID=...`
- [ ] `CDP_API_KEY_SECRET=...`
- [ ] `ANTHROPIC_API_KEY=sk-ant-...`

### Service Express x402
- [ ] `FACILITATOR_URL=https://facilitator.payai.network`
- [ ] `NETWORK=base`
- [ ] `MERCHANT_ADDRESS=0x...` (même que Next.js)
- [ ] `CDP_API_KEY_ID=...`
- [ ] `CDP_API_KEY_SECRET=...`
- [ ] `ANTHROPIC_API_KEY=sk-ant-...`

---

## 🧪 Tests à faire

### 1. Vérifier que le serveur Express répond
```bash
curl https://api.r1xlabs.com/health
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

### 2. Vérifier les appels API
Ouvre la console du navigateur (F12) sur `https://www.r1xlabs.com` et teste l'agent :
- Les requêtes doivent aller vers `/api/r1x-agent/chat` (même origine, pas de CORS)
- Les logs `[Agent] Calling x402 server:` doivent afficher `/api/r1x-agent/chat`
- Pas d'erreurs CORS dans la console

### 3. Tester r1x Agent
1. Va sur `https://www.r1xlabs.com/r1x-agent`
2. Connecte ton wallet (Base network)
3. Envoie un message
4. Tu devrais recevoir une demande de paiement (0.25 USDC)
5. Après paiement, tu devrais recevoir une réponse de l'agent

---

## 🔍 Vérifier les logs Railway

### Service Express
Va dans Railway → Service Express → Logs et vérifie :
- `[x402-server] Chat request received:` quand tu envoies un message
- Pas d'erreurs CORS
- Pas d'erreurs de connexion PayAI

### Service Next.js
Va dans Railway → Service Next.js → Logs et vérifie :
- Les builds réussissent
- Pas d'erreurs de connexion à la DB
- Les routes API répondent correctement

---

## ⚠️ Si ça ne fonctionne pas

### Erreur "Failed to fetch" ou "Cannot connect to x402 server"
**Architecture:** Browser → Next.js API routes → Express server (proxy)

1. **Verify Next.js API route:**
   - Browser should call `/api/r1x-agent/chat` (same origin)
   - Check browser console - should see calls to `/api/r1x-agent/chat`
   - If calling `api.r1xlabs.com` directly, client code needs update

2. **Verify server-side proxy:**
   - Railway → Next.js Service → Variables
   - Set `X402_SERVER_URL=https://api.r1xlabs.com` (for server-side proxy)
   - Check Next.js logs for proxy forwarding

3. **Verify Express server:**
   - Railway → Express Service → Variables
   - Express server should be running
   - Test: `curl https://api.r1xlabs.com/health`

4. **No CORS needed:**
   - Browser calls Next.js (same origin)
   - Next.js calls Express (server-to-server)
   - CORS configuration not required

### Erreur "Payment verification failed"
1. Vérifie que `MERCHANT_ADDRESS` est bien configurée dans les deux services
2. Vérifie que `CDP_API_KEY_ID` et `CDP_API_KEY_SECRET` sont corrects
3. Vérifie que tu es sur le réseau Base (pas Base Sepolia)

### Le domaine ne répond pas
1. Vérifie la configuration DNS (CNAME `api` → URL Railway)
2. Attends la propagation DNS (peut prendre jusqu'à 1h)
3. Vérifie le statut du domaine dans Railway (doit être "Active")

---

## 📝 Prochaines étapes

1. **Redéployer les services** si tu as ajouté/modifié des variables
2. **Tester l'agent** pour vérifier que tout fonctionne
3. **Vérifier les logs** pour s'assurer qu'il n'y a pas d'erreurs


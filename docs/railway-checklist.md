# Checklist de configuration Railway - r1x

## ✅ Variables configurées

### Service Next.js
- [x] `NEXT_PUBLIC_BASE_URL=https://www.r1xlabs.com`
- [x] `NEXT_PUBLIC_X402_SERVER_URL=https://api.r1xlabs.com`
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

### 2. Vérifier CORS
Ouvre la console du navigateur (F12) sur `https://www.r1xlabs.com` et teste l'agent :
- Les requêtes vers `https://api.r1xlabs.com` ne doivent pas être bloquées par CORS
- Les logs `[Agent] Calling x402 server:` doivent afficher `https://api.r1xlabs.com`

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

### Erreur "Failed to fetch" ou "Cannot connect to x402 server (http://localhost:4021)"
**IMPORTANT:** Next.js `NEXT_PUBLIC_*` variables are embedded at BUILD TIME, not runtime!

1. **If you see `http://localhost:4021` in the error:**
   - This means `NEXT_PUBLIC_X402_SERVER_URL` wasn't set during Railway build
   - **Solution 1 (Recommended):** Set `NEXT_PUBLIC_X402_SERVER_URL=https://api.r1xlabs.com` BEFORE building, then redeploy
   - **Solution 2 (Fallback):** Set `X402_SERVER_URL=https://api.r1xlabs.com` - runtime config API will handle it automatically
   - See detailed guide: `docs/railway-env-var-build-time-fix.md`

2. **Verify env vars are set:**
   - Railway → Service → Variables
   - Both `NEXT_PUBLIC_X402_SERVER_URL` and `X402_SERVER_URL` should be set

3. **Check the domain:**
   - Verify `api.r1xlabs.com` is active on Railway (status "Active")
   - Test: `curl https://api.r1xlabs.com/health`

4. **Check CORS:**
   - Verify Railway logs for CORS errors
   - Express server should allow requests from `www.r1xlabs.com`

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


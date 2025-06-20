# Configuration des Variables d'Environnement

## Variables Requises

Pour que l'application fonctionne correctement, vous devez créer un fichier `.env` à la racine du projet avec les variables suivantes :

```env
VITE_API_URL=https://api-matching.harx.ai/api/
VITE_API_URL_GIGS=https://api-gigsmanual.harx.ai/api/gigs/
VITE_COMPANY_API_URL=https://api-company.harx.ai/api/
```

## Modifications Apportées

### 1. API (src/api/index.ts)
- Ajout de la fonction `getGigsByCompanyId` qui utilise l'endpoint spécifique pour récupérer les gigs d'une company
- Création d'une instance axios séparée (`gigsApi`) pour les appels vers l'API des gigs
- Utilisation de l'URL `VITE_API_URL_GIGS` pour les appels liés aux gigs

### 2. MatchingDashboard (src/components/MatchingDashboard.tsx)
- Modification de l'import pour inclure `getGigsByCompanyId`
- Ajout de la récupération du `companyId` depuis les cookies
- Vérification de la présence du `companyId` avant de faire les appels API
- Utilisation de `getGigsByCompanyId(companyId)` au lieu de `getGigs()`

### 3. Types (src/vite-env.d.ts)
- Ajout des définitions TypeScript pour les variables d'environnement

## Fonctionnement

L'application récupère maintenant uniquement les gigs appartenant à la company de l'utilisateur connecté :

1. Le `companyId` est récupéré depuis les cookies
2. Si le `companyId` n'est pas trouvé, un message d'erreur s'affiche
3. L'API fait un appel vers `/company/{companyId}` pour récupérer les gigs spécifiques
4. Seuls les gigs de cette company sont affichés dans l'interface

## Endpoint Utilisé

- **URL**: `https://api-gigsmanual.harx.ai/api/gigs/company/{companyId}`
- **Méthode**: GET
- **Paramètre**: `companyId` (récupéré depuis les cookies) 
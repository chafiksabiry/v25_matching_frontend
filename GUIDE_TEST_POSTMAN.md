# Guide de Test du Système de Matching HARX en Postman

## 🚀 Prérequis

1. **Démarrer le serveur :**
   ```bash
   cd server
   npm start
   ```
   Le serveur doit tourner sur `http://localhost:5010`

2. **Importer la collection Postman :**
   - Ouvrir Postman
   - Importer le fichier `HARX_Matching_API_Tests.postman_collection.json`

## 📋 Étapes de Test

### Étape 1 : Vérification du Serveur
**Request :** `GET http://localhost:5010/api/health`

**Réponse attendue :**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### Étape 2 : Récupération des Données de Base

#### 2.1 Récupérer tous les Reps
**Request :** `GET http://localhost:5010/api/reps`

**Réponse attendue :** Liste des reps avec leurs profils complets
```json
[
  {
    "_id": "...",
    "name": "Alex Johnson",
    "experience": 8,
    "skills": ["Cold Calling", "Sales Closing", "Negotiation"],
    "languages": ["English", "Spanish"],
    "conversionRate": 0.35,
    "rating": 4.8
  }
]
```

#### 2.2 Récupérer tous les Gigs
**Request :** `GET http://localhost:5010/api/gigs`

**Réponse attendue :** Liste des gigs avec leurs exigences
```json
[
  {
    "_id": "...",
    "title": "Enterprise SaaS Sales Campaign",
    "companyName": "TechNova Solutions",
    "requiredSkills": ["Cold Calling", "Sales Closing", "Product Demonstration"],
    "requiredExperience": 7
  }
]
```

### Étape 3 : Tests de Matching

#### 3.1 Trouver des Reps pour un Gig
**Request :** `POST http://localhost:5010/api/matches/gig/{gigId}/matches`

**Headers :**
```
Content-Type: application/json
```

**Body :**
```json
{
  "weights": {
    "experience": 0.15,
    "skills": 0.2,
    "industry": 0.15,
    "languages": 0.1,
    "availability": 0.1,
    "timezone": 0.05,
    "performance": 0.2,
    "region": 0.05
  },
  "limit": 10
}
```

**Réponse attendue :**
```json
{
  "matches": [
    {
      "agentId": "...",
      "agentInfo": {
        "name": "Alex Johnson",
        "email": "...",
        "languages": [...],
        "skills": {...}
      },
      "languageMatch": {
        "details": {
          "matchingLanguages": [...],
          "missingLanguages": [...],
          "insufficientLanguages": [...],
          "matchStatus": "perfect"
        }
      },
      "skillsMatch": {
        "details": {
          "matchingSkills": [...],
          "missingSkills": [...],
          "insufficientSkills": [...],
          "matchStatus": "partial"
        }
      },
      "matchStatus": "partial"
    }
  ],
  "totalMatches": 3,
  "perfectMatches": 1,
  "partialMatches": 2,
  "noMatches": 0
}
```

#### 3.2 Trouver des Gigs pour un Rep
**Request :** `POST http://localhost:5010/api/matches/rep/{repId}/gigs`

**Body :** (même structure que précédemment)

#### 3.3 Générer des Matchings Optimaux
**Request :** `POST http://localhost:5010/api/matches/optimize`

**Body :**
```json
{
  "weights": {
    "experience": 0.15,
    "skills": 0.2,
    "industry": 0.15,
    "languages": 0.1,
    "availability": 0.1,
    "timezone": 0.05,
    "performance": 0.2,
    "region": 0.05
  }
}
```

### Étape 4 : Tests avec Différents Poids

#### 4.1 Test avec Poids sur les Compétences
**Body :**
```json
{
  "weights": {
    "experience": 0.1,
    "skills": 0.4,
    "industry": 0.1,
    "languages": 0.1,
    "availability": 0.1,
    "timezone": 0.05,
    "performance": 0.1,
    "region": 0.05
  },
  "limit": 5
}
```

#### 4.2 Test avec Poids sur l'Expérience
**Body :**
```json
{
  "weights": {
    "experience": 0.4,
    "skills": 0.1,
    "industry": 0.1,
    "languages": 0.1,
    "availability": 0.1,
    "timezone": 0.05,
    "performance": 0.1,
    "region": 0.05
  },
  "limit": 5
}
```

## 🔍 Points de Vérification

### 1. **Validation des Réponses**
- ✅ Le serveur répond correctement
- ✅ Les données sont bien structurées
- ✅ Les IDs sont présents et valides
- ✅ Les scores de matching sont calculés

### 2. **Validation du Matching**
- ✅ Les reps avec les bonnes compétences sont prioritaires
- ✅ Les langues sont correctement évaluées
- ✅ Les scores varient selon les poids
- ✅ Les détails de matching sont fournis

### 3. **Validation des Statistiques**
- ✅ `totalMatches` correspond au nombre de résultats
- ✅ `perfectMatches` + `partialMatches` + `noMatches` = `totalMatches`
- ✅ Les statistiques par type (langues, compétences) sont cohérentes

## 🐛 Dépannage

### Erreur 404
- Vérifier que le serveur tourne sur le bon port
- Vérifier les IDs dans les URLs

### Erreur 500
- Vérifier les logs du serveur
- Vérifier la connexion MongoDB

### Pas de résultats
- Vérifier que les données sont bien chargées
- Vérifier les critères de matching

## 📊 Exemples de Tests Avancés

### Test avec Limite Personnalisée
```json
{
  "weights": {
    "experience": 0.15,
    "skills": 0.2,
    "industry": 0.15,
    "languages": 0.1,
    "availability": 0.1,
    "timezone": 0.05,
    "performance": 0.2,
    "region": 0.05
  },
  "limit": 3
}
```

### Test avec Poids Extrêmes
```json
{
  "weights": {
    "experience": 0.8,
    "skills": 0.1,
    "industry": 0.05,
    "languages": 0.02,
    "availability": 0.02,
    "timezone": 0.005,
    "performance": 0.005,
    "region": 0.005
  }
}
```

## 🎯 Conseils de Test

1. **Commencez par les tests de base** avant d'explorer les fonctionnalités avancées
2. **Notez les IDs** retournés pour les réutiliser dans les tests suivants
3. **Comparez les résultats** avec différents poids pour valider l'algorithme
4. **Vérifiez la cohérence** des statistiques retournées
5. **Testez les cas limites** (limite = 1, poids extrêmes, etc.)

## 📝 Notes Importantes

- Les données de test sont automatiquement chargées au démarrage du serveur
- Les poids doivent toujours totaliser 1.0 (100%)
- Le paramètre `limit` est optionnel (défaut: 10)
- Les réponses incluent des détails complets sur les matchings 
# Configuration d'availability.schedule pour le matching

## ✅ **État actuel : Frontend et Backend corrigés**

### **Frontend (React/TypeScript) ✅**

#### **1. Types configurés :**
- ✅ `MatchingWeights` contient `availability: number`
- ✅ `Gig` interface contient `availability.schedule`
- ✅ `AvailabilityMatch` interface créée
- ✅ `availabilityMatch` dans `Match`
- ✅ `availabilityStats` dans `MatchResponse`

#### **2. Poids par défaut :**
```typescript
const defaultMatchingWeights = {
  experience: 0.25,
  skills: 0.25,
  industry: 0.15,
  languages: 0.15,
  availability: 0.10,  // ✅ Inclus
  timezone: 0.10,
  activities: 0.10,
  region: 0.10
};
```

#### **3. API configurée :**
- ✅ `findMatchesForGig` envoie `weights` avec `availability`
- ✅ `findGigsForRep` envoie `weights` avec `availability`
- ✅ `generateOptimalMatches` envoie `weights` avec `availability`

#### **4. Interface utilisateur :**
- ✅ Colonne "Availability" dans le tableau des résultats
- ✅ Affichage du score d'availability et du statut
- ✅ Utilitaire `availabilityMatching.ts` créé

### **Backend (Base de données) ✅**

#### **1. Structure des données :**
```json
{
  "availability": {
    "schedule": [
      {
        "day": "Monday",
        "hours": {
          "start": "09:00",
          "end": "17:00"
        }
      },
      {
        "day": "Tuesday",
        "hours": {
          "start": "09:00",
          "end": "17:00"
        }
      }
    ],
    "timeZone": "UTC",
    "flexibility": ["flexible"]
  }
}
```

#### **2. Scripts de migration :**
- ✅ `migration_add_availability_schedule.js` - Ajoute availability.schedule aux gigs
- ✅ `migration_remove_schedule.js` - Supprime l'ancien champ schedule
- ✅ `verify_availability_setup.js` - Vérifie la configuration

## 🚀 **Instructions de déploiement**

### **1. Vérifier l'état actuel :**
```bash
node verify_availability_setup.js
```

### **2. Migrer les données si nécessaire :**
```bash
# Ajouter availability.schedule aux gigs existants
node migration_add_availability_schedule.js

# Supprimer l'ancien champ schedule (si pas déjà fait)
node migration_remove_schedule.js
```

### **3. Vérifier après migration :**
```bash
node verify_availability_setup.js
```

## 📊 **Fonctionnalités d'availability**

### **Comparaison des schedules :**
- Compare les jours et heures de disponibilité
- Calcule le pourcentage de chevauchement
- Détermine le statut : perfect_match, partial_match, no_match

### **Score de correspondance :**
- **Perfect match** : 80% ou plus de chevauchement
- **Partial match** : 50% ou plus de chevauchement  
- **No match** : moins de 50% de chevauchement

### **Affichage dans l'interface :**
- Nombre de jours correspondants
- Score de correspondance en pourcentage
- Statut visuel (vert/jaune/rouge)

## 🔧 **Structure des requêtes API**

### **Requête envoyée :**
```javascript
{
  weights: {
    experience: 0.25,
    skills: 0.25,
    industry: 0.15,
    languages: 0.15,
    availability: 0.10,  // ✅ Directement dans weights
    timezone: 0.10,
    activities: 0.10,
    region: 0.10
  }
}
```

### **Réponse attendue :**
```javascript
{
  preferedmatches: [...],
  availabilityStats: {
    perfectMatches: 5,
    partialMatches: 3,
    noMatches: 2,
    totalMatches: 10
  },
  // ... autres stats
}
```

## ✅ **Vérification finale**

Après le déploiement, vérifiez que :
- ✅ Les gigs ont des schedules d'availability définis
- ✅ Le matching d'availability fonctionne correctement
- ✅ L'interface affiche les informations d'availability
- ✅ Les scores de correspondance sont calculés correctement
- ✅ Les poids incluent `availability` dans `weights`

## 🎉 **Résultat**

Le système utilise maintenant `availability.schedule` pour le matching au lieu d'un champ `schedule` séparé. Tout est cohérent entre le frontend et le backend ! 
# Utilisation d'availability.schedule pour le matching

## 🔄 **Changements effectués**

### **Frontend (React/TypeScript)**

#### **1. Types ajoutés :**
- `DayOfWeek`, `TimeSlot`, `DaySchedule` types
- `AvailabilityMatch` interface
- `availabilityMatch` dans `Match`
- `availabilityStats` dans `MatchResponse`

#### **2. Interface Gig mise à jour :**
```typescript
// Ajout du champ schedule dans availability
availability?: {
  schedule?: Array<{ day: string; hours: { start: string; end: string } }>;
  time_zone?: string;
  timeZone?: string;
};
```

#### **3. Nouveau utilitaire créé :**
- `src/utils/availabilityMatching.ts` - Pour comparer les schedules d'availability

#### **4. API modifiée :**
- Le paramètre `availability` est inclus directement dans l'objet `weights`
- Les requêtes envoient simplement `weights` qui contient déjà `availability`

#### **5. Interface utilisateur mise à jour :**
- Nouvelle colonne "Availability" dans le tableau des résultats
- Affichage du score d'availability et du statut de correspondance

### **Backend (Base de données)**

#### **Structure des données :**
Les gigs peuvent maintenant avoir un champ `availability.schedule` avec la structure :
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

## 🚀 **Déploiement**

1. **Déployer les changements frontend**
2. **Mettre à jour les gigs existants avec availability.schedule**
3. **Tester les nouvelles fonctionnalités de matching**

## ✅ **Vérification**

Après le déploiement, vérifiez que :
- Les gigs ont des schedules d'availability définis
- Le matching d'availability fonctionne correctement
- L'interface affiche les informations d'availability
- Les scores de correspondance sont calculés correctement 
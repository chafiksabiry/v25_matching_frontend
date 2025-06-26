# GigAgent Integration

Cette fonctionnalité permet de créer automatiquement une assignation GigAgent dans la base de données quand vous envoyez un email de match.

## Fonctionnement

Quand vous cliquez sur le bouton "Send Email" dans le dashboard de matching, le système :

1. **Envoie l'email** à l'agent avec les détails du gig
2. **Crée une assignation GigAgent** dans la base de données avec :
   - Les IDs de l'agent et du gig
   - Le score de matching
   - Les détails de matching (langues, compétences, disponibilité)
   - Le statut initial "pending"

## Structure des données

### Modèle GigAgent

```javascript
{
  agentId: "680b63026204b8b9ba9f13ea",
  gigId: "685c0110614ab3e834e5174b",
  status: "pending", // pending, accepted, rejected, completed, cancelled
  matchScore: 0.75,
  matchDetails: {
    languageMatch: {
      score: 0.5,
      details: {
        matchingLanguages: [...],
        missingLanguages: [...],
        insufficientLanguages: [...],
        matchStatus: "partial_match"
      }
    },
    skillsMatch: {
      details: {
        matchingSkills: [...],
        missingSkills: [...],
        insufficientSkills: [...],
        matchStatus: "partial_match"
      }
    }
  },
  emailSent: true,
  emailSentAt: "2025-06-26T10:45:55.343Z",
  agentResponse: "pending",
  notes: "..."
}
```

## Endpoint utilisé

- **URL**: `POST /api/gig-agents`
- **Fonction**: `createGigAgent()` dans `src/api/index.ts`

## Utilisation dans le frontend

### 1. Import de la fonction

```typescript
import { createGigAgent } from "../api";
```

### 2. Fonction helper

```typescript
const handleSendEmailAndCreateGigAgent = async (match: Match, gig: Gig) => {
  try {
    // 1. Envoyer l'email
    await sendMatchEmail({
      agentName: match.agentInfo?.name || 'Agent',
      agentEmail: match.agentInfo?.email || '',
      gigTitle: gig.title,
      companyName: gig.companyName
    });
    
    // 2. Créer l'assignation GigAgent
    const gigAgentData = {
      agentId: match.repId,
      gigId: gig._id || '',
      matchScore: match.score || 0,
      matchDetails: {
        languageMatch: match.languageMatch ? {
          score: match.languageMatch.details?.matchStatus === 'perfect_match' ? 1 : 
                 match.languageMatch.details?.matchStatus === 'partial_match' ? 0.5 : 0,
          details: {
            matchingLanguages: match.languageMatch.details?.matchingLanguages || [],
            missingLanguages: match.languageMatch.details?.missingLanguages || [],
            insufficientLanguages: match.languageMatch.details?.insufficientLanguages || [],
            matchStatus: match.languageMatch.details?.matchStatus || 'no_match'
          }
        } : undefined,
        skillsMatch: match.skillsMatch ? {
          details: {
            matchingSkills: match.skillsMatch.details?.matchingSkills || [],
            missingSkills: match.skillsMatch.details?.missingSkills || [],
            insufficientSkills: match.skillsMatch.details?.insufficientSkills || [],
            matchStatus: match.skillsMatch.details?.matchStatus || 'no_match'
          }
        } : undefined
      }
    };
    
    const gigAgentResponse = await createGigAgent(gigAgentData);
    console.log('✅ GigAgent created:', gigAgentResponse.message);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};
```

### 3. Intégration dans les boutons

Le bouton "Send Email" dans le tableau et dans la modal utilise maintenant cette fonction :

```typescript
onClick={async (e) => {
  e.stopPropagation();
  try {
    if (selectedGig) {
      await handleSendEmailAndCreateGigAgent(match, selectedGig);
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
  }
}}
```

## Réponse du backend

Le backend retourne :

```json
{
  "message": "Assignation créée avec succès",
  "gigAgent": {
    "_id": "685d24e219416ecd34d6b266",
    "agentId": {...},
    "gigId": {...},
    "status": "pending",
    "matchScore": 0,
    "emailSent": true,
    "emailSentAt": "2025-06-26T10:45:55.343Z",
    "agentResponse": "pending",
    "createdAt": "2025-06-26T10:45:54.894Z",
    "updatedAt": "2025-06-26T10:45:55.344Z"
  },
  "emailSent": true,
  "matchScore": 0
}
```

## Gestion des erreurs

Le système gère les erreurs de manière robuste :

- **Erreur d'email** : Affiche un message d'erreur
- **Erreur de création GigAgent** : Affiche un message d'erreur
- **Données manquantes** : Utilise des valeurs par défaut
- **Console logging** : Pour le debugging

## Tests

Vous pouvez tester l'endpoint avec :

```bash
node test_gigagent_endpoint.js
```

Ce test utilise les données de test fournies :
- `agentId: "680b63026204b8b9ba9f13ea"`
- `gigId: "685c0110614ab3e834e5174b"`

## Avantages

1. **Traçabilité** : Chaque assignation est enregistrée avec un ID unique
2. **Suivi des statuts** : Possibilité de suivre l'évolution des assignations
3. **Données de matching** : Conservation des détails de matching pour analyse
4. **Historique** : Timestamps pour le suivi temporel
5. **Flexibilité** : Possibilité d'ajouter des notes et de modifier les statuts

## Prochaines étapes possibles

1. **Interface de gestion** : Dashboard pour gérer les assignations
2. **Notifications** : Alertes quand un agent répond
3. **Statistiques** : Métriques sur les assignations et réponses
4. **Workflow** : Processus automatisé de suivi des candidatures 
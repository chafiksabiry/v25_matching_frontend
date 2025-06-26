# Configuration Email - HARX Matching System

## Fonctionnalité d'Email

Le système HARX Matching inclut maintenant une fonctionnalité d'envoi d'email qui permet d'envoyer automatiquement des notifications aux agents lorsqu'un match est trouvé.

## Comment ça fonctionne

### 1. Bouton "Send Email" dans le tableau
- Cliquez sur le bouton "Send Email" dans le tableau des matches
- Cela ouvre automatiquement le client email par défaut avec :
  - Destinataire : email de l'agent
  - Sujet : "🎯 Match trouvé pour [Titre du poste] - HARX"
  - Corps : détails du match formatés

### 2. Bouton "Confirm Match" dans la modal
- Ouvrez les détails d'un match en cliquant sur une ligne
- Cliquez sur "Confirm Match" dans la modal
- Cela envoie également l'email de notification

## Fonctionnalités

### ✅ Ce qui est implémenté
- Ouverture automatique du client email par défaut
- Copie automatique des détails dans le presse-papiers
- Notification visuelle de succès
- Formatage professionnel de l'email
- Gestion des erreurs avec fallback

### 📧 Contenu de l'email
- Sujet personnalisé avec emoji
- Salutation personnalisée
- Détails du poste (titre, entreprise)
- Score de compatibilité (si disponible)
- Instructions pour les prochaines étapes
- Lien vers l'espace HARX
- Informations de contact

## Configuration

### Variables d'environnement (optionnel)
Si vous souhaitez utiliser AWS SES pour l'envoi automatique, ajoutez ces variables dans un fichier `.env` :

```env
VITE_AWS_REGION=eu-west-3
VITE_AWS_ACCESS_KEY_ID=your_access_key
VITE_AWS_SECRET_ACCESS_KEY=your_secret_key
VITE_AWS_SES_FROM_EMAIL=your_email@domain.com
```

### Configuration actuelle
Actuellement, le système utilise une approche hybride :
1. **Client email par défaut** : ouvre automatiquement le client email de l'utilisateur
2. **Presse-papiers** : copie les détails formatés
3. **Notification** : affiche une confirmation visuelle

## Utilisation

### Pour les utilisateurs
1. Sélectionnez un gig dans l'onglet "Match Reps to Gig"
2. Cliquez sur "Send Email" pour envoyer directement un email
3. Ou cliquez sur une ligne pour voir les détails, puis "Confirm Match"

### Pour les développeurs
Le service d'email est dans `src/api/emailService.ts` et peut être facilement modifié pour :
- Changer le format de l'email
- Ajouter d'autres services d'email
- Modifier les notifications

## Sécurité

- Les clés AWS ne sont jamais exposées dans le code client
- L'approche actuelle utilise le client email local de l'utilisateur
- Aucune donnée sensible n'est transmise à des services tiers

## Personnalisation

### Modifier le contenu de l'email
Éditez le fichier `src/api/emailService.ts` pour :
- Changer le template HTML
- Modifier le texte en clair
- Ajouter des informations supplémentaires

### Modifier les notifications
Les notifications sont créées dynamiquement avec CSS personnalisé dans le service d'email.

## Support

Pour toute question ou problème avec la fonctionnalité d'email, contactez l'équipe de développement HARX. 
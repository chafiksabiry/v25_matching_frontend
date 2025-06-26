# Configuration EmailJS pour HARX Matching System

## 🚀 Envoi Automatique d'Emails

Le système utilise maintenant EmailJS pour envoyer automatiquement des emails sans ouvrir Outlook ou d'autres clients email.

## 📋 Étapes de Configuration

### 1. Créer un compte EmailJS
1. Allez sur [EmailJS.com](https://www.emailjs.com/)
2. Créez un compte gratuit
3. Vérifiez votre email

### 2. Configurer un Service Email
1. Dans le dashboard EmailJS, allez dans "Email Services"
2. Cliquez sur "Add New Service"
3. Choisissez votre fournisseur d'email (Gmail, Outlook, etc.)
4. Connectez votre compte email
5. Notez le **Service ID** (ex: `service_abc123`)

### 3. Créer un Template Email
1. Allez dans "Email Templates"
2. Cliquez sur "Create New Template"
3. Utilisez ce template HTML :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Match HARX</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .highlight { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Match HARX Trouvé!</h1>
            <p>Félicitations {{to_name}}!</p>
        </div>
        <div class="content">
            <h2>Un nouveau match vous attend!</h2>
            
            <div class="highlight">
                <h3>📋 Détails du poste:</h3>
                <p><strong>Titre:</strong> {{gig_title}}</p>
                <p><strong>Entreprise:</strong> {{company_name}}</p>
                <p><strong>Score de compatibilité:</strong> {{match_score}}</p>
            </div>
            
            <p>Notre système d'IA a identifié que votre profil correspond parfaitement à cette opportunité!</p>
            
            <p><strong>Prochaines étapes:</strong></p>
            <ul>
                <li>Connectez-vous à votre espace HARX</li>
                <li>Consultez les détails complets du poste</li>
                <li>Postulez en quelques clics</li>
            </ul>
            
            <div style="text-align: center;">
                <a href="{{harx_link}}" class="button">Voir le match</a>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
                Si vous avez des questions, n'hésitez pas à nous contacter à <a href="mailto:support@harx.ai">support@harx.ai</a>
            </p>
        </div>
        <div class="footer">
            <p>© 2025 HARX. Tous droits réservés.</p>
            <p>Cet email a été envoyé automatiquement par le système HARX.</p>
        </div>
    </div>
</body>
</html>
```

4. Configurez les variables :
   - `{{to_name}}` - Nom de l'agent
   - `{{to_email}}` - Email de l'agent
   - `{{gig_title}}` - Titre du poste
   - `{{company_name}}` - Nom de l'entreprise
   - `{{match_score}}` - Score de compatibilité
   - `{{harx_link}}` - Lien vers HARX

5. Notez le **Template ID** (ex: `template_xyz789`)

### 4. Obtenir la Clé Publique
1. Allez dans "Account" > "API Keys"
2. Copiez votre **Public Key**

### 5. Configurer les Variables d'Environnement
Créez un fichier `.env` avec :

```env
VITE_EMAILJS_SERVICE_ID=service_votre_service_id
VITE_EMAILJS_TEMPLATE_ID=template_votre_template_id
VITE_EMAILJS_PUBLIC_KEY=votre_public_key
```

## ✅ Test de la Configuration

1. Lancez l'application : `npm run dev`
2. Sélectionnez un gig
3. Cliquez sur "Send Email"
4. Vous devriez voir une notification verte "Email envoyé!"

## 🔧 Dépannage

### Erreur "Service not found"
- Vérifiez que le Service ID est correct
- Assurez-vous que le service est bien connecté

### Erreur "Template not found"
- Vérifiez que le Template ID est correct
- Assurez-vous que le template est publié

### Erreur "Invalid public key"
- Vérifiez que la clé publique est correcte
- Assurez-vous qu'elle n'a pas d'espaces en trop

## 📧 Plan Gratuit EmailJS

- **100 emails/mois** gratuitement
- **Templates illimités**
- **Support email**

## 🚀 Alternative : Service Email Personnalisé

Si vous préférez utiliser votre propre service d'email, vous pouvez modifier `src/api/emailService.ts` pour utiliser :
- SendGrid
- Mailgun
- AWS SES (avec backend)
- Votre propre API

## 📞 Support

Pour toute question sur la configuration EmailJS, consultez leur [documentation officielle](https://www.emailjs.com/docs/). 
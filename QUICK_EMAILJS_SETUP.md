# 🚀 Configuration Rapide EmailJS - HARX

## ⚡ Étapes Express (5 minutes)

### 1. Créer un compte EmailJS
- Allez sur [EmailJS.com](https://www.emailjs.com/)
- Cliquez "Sign Up" (gratuit)
- Vérifiez votre email

### 2. Configurer un Service Email
1. Dashboard → "Email Services"
2. "Add New Service"
3. Choisissez **Gmail** (recommandé)
4. Connectez votre compte Gmail
5. **Copiez le Service ID** (ex: `service_abc123`)

### 3. Créer le Template
1. Dashboard → "Email Templates"
2. "Create New Template"
3. **Nom**: `HARX Match Notification`
4. **HTML** (copiez-collez ceci):

```html
<!DOCTYPE html>
<html>
<head>
    <title>Match HARX</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .highlight { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; }
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
                Si vous avez des questions, contactez-nous à <a href="mailto:support@harx.ai">support@harx.ai</a>
            </p>
        </div>
    </div>
</body>
</html>
```

5. **Variables à configurer**:
   - `{{to_name}}` - Nom de l'agent
   - `{{to_email}}` - Email de l'agent
   - `{{gig_title}}` - Titre du poste
   - `{{company_name}}` - Nom de l'entreprise
   - `{{match_score}}` - Score de compatibilité
   - `{{harx_link}}` - Lien vers HARX

6. **Copiez le Template ID** (ex: `template_xyz789`)

### 4. Obtenir la Clé Publique
1. Dashboard → "Account" → "API Keys"
2. **Copiez la Public Key** (ex: `user_abc123`)

### 5. Mettre à jour le code
Remplacez dans `src/api/emailService.ts`:

```typescript
const EMAILJS_SERVICE_ID = 'VOTRE_SERVICE_ID'; // Remplacez par votre vrai Service ID
const EMAILJS_TEMPLATE_ID = 'VOTRE_TEMPLATE_ID'; // Remplacez par votre vrai Template ID
const EMAILJS_PUBLIC_KEY = 'VOTRE_PUBLIC_KEY'; // Remplacez par votre vraie Public Key
```

## ✅ Test

1. Lancez l'app: `npm run dev`
2. Sélectionnez un gig
3. Cliquez "Send Email"
4. Vérifiez votre boîte email!

## 🔧 Dépannage

### Erreur "Service not found"
- Vérifiez le Service ID
- Assurez-vous que le service est connecté

### Erreur "Template not found"
- Vérifiez le Template ID
- Assurez-vous que le template est publié

### Erreur "Invalid public key"
- Vérifiez la Public Key
- Pas d'espaces en trop

## 📧 Plan Gratuit

- **100 emails/mois** gratuitement
- **Templates illimités**
- **Support email**

## 🆘 Besoin d'aide?

1. Vérifiez la console du navigateur pour les erreurs
2. Consultez la [doc EmailJS](https://www.emailjs.com/docs/)
3. Contactez l'équipe HARX 
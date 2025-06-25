# 🚀 Configuration EmailJS Simple (Sans Template)

## ⚡ Configuration Express (3 minutes)

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

### 3. Obtenir la Clé Publique
1. Dashboard → "Account" → "API Keys"
2. **Copiez la Public Key** (ex: `user_abc123`)

### 4. Mettre à jour le code
Remplacez dans `src/api/emailService.ts`:

```typescript
const EMAILJS_SERVICE_ID = 'VOTRE_SERVICE_ID'; // Remplacez par votre vrai Service ID
const EMAILJS_PUBLIC_KEY = 'VOTRE_PUBLIC_KEY'; // Remplacez par votre vraie Public Key
```

## ✅ C'est tout !

- **Pas de template à créer**
- **Pas de variables à configurer**
- **Email HTML intégré dans le code**
- **Envoi automatique immédiat**

## 🎯 Test

1. Lancez l'app: `npm run dev`
2. Sélectionnez un gig
3. Cliquez "Send Email"
4. Vérifiez votre boîte email!

## 📧 Email envoyé

L'email contiendra :
- ✅ Sujet personnalisé
- ✅ Salutation avec le nom
- ✅ Détails du poste
- ✅ Design professionnel
- ✅ Bouton d'action
- ✅ Informations de contact

## 🔧 Dépannage

### Erreur "Service not found"
- Vérifiez le Service ID
- Assurez-vous que le service est connecté

### Erreur "Invalid public key"
- Vérifiez la Public Key
- Pas d'espaces en trop

## 📧 Plan Gratuit

- **100 emails/mois** gratuitement
- **Pas de limite de templates**
- **Support email**

## 🆘 Besoin d'aide?

1. Vérifiez la console du navigateur
2. Consultez la [doc EmailJS](https://www.emailjs.com/docs/)
3. Contactez l'équipe HARX 
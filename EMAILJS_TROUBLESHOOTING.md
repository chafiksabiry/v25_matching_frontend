# 🔧 Dépannage EmailJS - HARX

## 🚨 Problème actuel
**Symptôme**: EmailJS retourne status 200 (succès) mais l'email n'arrive pas dans la boîte de réception.

## 🔍 Diagnostic étape par étape

### 1. **Vérifier la configuration EmailJS**

Votre configuration actuelle dans le Dockerfile :
```env
VITE_EMAILJS_SERVICE_ID=service_q5vmvim
VITE_EMAILJS_PUBLIC_KEY=3KIMbHKKVndyYWuK3
VITE_EMAILJS_TEMPLATE_ID=template_jfhd1ri
```

### 2. **Causes possibles du problème**

#### A. **Service Email non connecté**
- Le service EmailJS peut être déconnecté
- Le compte email lié au service peut avoir des problèmes

#### B. **Template mal configuré**
- Les variables du template ne correspondent pas
- Le template n'est pas publié

#### C. **Limite du plan gratuit**
- EmailJS gratuit = 100 emails/mois
- Vous avez peut-être dépassé la limite

#### D. **Email dans les spams**
- L'email arrive mais est classé comme spam
- Vérifiez le dossier spam/junk

### 3. **Solutions à tester**

#### ✅ **Solution 1: Vérifier le dashboard EmailJS**
1. Allez sur [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Connectez-vous à votre compte
3. Vérifiez :
   - **Email Services** → Service `service_q5vmvim` est connecté
   - **Email Templates** → Template `template_jfhd1ri` est publié
   - **Account** → Pas de limite dépassée

#### ✅ **Solution 2: Tester avec un email simple**
Modifiez temporairement le code pour envoyer un email simple :

```typescript
// Dans src/api/emailService.ts, remplacez les paramètres par :
const templateParams = {
  to_email: matchData.agentEmail,
  to_name: matchData.agentName,
  subject: 'Test HARX',
  message: 'Test simple'
};
```

#### ✅ **Solution 3: Vérifier les spams**
1. Vérifiez le dossier **Spam/Junk** dans `elhoucine.qara@harx.ai`
2. Ajoutez `noreply@harx.ai` aux contacts autorisés
3. Marquez l'email comme "Non spam" si trouvé

#### ✅ **Solution 4: Tester avec un autre email**
Testez avec un autre email pour voir si le problème est spécifique :
```typescript
const testEmail = 'votre-email-test@gmail.com';
```

### 4. **Test rapide**

Créez un fichier `test_email.html` et ouvrez-le dans le navigateur :

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
</head>
<body>
    <button onclick="testEmail()">Test Email</button>
    <script>
        emailjs.init('3KIMbHKKVndyYWuK3');
        
        function testEmail() {
            emailjs.send('service_q5vmvim', 'template_jfhd1ri', {
                to_email: 'elhoucine.qara@harx.ai',
                to_name: 'Test',
                subject: 'Test HARX',
                message: 'Test simple'
            }).then(
                function(response) {
                    alert('Succès: ' + response.status);
                },
                function(error) {
                    alert('Erreur: ' + error);
                }
            );
        }
    </script>
</body>
</html>
```

### 5. **Alternative: Utiliser le fallback**

Si EmailJS ne fonctionne pas, le système utilise automatiquement le fallback :
- Ouvre le client email par défaut
- Copie le contenu dans le presse-papiers

### 6. **Configuration recommandée**

Pour un service plus fiable, considérez :
- **SendGrid** (100 emails/jour gratuit)
- **Mailgun** (5000 emails/mois gratuit)
- **AWS SES** (déjà configuré dans votre Dockerfile)

## 🆘 **Prochaines étapes**

1. **Vérifiez le dashboard EmailJS** (priorité 1)
2. **Testez avec le fichier HTML** (priorité 2)
3. **Vérifiez les spams** (priorité 3)
4. **Contactez le support EmailJS** si nécessaire

## 📞 **Support**

- **EmailJS Support**: [support@emailjs.com](mailto:support@emailjs.com)
- **Documentation**: [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
- **Dashboard**: [https://dashboard.emailjs.com/](https://dashboard.emailjs.com/)

---

**Note**: Le système HARX a un fallback automatique qui ouvre le client email local si EmailJS échoue, donc l'envoi d'email fonctionne toujours. 
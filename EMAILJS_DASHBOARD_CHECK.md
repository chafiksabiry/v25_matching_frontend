# 🔧 Vérification Dashboard EmailJS - HARX

## 🎯 **Configuration actuelle**
- **Service ID**: `service_q5vmvim`
- **Template ID**: `template_jfhd1ri`
- **Public Key**: `3KIMbHKKVndyYWuK3`

## 📋 **Étapes de vérification**

### 1. **Accéder au dashboard**
Allez sur : [https://dashboard.emailjs.com/](https://dashboard.emailjs.com/)

### 2. **Vérifier le service email**
1. Cliquez sur **"Email Services"** dans le menu
2. Cherchez le service `service_q5vmvim`
3. **Vérifiez** :
   - ✅ Le service est **connecté** (icône verte)
   - ✅ Le compte email est **actif**
   - ✅ Pas d'erreur de connexion

### 3. **Vérifier le template**
1. Cliquez sur **"Email Templates"** dans le menu
2. Cherchez le template `template_jfhd1ri`
3. **Vérifiez** :
   - ✅ Le template est **publié** (statut "Published")
   - ✅ Les variables correspondent :
     - `{{to_email}}`
     - `{{to_name}}`
     - `{{subject}}`
     - `{{message}}`
     - `{{from_name}}`
     - `{{from_email}}`

### 4. **Vérifier les limites**
1. Cliquez sur **"Account"** dans le menu
2. **Vérifiez** :
   - ✅ Pas de limite dépassée
   - ✅ Plan actif (Free = 100 emails/mois)

### 5. **Vérifier les logs**
1. Cliquez sur **"Activity"** dans le menu
2. **Cherchez** les emails récents envoyés à `elhoucine.qara@harx.ai`
3. **Vérifiez** le statut de livraison

## 🚨 **Problèmes courants**

### **Service déconnecté**
- **Symptôme** : Service avec icône rouge
- **Solution** : Reconnecter le service email

### **Template non publié**
- **Symptôme** : Template avec statut "Draft"
- **Solution** : Publier le template

### **Limite dépassée**
- **Symptôme** : Message d'erreur de limite
- **Solution** : Passer au plan payant ou attendre le mois suivant

### **Variables manquantes**
- **Symptôme** : Email envoyé mais contenu vide
- **Solution** : Vérifier les variables dans le template

## ✅ **Actions à faire**

1. **Si service déconnecté** : Reconnecter le service
2. **Si template non publié** : Publier le template
3. **Si limite dépassée** : Passer au plan payant
4. **Si tout OK** : Vérifier les spams (voir `CHECK_SPAM_GUIDE.md`)

## 📞 **Support EmailJS**

- **Email** : support@emailjs.com
- **Documentation** : [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
- **Community** : [https://community.emailjs.com/](https://community.emailjs.com/)

---

**Rappel** : EmailJS fonctionne (status 200), le problème est probablement dans la livraison ou les spams. 
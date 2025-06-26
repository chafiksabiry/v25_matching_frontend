import emailjs from '@emailjs/browser';

interface MatchEmailData {
  agentName: string;
  agentEmail: string;
  gigTitle: string;
  companyName: string;
  matchScore?: number;
}

export const sendMatchEmail = async (matchData: MatchEmailData): Promise<boolean> => {
  try {
    // Configuration EmailJS depuis les variables d'environnement
    const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_harx_email';
    const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'user_harx_public_key';
    const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

    // Vérifier que les clés sont configurées
    if (!EMAILJS_SERVICE_ID || EMAILJS_SERVICE_ID === 'service_harx_email') {
      throw new Error('VITE_EMAILJS_SERVICE_ID non configuré');
    }
    if (!EMAILJS_PUBLIC_KEY || EMAILJS_PUBLIC_KEY === 'user_harx_public_key') {
      throw new Error('VITE_EMAILJS_PUBLIC_KEY non configuré');
    }

    // Créer le contenu de l'email avec des en-têtes optimisés pour Outlook
    const emailSubject = `🎯 Match trouvé pour "${matchData.gigTitle}" - HARX`;
    const emailBody = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Match HARX</title>
        <!--[if mso]>
        <noscript>
          <xml>
            <o:OfficeDocumentSettings>
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
        </noscript>
        <![endif]-->
        <style>
          /* Reset pour Outlook */
          body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
          
          /* Styles principaux */
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
          }
          .content { 
            background: #ffffff; 
            padding: 30px; 
          }
          .button { 
            display: inline-block; 
            background: #667eea; 
            color: white !important; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0; 
            font-weight: bold;
          }
          .highlight { 
            background: #e3f2fd; 
            padding: 15px; 
            border-radius: 5px; 
            margin: 15px 0; 
            border-left: 4px solid #667eea;
          }
          .footer { 
            text-align: center; 
            margin-top: 30px; 
            color: #666; 
            font-size: 12px; 
            background: #f8f9fa;
            padding: 20px;
          }
          .email-info {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🎯 Match HARX Trouvé!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Félicitations ${matchData.agentName}!</p>
          </div>
          <div class="content">
            <h2 style="color: #333; margin-top: 0;">Un nouveau match vous attend!</h2>
            
            <div class="highlight">
              <h3 style="margin-top: 0; color: #667eea;">📋 Détails du poste:</h3>
              <p><strong>Titre:</strong> ${matchData.gigTitle}</p>
              <p><strong>Entreprise:</strong> ${matchData.companyName || 'HARX'}</p>
              ${matchData.matchScore ? `<p><strong>Score de compatibilité:</strong> ${Math.round(matchData.matchScore * 100)}%</p>` : ''}
            </div>
            
            <p>Notre système d'IA a identifié que votre profil correspond parfaitement à cette opportunité!</p>
            
            <p><strong>Prochaines étapes:</strong></p>
            <ul>
              <li>Connectez-vous à votre espace HARX</li>
              <li>Consultez les détails complets du poste</li>
              <li>Postulez en quelques clics</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${window.location.origin}/app11" class="button">Voir le match</a>
            </div>
            
            <div class="email-info">
              <p style="margin: 0;">
                <strong>💡 Conseil:</strong> Si vous ne voyez pas cet email dans votre boîte de réception, 
                vérifiez votre dossier spam/indésirable et ajoutez <strong>noreply@harx.ai</strong> à vos contacts.
              </p>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              Si vous avez des questions, n'hésitez pas à nous contacter à <a href="mailto:support@harx.ai" style="color: #667eea;">support@harx.ai</a>
            </p>
          </div>
          <div class="footer">
            <p style="margin: 0;">© 2025 HARX. Tous droits réservés.</p>
            <p style="margin: 5px 0 0 0;">Cet email a été envoyé automatiquement par le système HARX.</p>
            <p style="margin: 5px 0 0 0; font-size: 11px;">
              Pour vous désabonner, cliquez <a href="mailto:support@harx.ai?subject=Désabonnement" style="color: #667eea;">ici</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log('📧 Envoi d\'email avec EmailJS:', {
      serviceId: EMAILJS_SERVICE_ID,
      templateId: EMAILJS_TEMPLATE_ID || 'template_default',
      to: matchData.agentEmail,
      subject: emailSubject,
      isOutlook: matchData.agentEmail.toLowerCase().includes('outlook') || matchData.agentEmail.toLowerCase().includes('hotmail') || matchData.agentEmail.toLowerCase().includes('live')
    });

    // Essayer d'abord avec EmailJS si un template est configuré
    if (EMAILJS_TEMPLATE_ID) {
      try {
        // Paramètres optimisés pour Outlook
        const templateParams = {
          to_email: matchData.agentEmail,
          to_name: matchData.agentName,
          subject: emailSubject,
          message: emailBody,
          from_name: 'HARX Team',
          from_email: 'noreply@harx.ai',
          reply_to: 'support@harx.ai',
          // Paramètres spécifiques pour améliorer la délivrabilité
          email_type: 'html',
          priority: 'high',
          // Ajouter des en-têtes personnalisés pour Outlook
          custom_headers: JSON.stringify({
            'X-Mailer': 'HARX Matching System',
            'X-Priority': '1',
            'X-MSMail-Priority': 'High',
            'Importance': 'High',
            'X-Report-Abuse': 'Please report abuse here: support@harx.ai'
          })
        };

        console.log('🔧 Configuration EmailJS optimisée pour Outlook:', {
          serviceId: EMAILJS_SERVICE_ID,
          templateId: EMAILJS_TEMPLATE_ID,
          publicKey: EMAILJS_PUBLIC_KEY,
          templateParams: {
            ...templateParams,
            message: '... (contenu HTML)'
          }
        });

        const response = await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          templateParams,
          EMAILJS_PUBLIC_KEY
        );
        
        console.log('✅ Email envoyé avec succès via EmailJS:', response);
        console.log('📧 Détails de la réponse:', {
          status: response.status,
          text: response.text,
          recipient: matchData.agentEmail
        });
        
        // Afficher des conseils spécifiques pour Outlook
        if (matchData.agentEmail.toLowerCase().includes('outlook') || 
            matchData.agentEmail.toLowerCase().includes('hotmail') || 
            matchData.agentEmail.toLowerCase().includes('live')) {
          showOutlookNotification(matchData);
        } else {
          showSuccessNotification(matchData);
        }
        
        return true;
      } catch (emailjsError) {
        console.error('❌ Erreur EmailJS détaillée:', {
          error: emailjsError,
          message: emailjsError instanceof Error ? emailjsError.message : 'Erreur inconnue',
          stack: emailjsError instanceof Error ? emailjsError.stack : undefined,
          recipient: matchData.agentEmail
        });
        console.warn('⚠️ EmailJS a échoué, utilisation du fallback:', emailjsError);
        // Continuer avec le fallback
      }
    }

    // Fallback: Utiliser le client email par défaut du navigateur
    const mailtoLink = `mailto:${matchData.agentEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoLink, '_blank');

    // Copier le contenu dans le presse-papiers
    const textContent = `
🎯 Match HARX Trouvé!

Félicitations ${matchData.agentName}!

Un nouveau match vous attend!

📋 Détails du poste:
- Titre: ${matchData.gigTitle}
- Entreprise: ${matchData.companyName || 'HARX'}
${matchData.matchScore ? `- Score de compatibilité: ${Math.round(matchData.matchScore * 100)}%` : ''}

Notre système d'IA a identifié que votre profil correspond parfaitement à cette opportunité!

Prochaines étapes:
• Connectez-vous à votre espace HARX
• Consultez les détails complets du poste
• Postulez en quelques clics

Lien: ${window.location.origin}/app11

Si vous avez des questions, contactez-nous à support@harx.ai

© 2025 HARX. Tous droits réservés.
    `.trim();

    await navigator.clipboard.writeText(textContent);
    
    console.log('✅ Fallback email activé - client email ouvert et contenu copié');
    showSuccessNotification(matchData, true);
    return true;

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    showErrorNotification();
    return false;
  }
};

// Fonction spécifique pour les notifications Outlook
const showOutlookNotification = (matchData: MatchEmailData) => {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #0078d4 0%, #106ebe 100%);
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: Arial, sans-serif;
    max-width: 400px;
    animation: slideIn 0.3s ease-out;
  `;
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="font-size: 24px;">📧</div>
      <div>
        <div style="font-weight: bold; margin-bottom: 4px;">
          Email envoyé! (Outlook détecté)
        </div>
        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">
          Destinataire: ${matchData.agentEmail}
        </div>
        <div style="font-size: 12px; opacity: 0.8; margin-bottom: 8px;">
          Match: ${matchData.gigTitle} chez ${matchData.companyName || 'HARX'}
        </div>
        <div style="font-size: 11px; opacity: 0.7; background: rgba(255,255,255,0.1); padding: 8px; border-radius: 4px;">
          💡 <strong>Conseil Outlook:</strong> Vérifiez votre dossier "Courrier indésirable" si l'email n'apparaît pas dans la boîte de réception.
        </div>
      </div>
    </div>
  `;

  // Ajouter l'animation CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(notification);

  // Supprimer la notification après 8 secondes (plus long pour Outlook)
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 8000);
};

// Fonction pour afficher la notification de succès
const showSuccessNotification = (matchData: MatchEmailData, isFallback = false) => {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: Arial, sans-serif;
    max-width: 350px;
    animation: slideIn 0.3s ease-out;
  `;
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="font-size: 24px;">✅</div>
      <div>
        <div style="font-weight: bold; margin-bottom: 4px;">
          ${isFallback ? 'Client email ouvert!' : 'Email envoyé avec succès!'}
        </div>
        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">
          Destinataire: ${matchData.agentEmail}
        </div>
        <div style="font-size: 12px; opacity: 0.8;">
          Match: ${matchData.gigTitle} chez ${matchData.companyName || 'HARX'}
        </div>
        ${isFallback ? '<div style="font-size: 11px; opacity: 0.7; margin-top: 4px;">Contenu copié dans le presse-papiers</div>' : ''}
      </div>
    </div>
  `;

  // Ajouter l'animation CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(notification);

  // Supprimer la notification après 6 secondes
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 6000);
};

// Fonction pour afficher la notification d'erreur
const showErrorNotification = () => {
  const errorNotification = document.createElement('div');
  errorNotification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: Arial, sans-serif;
    max-width: 350px;
    animation: slideIn 0.3s ease-out;
  `;
  
  errorNotification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="font-size: 24px;">❌</div>
      <div>
        <div style="font-weight: bold; margin-bottom: 4px;">Erreur d'envoi</div>
        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">
          Impossible d'envoyer l'email
        </div>
        <div style="font-size: 12px; opacity: 0.8;">
          Vérifiez la configuration EmailJS
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(errorNotification);

  setTimeout(() => {
    if (errorNotification.parentNode) {
      errorNotification.parentNode.removeChild(errorNotification);
    }
  }, 5000);
}; 
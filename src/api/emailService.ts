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

    // Vérifier que les clés sont configurées
    if (!EMAILJS_SERVICE_ID || EMAILJS_SERVICE_ID === 'service_harx_email') {
      throw new Error('VITE_EMAILJS_SERVICE_ID non configuré');
    }
    if (!EMAILJS_PUBLIC_KEY || EMAILJS_PUBLIC_KEY === 'user_harx_public_key') {
      throw new Error('VITE_EMAILJS_PUBLIC_KEY non configuré');
    }

    // Créer le contenu de l'email directement
    const emailSubject = `🎯 Match trouvé pour "${matchData.gigTitle}" - HARX`;
    const emailBody = `
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
            <p>Félicitations ${matchData.agentName}!</p>
          </div>
          <div class="content">
            <h2>Un nouveau match vous attend!</h2>
            
            <div class="highlight">
              <h3>📋 Détails du poste:</h3>
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
    `;

    // Paramètres pour l'envoi direct
    const templateParams = {
      to_email: matchData.agentEmail,
      to_name: matchData.agentName,
      subject: emailSubject,
      message: emailBody,
      from_name: 'HARX Team',
      from_email: 'noreply@harx.ai'
    };

    console.log('📧 Envoi d\'email avec EmailJS:', {
      serviceId: EMAILJS_SERVICE_ID,
      to: matchData.agentEmail,
      subject: emailSubject
    });

    // Envoi avec EmailJS (sans template)
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      'template_default', // Template par défaut d'EmailJS
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log('✅ Email envoyé avec succès:', response);

    // Afficher une notification de succès
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
          <div style="font-weight: bold; margin-bottom: 4px;">Email envoyé avec succès!</div>
          <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">
            Destinataire: ${matchData.agentEmail}
          </div>
          <div style="font-size: 12px; opacity: 0.8;">
            Match: ${matchData.gigTitle} chez ${matchData.companyName || 'HARX'}
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

    // Supprimer la notification après 6 secondes
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 6000);

    return true;

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    
    // Afficher une notification d'erreur
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
    
    return false;
  }
}; 
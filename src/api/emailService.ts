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
    // Configuration EmailJS - Remplacez par vos vraies clés
    const EMAILJS_SERVICE_ID = 'service_harx_email'; // Remplacez par votre Service ID
    const EMAILJS_TEMPLATE_ID = 'template_harx_match'; // Remplacez par votre Template ID
    const EMAILJS_PUBLIC_KEY = 'user_harx_public_key'; // Remplacez par votre Public Key

    // Paramètres pour l'email
    const templateParams = {
      to_email: matchData.agentEmail,
      to_name: matchData.agentName,
      gig_title: matchData.gigTitle,
      company_name: matchData.companyName || 'HARX',
      match_score: matchData.matchScore ? `${Math.round(matchData.matchScore * 100)}%` : 'N/A',
      harx_link: `${window.location.origin}/app11`,
      from_name: 'HARX Team',
      from_email: 'noreply@harx.ai'
    };

    console.log('📧 Envoi d\'email réel avec EmailJS:', templateParams);

    // Envoi automatique avec EmailJS
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
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
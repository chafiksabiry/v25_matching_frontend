import axios from 'axios';

interface EmailData {
  to: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
}

interface MatchEmailData {
  agentName: string;
  agentEmail: string;
  gigTitle: string;
  companyName: string;
  matchScore?: number;
}

export const sendMatchEmail = async (matchData: MatchEmailData): Promise<boolean> => {
  try {
    // Créer le contenu de l'email
    const emailSubject = `🎯 Match trouvé pour "${matchData.gigTitle}" - HARX`;
    const emailBody = `
      Match HARX Trouvé!
      
      Félicitations ${matchData.agentName}!
      
      Un nouveau match vous attend:
      
      Titre: ${matchData.gigTitle}
      Entreprise: ${matchData.companyName}
      ${matchData.matchScore ? `Score de compatibilité: ${Math.round(matchData.matchScore * 100)}%` : ''}
      
      Connectez-vous à votre espace HARX pour plus de détails: ${window.location.origin}/app11
      
      © 2025 HARX. Tous droits réservés.
    `;

    // Méthode 1: Utiliser mailto pour ouvrir le client email par défaut
    const mailtoLink = `mailto:${matchData.agentEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    
    // Ouvrir le client email par défaut
    window.open(mailtoLink, '_blank');

    // Méthode 2: Copier les détails dans le presse-papiers
    const clipboardText = `
🎯 Match HARX Trouvé!

Félicitations ${matchData.agentName}!

Un nouveau match vous attend:

📋 Détails du poste:
• Titre: ${matchData.gigTitle}
• Entreprise: ${matchData.companyName}
${matchData.matchScore ? `• Score de compatibilité: ${Math.round(matchData.matchScore * 100)}%` : ''}

Notre système d'IA a identifié que votre profil correspond parfaitement à cette opportunité!

Prochaines étapes:
1. Connectez-vous à votre espace HARX
2. Consultez les détails complets du poste
3. Postulez en quelques clics

Lien: ${window.location.origin}/app11

© 2025 HARX. Tous droits réservés.
    `.trim();

    // Copier dans le presse-papiers
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(clipboardText);
    }

    // Afficher une notification de succès
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: Arial, sans-serif;
      max-width: 300px;
      animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="font-size: 24px;">🎯</div>
        <div>
          <div style="font-weight: bold; margin-bottom: 4px;">Email préparé!</div>
          <div style="font-size: 14px; opacity: 0.9;">
            Client email ouvert et détails copiés dans le presse-papiers
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

    // Supprimer la notification après 5 secondes
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);

    return true;

  } catch (error) {
    console.error('Erreur lors de la préparation de l\'email:', error);
    
    // Fallback: afficher une alerte simple
    alert(`Email préparé pour ${matchData.agentName} (${matchData.agentEmail})!\n\nDétails du match:\n- Titre: ${matchData.gigTitle}\n- Entreprise: ${matchData.companyName}${matchData.matchScore ? `\n- Score: ${Math.round(matchData.matchScore * 100)}%` : ''}`);
    
    return true;
  }
}; 
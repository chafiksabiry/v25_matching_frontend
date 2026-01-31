import React from 'react';
import MatchingDashboard from './components/MatchingDashboard';
import AgentDetailsPage from './components/AgentDetailsPage';


export default function App() {
  const [currentRoute, setCurrentRoute] = React.useState('dashboard');
  const [selectedAgentId, setSelectedAgentId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      console.log("[App12] handleLocationChange", path);
      // Check if path contains /agent-details/
      const match = path.match(/\/agent-details\/([a-zA-Z0-9]+)/);
      if (match) {
        console.log("[App12] Going to Agent Detail:", match[1]);
        setSelectedAgentId(match[1]);
        setCurrentRoute('details');
      } else {
        console.log("[App12] Going to Dashboard");
        setCurrentRoute('dashboard');
        setSelectedAgentId(null);
      }
    };

    // Initial check
    handleLocationChange();

    // Listen for popstate (browser back/forward)
    window.addEventListener('popstate', handleLocationChange);

    // Custom event for internal navigation
    window.addEventListener('navigate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('navigate', handleLocationChange);
    };
  }, []);

  const navigateToDashboard = () => {
    // Determine base path (handle Qiankun vs Standalone)
    // For now assuming we go back to root of this microfrontend
    const newPath = '/app12';
    window.history.pushState({}, '', newPath);
    window.dispatchEvent(new Event('navigate'));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {currentRoute === 'dashboard' ? (
        <MatchingDashboard />
      ) : (
        <AgentDetailsPage
          agentId={selectedAgentId || ''}
          onBack={navigateToDashboard}
        />
      )}
    </div>
  );
}


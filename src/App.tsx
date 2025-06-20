import React, { useState } from 'react';
import { GigCreator } from './components/GigCreator';
import { GigView } from './components/GigView';

export default function App() {
  const [mode, setMode] = useState<'create' | 'view'>('create');
  const [selectedGigId, setSelectedGigId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Gig Management</h1>
            <div className="space-x-4">
              <button
                onClick={() => {
                  setMode('create');
                  setSelectedGigId(null);
                }}
                className={`px-4 py-2 rounded-md ${
                  mode === 'create'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Create New
              </button>
              <button
                onClick={() => setMode('view')}
                className={`px-4 py-2 rounded-md ${
                  mode === 'view'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                View Gigs
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {mode === 'create' ? (
          <GigCreator />
        ) : (
          <GigView selectedGigId={selectedGigId} onSelectGig={setSelectedGigId} />
        )}
      </main>
    </div>
  );
}
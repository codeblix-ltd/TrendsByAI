import React, { useState } from 'react';
import DashboardCard from './DashboardCard';
import { SearchIcon, ZapIcon } from '../icons';
import { clsx } from 'clsx';

interface AIAssistantCardProps {
  isSearching: boolean;
  searchProgress: string;
  triggerSearchNow: () => void;
  triggerInstantSearch: (query: string) => void;
  userApiKey: string;
}

const AIAssistantCard: React.FC<AIAssistantCardProps> = ({ isSearching, searchProgress, triggerSearchNow, triggerInstantSearch, userApiKey }) => {
  const [query, setQuery] = useState('');

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      triggerInstantSearch(query);
    }
  };

  return (
    <DashboardCard className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">AI-Powered Discovery</h2>
      </div>
      <div className="flex-grow flex flex-col items-center text-center">
        <div className="w-32 h-32 rounded-full mb-4 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
          <ZapIcon className="w-16 h-16 text-white" />
        </div>
        <p className="text-sm text-gray-400 px-2">
          Trigger a broad scan or search for specific content.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Instant search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!userApiKey}
            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
          />
        </div>

        <button 
          onClick={triggerSearchNow}
          disabled={isSearching}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 disabled:opacity-50">
           {isSearching ? (
                <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Scanning...</span>
                </>
            ) : (
                <>
                    <ZapIcon className="w-5 h-5" />
                    <span>Scan Top Categories</span>
                </>
            )}
        </button>
        {searchProgress && (
            <div className={clsx('text-xs text-center animate-pulse px-3 py-2 rounded-lg border',
                searchProgress.includes('❌') || searchProgress.includes('⚠️') ? 'text-red-400 bg-red-900/20 border-red-500/30'
                : searchProgress.includes('✅') ? 'text-green-400 bg-green-900/20 border-green-500/30'
                : searchProgress.includes('ℹ️') ? 'text-blue-400 bg-blue-900/20 border-blue-500/30'
                : 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30'
            )}>
                {searchProgress}
            </div>
        )}
      </div>
    </DashboardCard>
  );
};

export default AIAssistantCard;
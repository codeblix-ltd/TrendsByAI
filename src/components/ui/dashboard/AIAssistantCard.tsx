import React, { useState } from 'react';
import DashboardCard from '../DashboardCard';
import { SearchIcon, ZapIcon } from '../icons';
import { RefreshCw } from 'lucide-react';

interface AIAssistantCardProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

const AIAssistantCard: React.FC<AIAssistantCardProps> = ({ onRefresh, isRefreshing }) => {
  const [query, setQuery] = useState('');

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      // Handle instant search - for now just trigger refresh
      onRefresh();
      setQuery('');
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
          Discover trending AI content and analyze video performance patterns.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for specific content..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
          />
        </div>

        <button 
          onClick={onRefresh}
          disabled={isRefreshing}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 disabled:opacity-50"
        >
          {isRefreshing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <ZapIcon className="w-5 h-5" />
              <span>Discover Trending Content</span>
            </>
          )}
        </button>
      </div>
    </DashboardCard>
  );
};

export default AIAssistantCard;
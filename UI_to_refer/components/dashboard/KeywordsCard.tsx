import React from 'react';
import DashboardCard from './DashboardCard';
import { HashIcon } from '../icons';
import { clsx } from 'clsx';

interface KeywordsCardProps {
    categories: string[];
    activeCategory: string;
    setActiveCategory: (category: string) => void;
}

const KeywordPill: React.FC<{ children: React.ReactNode; isActive: boolean; onClick: () => void; }> = ({ children, isActive, onClick }) => (
    <button 
      onClick={onClick}
      className={clsx(
        "text-sm px-4 py-2 border rounded-full transition-colors",
        isActive 
          ? "bg-blue-600 text-white border-blue-500" 
          : "bg-white/5 hover:bg-white/10 border-white/10"
      )}
    >
        {children}
    </button>
);

const KeywordsCard: React.FC<KeywordsCardProps> = ({ categories, activeCategory, setActiveCategory }) => {
  return (
    <DashboardCard>
      <div className="flex items-center gap-3 mb-4">
         <div className="p-2 bg-white/5 rounded-full">
            <HashIcon className="w-6 h-6 text-white"/>
        </div>
        <div>
            <h2 className="text-lg font-semibold text-white">Filter by Category</h2>
            <p className="text-sm text-gray-400">Select a category to explore</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        {categories.map((keyword) => (
          <KeywordPill 
            key={keyword}
            isActive={activeCategory === keyword}
            onClick={() => setActiveCategory(keyword)}
          >
            {keyword}
          </KeywordPill>
        ))}
      </div>
    </DashboardCard>
  );
};

export default KeywordsCard;

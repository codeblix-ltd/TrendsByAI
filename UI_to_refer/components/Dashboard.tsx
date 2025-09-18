import React from 'react';
import AIAssistantCard from './dashboard/AIAssistantCard';
import KeywordsCard from './dashboard/KeywordsCard';
import TotalSalesCard from './dashboard/TotalSalesCard';
import TopCoursesCard from './dashboard/TopCoursesCard';
import UsersByCountryCard from './dashboard/UsersByCountryCard';
import TopAuthorsCard from './dashboard/TopAuthorsCard';
import type { Video, ApiUsage } from '../types';

interface DashboardProps {
  videos: Video[];
  stats: any;
  isSearching: boolean;
  searchProgress: string;
  triggerSearchNow: () => void;
  triggerInstantSearch: (query: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  categories: string[];
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  bestPerformer: Video | null;
  status: { isConnected: boolean; lastScanTime: string | null };
  userApiKey: string;
}

const Dashboard: React.FC<DashboardProps> = (props) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {/* Left Column */}
      <div className="flex flex-col gap-6 xl:col-span-1">
        <AIAssistantCard 
          isSearching={props.isSearching}
          searchProgress={props.searchProgress}
          triggerSearchNow={props.triggerSearchNow}
          triggerInstantSearch={props.triggerInstantSearch}
          userApiKey={props.userApiKey}
        />
        <KeywordsCard 
          categories={props.categories}
          activeCategory={props.activeCategory}
          setActiveCategory={props.setActiveCategory}
        />
      </div>

      {/* Middle Column */}
      <div className="flex flex-col gap-6 lg:col-span-2 xl:col-span-2">
        <TotalSalesCard stats={props.stats} />
        <TopCoursesCard 
          videos={props.videos}
          sortBy={props.sortBy}
          setSortBy={props.setSortBy}
        />
      </div>

      {/* Right Column */}
      <div className="flex flex-col gap-6 lg:col-span-1 xl:col-span-1">
        <UsersByCountryCard status={props.status} />
        <TopAuthorsCard author={props.bestPerformer} />
      </div>
    </div>
  );
};

export default Dashboard;

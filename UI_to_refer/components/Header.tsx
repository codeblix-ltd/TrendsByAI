import React from 'react';
import { SearchIcon, BellIcon, SettingsIcon } from './icons';

interface HeaderProps {
  onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
  return (
    <header className="flex items-center justify-between p-4 bg-black/10 rounded-full border border-white/10 backdrop-blur-md">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-white">TrendAI</h1>
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
          <SearchIcon className="text-gray-300" />
        </button>
        <button className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
          <BellIcon className="text-gray-300" />
        </button>
        <button onClick={onSettingsClick} className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
          <SettingsIcon className="text-gray-300" />
        </button>
        <div className="w-10 h-10 rounded-full bg-gray-700 border-2 border-white/20">
            <img src="https://picsum.photos/seed/user/40/40" alt="User Avatar" className="rounded-full w-full h-full object-cover"/>
        </div>
      </div>
    </header>
  );
};

export default Header;
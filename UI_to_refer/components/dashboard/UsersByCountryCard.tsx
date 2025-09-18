import React from 'react';
import DashboardCard from './DashboardCard';
import { MapPinIcon, WifiIcon, WifiOffIcon, ClockIcon } from '../icons';
import { formatDistanceToNow } from 'date-fns';

interface StatusCardProps {
    status: {
        isConnected: boolean;
        lastScanTime: string | null;
    }
}

const UsersByCountryCard: React.FC<StatusCardProps> = ({ status }) => {
  return (
    <DashboardCard>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-white/5 rounded-full">
                <MapPinIcon className="w-6 h-6 text-white"/>
            </div>
            <h2 className="text-lg font-semibold text-white">Global Status</h2>
        </div>
      </div>
      
      <ul className="space-y-4 mt-6">
        <li className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-300">
                {status.isConnected ? <WifiIcon className="w-5 h-5 text-green-400"/> : <WifiOffIcon className="w-5 h-5 text-red-400"/>}
                <span>Connection Status</span>
            </div>
            <span className={`font-bold ${status.isConnected ? 'text-green-400' : 'text-red-400'}`}>
                {status.isConnected ? 'Live' : 'Disconnected'}
            </span>
        </li>
        <li className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-300">
                <ClockIcon className="w-5 h-5" />
                <span>Last Scan</span>
            </div>
            <span className="font-medium text-white">
                 {status.lastScanTime ? formatDistanceToNow(new Date(status.lastScanTime), { addSuffix: true }) : 'N/A'}
            </span>
        </li>
      </ul>
    </DashboardCard>
  );
};

export default UsersByCountryCard;

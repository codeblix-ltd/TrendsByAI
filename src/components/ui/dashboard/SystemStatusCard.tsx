import React from 'react';
import DashboardCard from '../DashboardCard';
import { WifiIcon, WifiOffIcon, DatabaseIcon } from '../icons';
import { formatDistanceToNow } from 'date-fns';

interface SystemStatusCardProps {
  isConnected: boolean;
  lastScanTime: string | null;
  totalVideos: number;
}

const SystemStatusCard: React.FC<SystemStatusCardProps> = ({ 
  isConnected, 
  lastScanTime, 
  totalVideos 
}) => {
  return (
    <DashboardCard>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">System Status</h2>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
          isConnected 
            ? 'bg-green-500/20 text-green-400 border border-green-500/20' 
            : 'bg-red-500/20 text-red-400 border border-red-500/20'
        }`}>
          {isConnected ? (
            <>
              <WifiIcon className="w-4 h-4" />
              <span>Connected</span>
            </>
          ) : (
            <>
              <WifiOffIcon className="w-4 h-4" />
              <span>Disconnected</span>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3">
            <DatabaseIcon className="w-5 h-5 text-blue-400" />
            <div>
              <div className="text-sm font-medium text-white">Database</div>
              <div className="text-xs text-gray-400">Videos tracked</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-white">{totalVideos.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Total</div>
          </div>
        </div>

        {lastScanTime && (
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-sm font-medium text-white mb-1">Last Scan</div>
            <div className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(lastScanTime), { addSuffix: true })}
            </div>
          </div>
        )}

        <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
          <div className="text-sm font-medium text-white mb-2">API Status</div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">YouTube API</span>
              <span className="text-xs text-green-400">Active</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Supabase</span>
              <span className="text-xs text-green-400">Connected</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Analytics</span>
              <span className="text-xs text-green-400">Running</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};

export default SystemStatusCard;

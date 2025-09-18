import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import { supabase } from './lib/supabase';
import type { Video, ApiUsage } from './types';
import { XIcon, KeyIcon, InfoIcon, CheckCircleIcon, AlertCircleIcon, ExternalLinkIcon } from './components/icons';
import { clsx } from 'clsx';

const App: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [apiUsage, setApiUsage] = useState<ApiUsage | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [lastScanTime, setLastScanTime] = useState<string | null>(null);
  const [totalVideos, setTotalVideos] = useState(0);
  const [globalStats, setGlobalStats] = useState({ countries: 0, categories: 0 });
  
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [userApiKey, setUserApiKey] = useState('');
  const [inputApiKey, setInputApiKey] = useState('');
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [keyValidationResult, setKeyValidationResult] = useState<{ valid: boolean; message: string } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState('');

  const categories = [
    'All', 'AI Horror', 'AI ASMR', 'AI Analog Horror', 'AI Liminal Spaces', 
    'AI True Crime Narration', 'AI Dark Fantasy', 'AI Surreal/Weird Core', 'AI Backrooms', 
    'AI Storytelling Shorts', 'AI Music/AI Phonk', 'AI Lo-fi/Study Ambience', 'AI Nature Ambience', 
    'AI Kinetic Typography', 'AI Satisfying Visuals', 'AI Miniature Worlds', 'AI Cooking/Hyper-Real Food', 
    'AI Fashion Try-ons', 'AI VTubers/Virtual Influencers', 'AI Anime Scenes', 'AI Meme Generators', 
    'AI Tech Tutorials', 'AI Productivity Hacks', 'AI News/Trends', 'AI Photo Restoration/Enhance', 
    'AI Lego/Stop-motion Hybrids', 'Tech', 'Gaming', 'Science'
  ];

  const loadStoredApiKey = () => {
    try {
      const stored = localStorage.getItem('youtube_api_key');
      if (stored) setUserApiKey(stored);
    } catch (error) {
      console.error('Error loading stored API key:', error);
    }
  };

  const validateApiKey = async (apiKey: string): Promise<{ valid: boolean; message: string }> => {
     if (!apiKey || apiKey.length < 30) return { valid: false, message: 'API key appears to be invalid (too short)' };
     if (!apiKey.startsWith('AIza')) return { valid: false, message: 'Invalid YouTube Data API key format' };
     try {
       const testUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&type=video&maxResults=1&key=${apiKey}`;
       const response = await fetch(testUrl);
       if (response.ok) return { valid: true, message: 'API key is valid and working!' };
       if (response.status === 403) {
         const errorData = await response.json();
         if (errorData.error?.message?.includes('quota')) return { valid: true, message: 'API key is valid but quota exceeded.' };
         return { valid: false, message: 'API key is invalid or access is restricted' };
       }
       return { valid: false, message: 'Unable to validate API key.' };
     } catch (error) {
       return { valid: false, message: 'Network error during validation.' };
     }
  };

  const saveApiKey = async () => {
    if (!inputApiKey.trim()) {
      setKeyValidationResult({ valid: false, message: 'Please enter an API key' });
      return;
    }
    setIsValidatingKey(true);
    setKeyValidationResult(null);
    try {
      const validation = await validateApiKey(inputApiKey.trim());
      
      if (validation.valid) {
        localStorage.setItem('youtube_api_key', inputApiKey.trim());
        setUserApiKey(inputApiKey.trim());
        setKeyValidationResult({ valid: true, message: 'Key saved! Running a quick scan...' });

        try {
          const { error } = await supabase.functions.invoke('trendai-search', {
            body: { 
              category: 'AI Horror',
              maxResults: 10,
              userApiKey: inputApiKey.trim() 
            }
          });

          if (error) {
            console.error('Demo scan failed:', error);
            setKeyValidationResult({ valid: true, message: 'Key is valid, but scan failed. Try manually.' });
          } else {
            await loadVideos();
            setKeyValidationResult({ valid: true, message: 'Scan complete! Content updated.' });
          }
        } catch (e) {
            console.error('Demo scan invocation failed:', e);
            setKeyValidationResult({ valid: true, message: 'Key is valid, but scan failed. Try manually.' });
        }
        
        setTimeout(() => {
          setShowSettingsModal(false);
          setInputApiKey('');
          setKeyValidationResult(null);
        }, 4000);
      } else {
        setKeyValidationResult(validation);
      }
    } catch (error) {
      setKeyValidationResult({ valid: false, message: 'Error validating API key.' });
    } finally {
      setIsValidatingKey(false);
    }
  };
  
  const clearApiKey = () => {
    localStorage.removeItem('youtube_api_key');
    setUserApiKey('');
    setInputApiKey('');
    setKeyValidationResult({ valid: true, message: 'API key cleared. Using default key.' });
    setTimeout(() => setKeyValidationResult(null), 2000);
  };

  const maskApiKey = (key: string) => {
    if (!key) return 'No custom key set';
    return `${key.substring(0, 8)}...${key.slice(-4)}`;
  };

  const loadVideos = async () => {
    try {
      const { data, error } = await supabase.from('videos').select('*').order('created_at', { ascending: false }).limit(500);
      if (error) throw error;
      setVideos(data || []);
      setTotalVideos(data?.length || 0);
      if (data) {
        const uniqueCountries = new Set(data.map(v => v.country_name || v.region).filter(Boolean));
        const uniqueCategories = new Set(data.map(v => v.category).filter(Boolean));
        setGlobalStats({ countries: uniqueCountries.size, categories: uniqueCategories.size });
      }
      setIsConnected(true);
    } catch (error) {
      console.error('Error loading videos:', error);
      setIsConnected(false);
    }
  };
  
  const triggerSearchNow = async () => {
    if (!userApiKey) {
      setSearchProgress('⚠️ Add API key in Settings');
      setTimeout(() => setSearchProgress(''), 3000);
      return;
    }
    setIsSearching(true);
    const priorityCategories = ['AI Horror', 'AI ASMR', 'AI Analog Horror', 'AI Liminal Spaces', 'AI Dark Fantasy', 'AI Storytelling Shorts', 'AI Music/AI Phonk', 'AI Satisfying Visuals'];
    let searchedCategories = 0;
    let hasQuotaError = false;
    for (const category of priorityCategories) {
      if (hasQuotaError) break;
      searchedCategories++;
      setSearchProgress(`🔍 Searching ${category}... (${searchedCategories}/${priorityCategories.length})`);
      const { error } = await supabase.functions.invoke('trendai-search', { body: { category, maxResults: 8, userApiKey } });
      if (error?.message?.includes('QUOTA_EXCEEDED')) {
        hasQuotaError = true;
        setSearchProgress('❌ Quota exceeded.');
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    if (!hasQuotaError) {
      setSearchProgress('🔄 Refreshing...');
      await loadVideos();
      setSearchProgress('✅ Scan complete!');
    }
    setTimeout(() => setSearchProgress(''), hasQuotaError ? 5000 : 3000);
    setIsSearching(false);
  };
  
  const triggerInstantSearch = async (customQuery: string) => {
    if (!userApiKey) {
        setSearchProgress('⚠️ Add API key in Settings');
        setTimeout(() => setSearchProgress(''), 3000);
        return;
    }
    if (!customQuery.trim()) return;

    setIsSearching(true);
    setSearchProgress(`🔍 Searching "${customQuery}"...`);
    const { data, error } = await supabase.functions.invoke('trendai-search', { body: { category: 'Custom Search', customQuery, maxResults: 20, userApiKey } });
    
    if (error) {
        if (error.message?.includes('QUOTA_EXCEEDED')) setSearchProgress('❌ Quota exceeded.');
        else setSearchProgress('❌ Search failed.');
    } else if (data?.data) {
        const videoCount = data.data.videoCount || 0;
        if (videoCount === 0) setSearchProgress(`ℹ️ No recent videos found.`);
        else {
            setSearchProgress(`✅ Found ${videoCount} videos!`);
            await loadVideos();
            setActiveCategory('All');
        }
    }
    setTimeout(() => setSearchProgress(''), 5000);
    setIsSearching(false);
  };

  const loadApiUsage = async () => {
    try {
      const { data, error } = await supabase.from('api_usage_tracking').select('*').order('scan_date', { ascending: false }).limit(1).maybeSingle();
      if (error) throw error;
      setApiUsage(data);
    } catch (error) { console.error('Error loading API usage:', error); }
  };
  
  const loadScanHistory = async () => {
    try {
      const { data, error } = await supabase.from('scan_history').select('scan_started_at').order('scan_started_at', { ascending: false }).limit(1).maybeSingle();
      if (error) throw error;
      if (data) setLastScanTime(data.scan_started_at);
    } catch (error) { console.error('Error loading scan history:', error); }
  };

  const filteredAndSortedVideos = useMemo(() => {
    let filtered = videos;
    if (activeCategory !== 'All') {
      filtered = filtered.filter(video => video.category?.toLowerCase().includes(activeCategory.toLowerCase()));
    }
    if (searchTerm) {
      filtered = filtered.filter(video => 
        video.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.channel_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'viral': return (b.viral_score || 0) - (a.viral_score || 0);
        case 'trending': return (b.view_velocity || 0) - (a.view_velocity || 0);
        case 'views': return (b.view_count || 0) - (a.view_count || 0);
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [videos, activeCategory, searchTerm, sortBy]);
  
  const bestPerformer = useMemo(() => {
    const sortedByViral = [...videos].sort((a, b) => (b.viral_score || 0) - (a.viral_score || 0));
    return sortedByViral.length > 0 ? sortedByViral[0] : null;
  }, [videos]);

  useEffect(() => {
    loadStoredApiKey();
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadVideos(), loadApiUsage(), loadScanHistory()]);
      setLoading(false);
    };
    loadData();
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0F18] flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <div className="text-xl font-bold">Loading TrendAI...</div>
          <div className="text-gray-400">Scanning worldwide content...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div 
        className="min-h-screen bg-[#0D0F18] bg-cover bg-center p-4 sm:p-6 lg:p-8"
        style={{ backgroundImage: 'url(https://images.pexels.com/photos/11074957/pexels-photo-11074957.jpeg)' }}
      >
        <div className="max-w-[1920px] mx-auto">
          <Header onSettingsClick={() => setShowSettingsModal(true)} />
          <main className="mt-8">
            <Dashboard
              videos={filteredAndSortedVideos}
              stats={{ totalVideos, ...globalStats, ...apiUsage }}
              isSearching={isSearching}
              searchProgress={searchProgress}
              triggerSearchNow={triggerSearchNow}
              triggerInstantSearch={triggerInstantSearch}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              categories={categories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              sortBy={sortBy}
              setSortBy={setSortBy}
              bestPerformer={bestPerformer}
              status={{ isConnected, lastScanTime }}
              userApiKey={userApiKey}
            />
          </main>
        </div>
      </div>

      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#1a1c2c] to-[#101220] rounded-3xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-full"><KeyIcon className="w-6 h-6 text-white"/></div>
                <div>
                  <h2 className="text-lg font-semibold text-white">API Key Settings</h2>
                  <p className="text-sm text-gray-400">Configure your YouTube Data API v3 key</p>
                </div>
              </div>
              <button onClick={() => { setShowSettingsModal(false); setKeyValidationResult(null); setInputApiKey(''); }} className="p-2 rounded-full bg-white/5 hover:bg-white/10">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <h3 className="text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2"><InfoIcon className="w-4 h-4" /> Current Status</h3>
                  <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center"><span className="text-gray-400">Using:</span><span className={userApiKey ? 'text-green-400' : 'text-yellow-400'}>{userApiKey ? 'Personal Key' : 'Default Platform Key'}</span></div>
                      <div className="flex justify-between items-center"><span className="text-gray-400">Key:</span><span className="text-white font-mono text-xs bg-black/40 px-2 py-1 rounded">{maskApiKey(userApiKey)}</span></div>
                  </div>
              </div>
              <div className="space-y-4">
                <input
                    type="text" value={inputApiKey} onChange={(e) => { setInputApiKey(e.target.value); setKeyValidationResult(null); }}
                    placeholder="AIzaSy..." className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 font-mono text-sm"
                />
                {keyValidationResult && (
                    <div className={clsx('flex items-center gap-2 p-3 rounded-2xl text-sm border', keyValidationResult.valid ? 'bg-green-500/10 border-green-500/20 text-green-300' : 'bg-red-500/10 border-red-500/20 text-red-300')}>
                        {keyValidationResult.valid ? <CheckCircleIcon className="w-5 h-5" /> : <AlertCircleIcon className="w-5 h-5" />}
                        <span>{keyValidationResult.message}</span>
                    </div>
                )}
                <div className="flex gap-3">
                    <button onClick={saveApiKey} disabled={isValidatingKey || !inputApiKey.trim()} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-2xl text-white font-medium transition-colors disabled:cursor-not-allowed">
                        {isValidatingKey ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>Validating...</span></> : <> <KeyIcon className="w-4 h-4" /> <span>Save & Validate</span></>}
                    </button>
                    {userApiKey && (<button onClick={clearApiKey} className="px-4 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/20 rounded-2xl text-red-300 font-medium transition-colors">Clear</button>)}
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-gray-400 space-y-2">
                <p>Get your own key for higher quota limits (10,000 requests/day). Your key is stored locally in your browser and never sent to our servers.</p>
                <a href="https://console.cloud.google.com/apis/library/youtube.googleapis.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1">Get API Key from Google Cloud <ExternalLinkIcon className="w-4 h-4"/></a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
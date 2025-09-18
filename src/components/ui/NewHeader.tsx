import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import AuthModal from '../AuthModal'
import UserPreferencesModal from '../UserPreferencesModal'
import { SearchIcon, BellIcon, SettingsIcon } from './icons'
import { LogIn, LogOut, User, RefreshCw, Download } from 'lucide-react'

interface NewHeaderProps {
  onRefresh: () => void
  onExport: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
  isLoading: boolean
  onSettingsClick?: () => void
}

const NewHeader: React.FC<NewHeaderProps> = ({ 
  onRefresh, 
  onExport, 
  searchQuery, 
  onSearchChange, 
  isLoading,
  onSettingsClick
}) => {
  const { user, signOut } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      setUserMenuOpen(false)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleSettingsClick = () => {
    if (onSettingsClick) {
      onSettingsClick()
    } else {
      setPreferencesModalOpen(true)
    }
  }

  return (
    <>
      <header className="flex items-center justify-between p-4 bg-black/10 rounded-full border border-white/10 backdrop-blur-md">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-white">TrendAI</h1>
          <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full ml-3">
            PRO
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Search functionality - hidden on mobile, can be toggled */}
          <div className="hidden md:block">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-64 bg-white/5 border border-white/10 rounded-2xl px-10 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 text-sm"
              />
            </div>
          </div>

          {/* Mobile search button */}
          <button className="md:hidden p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
            <SearchIcon className="text-gray-300" />
          </button>

          {/* Action buttons */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRefresh}
            disabled={isLoading}
            className="hidden sm:flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white px-4 py-2 rounded-2xl transition-colors duration-200 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onExport}
            className="hidden sm:flex items-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-2xl transition-colors duration-200 text-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </motion.button>

          <button className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
            <BellIcon className="text-gray-300" />
          </button>
          
          <button onClick={handleSettingsClick} className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
            <SettingsIcon className="text-gray-300" />
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-10 h-10 rounded-full bg-gray-700 border-2 border-white/20 overflow-hidden hover:border-white/30 transition-colors"
              >
                <img 
                  src={`https://picsum.photos/seed/${user.email}/40/40`} 
                  alt="User Avatar" 
                  className="rounded-full w-full h-full object-cover"
                />
              </button>
              
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-12 bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-10 min-w-48"
                >
                  <div className="p-3 border-b border-white/10">
                    <p className="text-white font-medium text-sm">{user.email}</p>
                    <p className="text-gray-400 text-xs">Pro Member</p>
                  </div>
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setPreferencesModalOpen(true)
                        setUserMenuOpen(false)
                      }}
                      className="w-full text-left px-4 py-2 text-gray-300 hover:bg-white/5 transition-colors flex items-center space-x-2 text-sm"
                    >
                      <User className="w-4 h-4" />
                      <span>Preferences</span>
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-gray-300 hover:bg-white/5 transition-colors flex items-center space-x-2 text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-2xl transition-colors text-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
      
      {/* User Preferences Modal */}
      <UserPreferencesModal
        isOpen={preferencesModalOpen}
        onClose={() => setPreferencesModalOpen(false)}
      />
    </>
  )
}

export default NewHeader

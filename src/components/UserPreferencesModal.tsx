import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Settings, 
  Bell, 
  Search, 
  Filter, 
  Save, 
  X,
  AlertCircle,
  CheckCircle,
  Hash,
  Clock,
  Mail
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

interface UserPreferencesProps {
  isOpen: boolean
  onClose: () => void
}

interface UserPreferences {
  id?: string
  user_id: string
  preferred_categories: string[]
  notification_keywords: string[]
  scan_frequency: string
  email_notifications: boolean
  dashboard_layout: any
}

const UserPreferencesModal: React.FC<UserPreferencesProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [preferences, setPreferences] = useState<UserPreferences>({
    user_id: user?.id || '',
    preferred_categories: [],
    notification_keywords: [],
    scan_frequency: 'daily',
    email_notifications: true,
    dashboard_layout: {}
  })
  
  const [newCategory, setNewCategory] = useState('')
  const [newKeyword, setNewKeyword] = useState('')

  const availableCategories = [
    'AI News', 'ChatGPT', 'Machine Learning', 'AI Tools', 'Artificial Intelligence',
    'Deep Learning', 'AI Tutorial', 'AI Technology', 'AI Innovation', 'AI Breakthrough',
    'Computer Vision', 'Natural Language Processing', 'Robotics', 'Neural Networks'
  ]

  const scanFrequencies = [
    { value: 'hourly', label: 'Every Hour' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'manual', label: 'Manual Only' }
  ]

  useEffect(() => {
    if (isOpen && user) {
      loadUserPreferences()
    }
  }, [isOpen, user])

  const loadUserPreferences = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setPreferences({
          ...data,
          preferred_categories: data.preferred_categories || [],
          notification_keywords: data.notification_keywords || []
        })
      }
    } catch (err: any) {
      setError('Failed to load preferences: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const savePreferences = async () => {
    if (!user) return
    
    try {
      setSaving(true)
      setError(null)
      
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          ...preferences,
          user_id: user.id,
          updated_at: new Date().toISOString()
        })

      if (error) {
        throw error
      }

      setSuccess('Preferences saved successfully!')
      setTimeout(() => {
        setSuccess(null)
        onClose()
      }, 2000)
    } catch (err: any) {
      setError('Failed to save preferences: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const addCategory = () => {
    if (newCategory.trim() && !preferences.preferred_categories.includes(newCategory.trim())) {
      setPreferences(prev => ({
        ...prev,
        preferred_categories: [...prev.preferred_categories, newCategory.trim()]
      }))
      setNewCategory('')
    }
  }

  const removeCategory = (category: string) => {
    setPreferences(prev => ({
      ...prev,
      preferred_categories: prev.preferred_categories.filter(c => c !== category)
    }))
  }

  const addKeyword = () => {
    if (newKeyword.trim() && !preferences.notification_keywords.includes(newKeyword.trim())) {
      setPreferences(prev => ({
        ...prev,
        notification_keywords: [...prev.notification_keywords, newKeyword.trim()]
      }))
      setNewKeyword('')
    }
  }

  const removeKeyword = (keyword: string) => {
    setPreferences(prev => ({
      ...prev,
      notification_keywords: prev.notification_keywords.filter(k => k !== keyword)
    }))
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 border border-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">User Preferences</h2>
              <p className="text-sm text-gray-400">Customize your AI Video Trend Watcher experience</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading preferences...</p>
            </div>
          ) : (
            <>
              {/* User Info */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{user?.email}</h3>
                    <p className="text-gray-400 text-sm">Member since {new Date(user?.created_at || '').toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Preferred Categories */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Filter className="w-5 h-5" />
                  <span>Preferred Categories</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                      placeholder="Add custom category..."
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <button
                      onClick={addCategory}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableCategories.map(category => (
                      <button
                        key={category}
                        onClick={() => {
                          if (preferences.preferred_categories.includes(category)) {
                            removeCategory(category)
                          } else {
                            setPreferences(prev => ({
                              ...prev,
                              preferred_categories: [...prev.preferred_categories, category]
                            }))
                          }
                        }}
                        className={`text-sm px-3 py-2 rounded-lg border transition-colors ${
                          preferences.preferred_categories.includes(category)
                            ? 'bg-cyan-600 border-cyan-600 text-white'
                            : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-cyan-600'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                  
                  {preferences.preferred_categories.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Selected Categories:</h4>
                      <div className="flex flex-wrap gap-2">
                        {preferences.preferred_categories.map(category => (
                          <span
                            key={category}
                            className="bg-cyan-600/20 text-cyan-400 px-3 py-1 rounded-full text-sm border border-cyan-600/30 flex items-center space-x-2"
                          >
                            <span>{category}</span>
                            <button
                              onClick={() => removeCategory(category)}
                              className="hover:text-cyan-300"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notification Keywords */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Hash className="w-5 h-5" />
                  <span>Notification Keywords</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                      placeholder="Add keyword to track..."
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <button
                      onClick={addKeyword}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  
                  {preferences.notification_keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {preferences.notification_keywords.map(keyword => (
                        <span
                          key={keyword}
                          className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm border border-purple-600/30 flex items-center space-x-2"
                        >
                          <span>{keyword}</span>
                          <button
                            onClick={() => removeKeyword(keyword)}
                            className="hover:text-purple-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Scan Frequency */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Scan Frequency</span>
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {scanFrequencies.map(freq => (
                    <button
                      key={freq.value}
                      onClick={() => setPreferences(prev => ({ ...prev, scan_frequency: freq.value }))}
                      className={`text-sm px-4 py-3 rounded-lg border transition-colors ${
                        preferences.scan_frequency === freq.value
                          ? 'bg-green-600 border-green-600 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-green-600'
                      }`}
                    >
                      {freq.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email Notifications */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Mail className="w-5 h-5" />
                  <span>Email Notifications</span>
                </h3>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.email_notifications}
                    onChange={(e) => setPreferences(prev => ({ ...prev, email_notifications: e.target.checked }))}
                    className="w-5 h-5 bg-gray-800 border-gray-700 rounded focus:ring-2 focus:ring-cyan-500 text-cyan-600"
                  />
                  <span className="text-gray-300">Send email notifications for trending videos matching your keywords</span>
                </label>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <span className="text-red-300 text-sm">{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center space-x-2 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-green-300 text-sm">{success}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Preferences are saved automatically
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={savePreferences}
              disabled={saving}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default UserPreferencesModal
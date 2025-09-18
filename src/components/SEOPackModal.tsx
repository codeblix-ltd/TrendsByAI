import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Sparkles, 
  Copy, 
  Download, 
  TrendingUp, 
  Target, 
  Award, 
  Lightbulb,
  Calendar,
  Users,
  Hash,
  FileText,
  Image,
  CheckCircle
} from 'lucide-react'
import { Video } from '../lib/supabase'

interface SEOPackModalProps {
  isOpen: boolean
  onClose: () => void
  video: Video | null
  seoData: any
  isLoading: boolean
}

const SEOPackModal: React.FC<SEOPackModalProps> = ({ 
  isOpen, 
  onClose, 
  video, 
  seoData, 
  isLoading 
}) => {
  const [activeTab, setActiveTab] = useState('analysis')
  const [copiedItem, setCopiedItem] = useState<string | null>(null)

  const copyToClipboard = async (text: string, item: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItem(item)
      setTimeout(() => setCopiedItem(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const tabs = [
    { id: 'analysis', label: 'Analysis', icon: Target },
    { id: 'optimizations', label: 'Optimizations', icon: Sparkles },
    { id: 'strategy', label: 'Strategy', icon: TrendingUp },
    { id: 'action-plan', label: 'Action Plan', icon: CheckCircle }
  ]

  if (!isOpen) return null

  return (
    <AnimatePresence>
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
          className="bg-gray-900 border border-gray-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">SEO Optimization Pack</h2>
                <p className="text-sm text-gray-400">
                  {video?.title ? `for "${video.title.substring(0, 50)}..."` : 'Loading...'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="px-6 py-4 border-b border-gray-800">
            <div className="flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400">Generating SEO pack...</p>
                </div>
              </div>
            ) : seoData ? (
              <div className="space-y-6">
                {/* Analysis Tab */}
                {activeTab === 'analysis' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gray-800/50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Current SEO Score</h3>
                        <div className="text-3xl font-bold text-yellow-400 mb-2">
                          {seoData.data?.analysis?.currentSEOScore || 0}
                        </div>
                        <p className="text-gray-400">Baseline performance</p>
                      </div>
                      
                      <div className="bg-gray-800/50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Optimized Score</h3>
                        <div className="text-3xl font-bold text-green-400 mb-2">
                          {seoData.data?.analysis?.optimizedSEOScore || 0}
                        </div>
                        <p className="text-gray-400">Potential performance</p>
                      </div>
                      
                      <div className="bg-gray-800/50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Improvement</h3>
                        <div className="text-3xl font-bold text-cyan-400 mb-2">
                          +{seoData.data?.analysis?.improvementPotential || 0}
                        </div>
                        <p className="text-gray-400">Points gain</p>
                      </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                        <Hash className="w-5 h-5" />
                        <span>Extracted Keywords</span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(seoData.data?.analysis?.extractedKeywords || []).map((keyword: string, index: number) => (
                          <span
                            key={index}
                            className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm border border-purple-600/30"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5" />
                        <span>Competitor Analysis</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-md font-medium text-gray-300 mb-2">Top Competitors</h4>
                          <ul className="space-y-1">
                            {(seoData.data?.analysis?.competitorAnalysis?.topCompetitors || []).map((competitor: string, index: number) => (
                              <li key={index} className="text-gray-400 text-sm">• {competitor}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-md font-medium text-gray-300 mb-2">Gap Opportunities</h4>
                          <ul className="space-y-1">
                            {(seoData.data?.analysis?.competitorAnalysis?.gapOpportunities || []).map((gap: string, index: number) => (
                              <li key={index} className="text-gray-400 text-sm">• {gap}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Optimizations Tab */}
                {activeTab === 'optimizations' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="bg-gray-800/50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                        <FileText className="w-5 h-5" />
                        <span>Title Variations</span>
                      </h3>
                      <div className="space-y-3">
                        {(seoData.data?.optimizations?.titleVariations || []).map((title: string, index: number) => (
                          <div key={index} className="bg-gray-700/50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <p className="text-gray-300 flex-1">{title}</p>
                              <button
                                onClick={() => copyToClipboard(title, `title-${index}`)}
                                className="ml-4 p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                              >
                                {copiedItem === `title-${index}` ? (
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Copy className="w-4 h-4 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                        <FileText className="w-5 h-5" />
                        <span>Optimized Description</span>
                      </h3>
                      <div className="bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <pre className="text-gray-300 whitespace-pre-wrap flex-1 text-sm">
                            {seoData.data?.optimizations?.optimizedDescription || 'No description available'}
                          </pre>
                          <button
                            onClick={() => copyToClipboard(seoData.data?.optimizations?.optimizedDescription || '', 'description')}
                            className="ml-4 p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                          >
                            {copiedItem === 'description' ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-800/50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                          <Hash className="w-5 h-5" />
                          <span>Hashtags</span>
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {(seoData.data?.optimizations?.hashtags || []).map((hashtag: string, index: number) => (
                            <span
                              key={index}
                              className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm border border-blue-600/30 cursor-pointer hover:bg-blue-600/30 transition-colors"
                              onClick={() => copyToClipboard(hashtag, `hashtag-${index}`)}
                            >
                              {hashtag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-800/50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                          <Image className="w-5 h-5" />
                          <span>Thumbnail Suggestions</span>
                        </h3>
                        <div className="space-y-3">
                          {(seoData.data?.optimizations?.thumbnailSuggestions || []).map((suggestion: any, index: number) => (
                            <div key={index} className="bg-gray-700/50 rounded-lg p-3">
                              <h4 className="text-sm font-medium text-white mb-1">{suggestion.type}</h4>
                              <p className="text-xs text-gray-400">{suggestion.suggestion}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Strategy Tab */}
                {activeTab === 'strategy' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-800/50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                          <Calendar className="w-5 h-5" />
                          <span>Posting Schedule</span>
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium text-gray-300">Best Days</h4>
                            <p className="text-gray-400">
                              {(seoData.data?.strategy?.postingSchedule?.bestDays || []).join(', ')}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-300">Best Times</h4>
                            <p className="text-gray-400">
                              {(seoData.data?.strategy?.postingSchedule?.bestTimes || []).join(', ')}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-300">Frequency</h4>
                            <p className="text-gray-400">
                              {seoData.data?.strategy?.postingSchedule?.frequency || 'Not specified'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-800/50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                          <Users className="w-5 h-5" />
                          <span>Audience Targeting</span>
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium text-gray-300">Primary Audience</h4>
                            <p className="text-gray-400">
                              {seoData.data?.strategy?.audienceTargeting?.primaryAudience || 'Not specified'}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-300">Content Style</h4>
                            <p className="text-gray-400">
                              {seoData.data?.strategy?.audienceTargeting?.contentStyle || 'Not specified'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                        <Award className="w-5 h-5" />
                        <span>Virality Factors</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-md font-medium text-gray-300 mb-2">Emotional Triggers</h4>
                          <div className="flex flex-wrap gap-2">
                            {(seoData.data?.strategy?.viralityFactors?.emotionalTriggers || []).map((trigger: string, index: number) => (
                              <span key={index} className="bg-pink-600/20 text-pink-400 px-2 py-1 rounded text-sm border border-pink-600/30">
                                {trigger}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-md font-medium text-gray-300 mb-2">Recommendations</h4>
                          <ul className="space-y-1">
                            {(seoData.data?.strategy?.viralityFactors?.recommendations || []).map((rec: string, index: number) => (
                              <li key={index} className="text-gray-400 text-sm">• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Action Plan Tab */}
                {activeTab === 'action-plan' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gray-800/50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center space-x-2">
                          <Lightbulb className="w-5 h-5" />
                          <span>Immediate Actions</span>
                        </h3>
                        <ul className="space-y-2">
                          {(seoData.data?.actionPlan?.immediate || []).map((action: string, index: number) => (
                            <li key={index} className="text-gray-300 text-sm flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-gray-800/50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center space-x-2">
                          <Target className="w-5 h-5" />
                          <span>Short Term (1-4 weeks)</span>
                        </h3>
                        <ul className="space-y-2">
                          {(seoData.data?.actionPlan?.shortTerm || []).map((action: string, index: number) => (
                            <li key={index} className="text-gray-300 text-sm flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-gray-800/50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center space-x-2">
                          <TrendingUp className="w-5 h-5" />
                          <span>Long Term (1-6 months)</span>
                        </h3>
                        <ul className="space-y-2">
                          {(seoData.data?.actionPlan?.longTerm || []).map((action: string, index: number) => (
                            <li key={index} className="text-gray-300 text-sm flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No SEO data available</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Generated by AI Video Trend Watcher Pro
            </div>
            <div className="flex space-x-3">
              <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-white transition-colors">
                <Download className="w-4 h-4" />
                <span>Download Report</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default SEOPackModal
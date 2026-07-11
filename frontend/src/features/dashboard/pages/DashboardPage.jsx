// src/features/dashboard/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Header } from '../../../shared/components/layout/Header';
import { Footer } from '../../../shared/components/layout/Footer';

const API_BASE_URL = 'http://localhost:8000';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [popularDocs, setPopularDocs] = useState([]);
  const [fileTypes, setFileTypes] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [statsRes, activityRes, popularRes, fileTypesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/dashboard/v1/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/dashboard/v1/recent-activity?limit=10`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/dashboard/v1/popular-documents?limit=6`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/dashboard/v1/file-type-distribution`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const statsData = await statsRes.json();
      const activityData = await activityRes.json();
      const popularData = await popularRes.json();
      const fileTypesData = await fileTypesRes.json();

      setStats(statsData);
      setRecentActivity(activityData);
      setPopularDocs(popularData);
      setFileTypes(fileTypesData.distribution || {});
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (extension) => {
    const icons = {
      '.pdf': '📄',
      '.docx': '📝',
      '.doc': '📝',
      '.xlsx': '📊',
      '.xls': '📊',
      '.pptx': '📽️',
      '.ppt': '📽️',
      '.png': '🖼️',
      '.jpg': '🖼️',
      '.jpeg': '🖼️',
      '.txt': '📃',
      '.csv': '📊',
      '.json': '📋',
      '.xml': '📋',
      '.html': '🌐',
      '.css': '🎨',
      '.js': '⚡',
      '.py': '🐍',
      '.java': '☕',
    };
    return icons[extension?.toLowerCase()] || '📎';
  };

  const getActionColor = (action) => {
    const colors = {
      'UPLOAD': 'text-emerald-400',
      'VIEW': 'text-blue-400',
      'DOWNLOAD': 'text-purple-400',
      'RENAME': 'text-amber-400',
      'MOVE': 'text-cyan-400',
      'DELETE': 'text-red-400',
      'RESTORE': 'text-green-400',
      'FAVORITE': 'text-yellow-400',
      'UNFAVORITE': 'text-gray-400',
    };
    return colors[action] || 'text-gray-400';
  };

  const getActionIcon = (action) => {
    const icons = {
      'UPLOAD': '📤',
      'VIEW': '👁️',
      'DOWNLOAD': '⬇️',
      'RENAME': '✏️',
      'MOVE': '📦',
      'DELETE': '🗑️',
      'RESTORE': '♻️',
      'FAVORITE': '⭐',
      'UNFAVORITE': '☆',
    };
    return icons[action] || '📌';
  };

  // Quick Stats Cards
  const statCards = [
    {
      title: 'Total Documents',
      value: stats?.total_documents || 0,
      icon: '📄',
      color: 'from-blue-600 to-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      title: 'Active Documents',
      value: stats?.active_documents || 0,
      icon: '✅',
      color: 'from-emerald-600 to-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20'
    },
    {
      title: 'Favorites',
      value: stats?.favorite_documents || 0,
      icon: '⭐',
      color: 'from-amber-600 to-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20'
    },
    {
      title: 'Storage Used',
      value: `${stats?.total_size_mb || 0} MB`,
      icon: '💾',
      color: 'from-purple-600 to-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080C14]">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#3B82F6]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-[#080C14]"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#080C14] to-[#0D1321] flex flex-col">
      <Header />
      
      <main className="flex-1 container px-4 mx-auto py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#F8FAFC]">
                Welcome back! 👋
              </h1>
              <p className="text-[#F8FAFC]/50 mt-1">
                Here's what's happening with your documents
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/collections">
                <button className="px-4 py-2 bg-[#0D1321] text-[#F8FAFC] rounded-xl border border-[#F8FAFC]/10 hover:border-[#3B82F6]/30 transition-all duration-300 flex items-center gap-2 cursor-pointer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  View Collections
                </button>
              </Link>
              <Link to="/documents/upload">
                <button className="px-4 py-2 bg-gradient-to-r from-[#3B82F6] to-[#0F766E] text-white rounded-xl shadow-lg hover:shadow-[#3B82F6]/30 transition-all duration-300 hover:scale-[1.02] flex items-center gap-2 cursor-pointer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid - Enhanced */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, index) => (
            <div
              key={index}
              className={`relative overflow-hidden bg-[#0D1321] rounded-2xl p-5 border ${card.borderColor} hover:border-transparent transition-all duration-300 group hover:shadow-lg hover:shadow-${card.color.split(' ')[0].replace('from-', '')}/10 hover:-translate-y-1`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[#F8FAFC]/50">{card.title}</p>
                  <p className="text-2xl md:text-3xl font-bold text-[#F8FAFC] mt-1">{card.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-2xl shadow-lg`}>
                  {card.icon}
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link to="/collections">
            <div className="bg-[#0D1321] rounded-2xl p-4 border border-[#F8FAFC]/5 hover:border-[#3B82F6]/30 transition-all duration-300 cursor-pointer group text-center">
              <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#0F766E] flex items-center justify-center text-2xl shadow-lg shadow-[#3B82F6]/20 group-hover:scale-110 transition-transform">
                📚
              </div>
              <p className="text-sm text-[#F8FAFC] font-medium mt-3">Collections</p>
              <p className="text-xs text-[#F8FAFC]/30">Manage your collections</p>
            </div>
          </Link>
          <Link to="/documents">
            <div className="bg-[#0D1321] rounded-2xl p-4 border border-[#F8FAFC]/5 hover:border-[#0F766E]/30 transition-all duration-300 cursor-pointer group text-center">
              <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-[#0F766E] to-[#A3E635] flex items-center justify-center text-2xl shadow-lg shadow-[#0F766E]/20 group-hover:scale-110 transition-transform">
                📄
              </div>
              <p className="text-sm text-[#F8FAFC] font-medium mt-3">Documents</p>
              <p className="text-xs text-[#F8FAFC]/30">View all documents</p>
            </div>
          </Link>
          <Link to="/documents/upload">
            <div className="bg-[#0D1321] rounded-2xl p-4 border border-[#F8FAFC]/5 hover:border-[#A3E635]/30 transition-all duration-300 cursor-pointer group text-center">
              <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-[#A3E635] to-[#F59E0B] flex items-center justify-center text-2xl shadow-lg shadow-[#A3E635]/20 group-hover:scale-110 transition-transform">
                📤
              </div>
              <p className="text-sm text-[#F8FAFC] font-medium mt-3">Upload</p>
              <p className="text-xs text-[#F8FAFC]/30">Upload new document</p>
            </div>
          </Link>
          <Link to="/profile">
            <div className="bg-[#0D1321] rounded-2xl p-4 border border-[#F8FAFC]/5 hover:border-[#EC4899]/30 transition-all duration-300 cursor-pointer group text-center">
              <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-[#EC4899] to-[#8B5CF6] flex items-center justify-center text-2xl shadow-lg shadow-[#EC4899]/20 group-hover:scale-110 transition-transform">
                👤
              </div>
              <p className="text-sm text-[#F8FAFC] font-medium mt-3">Profile</p>
              <p className="text-xs text-[#F8FAFC]/30">Manage your account</p>
            </div>
          </Link>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-[#0D1321] rounded-2xl p-6 border border-[#F8FAFC]/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#F8FAFC] flex items-center gap-2">
                <span>🔄</span> Recent Activity
              </h3>
              <span className="text-xs text-[#F8FAFC]/30">Last 10 actions</span>
            </div>
            {recentActivity.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-[#F8FAFC]/30">No activity yet</p>
                <p className="text-[#F8FAFC]/20 text-sm mt-1">Start uploading documents to see activity</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 bg-[#080C14] rounded-xl hover:bg-[#111827] transition-all duration-300 border border-transparent hover:border-[#F8FAFC]/5"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`text-xl ${getActionColor(activity.action)}`}>
                        {getActionIcon(activity.action)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm text-[#F8FAFC] truncate">{activity.document_title}</p>
                        <p className="text-xs text-[#F8FAFC]/30 capitalize">{activity.action.toLowerCase().replace('_', ' ')}</p>
                      </div>
                    </div>
                    <span className="text-xs text-[#F8FAFC]/30 whitespace-nowrap ml-2">{activity.time_ago}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Popular Documents */}
          <div className="bg-[#0D1321] rounded-2xl p-6 border border-[#F8FAFC]/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#F8FAFC] flex items-center gap-2">
                <span>🔥</span> Popular Documents
              </h3>
              <Link to="/documents" className="text-xs text-[#3B82F6] hover:text-[#0F766E] transition-colors cursor-pointer">
                View all →
              </Link>
            </div>
            {popularDocs.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">📊</div>
                <p className="text-[#F8FAFC]/30">No popular documents</p>
                <p className="text-[#F8FAFC]/20 text-sm mt-1">Documents will appear here as they get views</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                {popularDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-[#080C14] rounded-xl hover:bg-[#111827] transition-all duration-300 border border-transparent hover:border-[#F8FAFC]/5"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl">{getFileIcon(doc.extension)}</span>
                      <div className="min-w-0">
                        <p className="text-sm text-[#F8FAFC] truncate">{doc.title}</p>
                        <p className="text-xs text-[#F8FAFC]/30">{doc.view_count} views • {doc.size_mb} MB</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.is_favorite && (
                        <span className="text-yellow-500 text-sm">⭐</span>
                      )}
                      <Link to={`/documents/${doc.id}`}>
                        <button className="text-xs text-[#3B82F6] hover:text-[#0F766E] transition-colors cursor-pointer">
                          View
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* File Type Distribution */}
        {Object.keys(fileTypes).length > 0 && (
          <div className="mt-6 bg-[#0D1321] rounded-2xl p-6 border border-[#F8FAFC]/5">
            <h3 className="text-lg font-semibold text-[#F8FAFC] flex items-center gap-2 mb-4">
              <span>📊</span> File Type Distribution
            </h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(fileTypes).map(([extension, count]) => (
                <div
                  key={extension}
                  className="flex items-center gap-2 px-4 py-2 bg-[#080C14] rounded-xl border border-[#F8FAFC]/5 hover:border-[#3B82F6]/30 transition-all duration-300"
                >
                  <span className="text-xl">{getFileIcon(extension)}</span>
                  <span className="text-sm text-[#F8FAFC]">{extension}</span>
                  <span className="text-xs text-[#F8FAFC]/30">({count})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default DashboardPage;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Header } from '../../../shared/components/layout/Header';
import { Footer } from '../../../shared/components/layout/Footer';

const API_BASE_URL = 'http://localhost:8000';

const CollectionsPage = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: '📁'
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const iconOptions = ['📁', '📄', '📊', '📈', '📉', '📋', '📌', '📎', '🔍', '⭐', '🎯', '💼', '🏷️', '📚', '🗂️'];

  const colorOptions = [
    '#3B82F6', '#0F766E', '#A3E635', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1'
  ];

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/collections/v1/get`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error('Failed to fetch collections');
      }

      const data = await response.json();
      setCollections(data);
    } catch (error) {
      console.error('Collections error:', error);
      toast.error('Failed to load collections', {
        description: 'Please refresh the page.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/collections/v1/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          color: formData.color,
          icon: formData.icon,
          is_default: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create collection');
      }

      toast.success('Collection Created!', {
        description: `${formData.name} has been created successfully.`,
        duration: 4000,
      });

      setShowCreateModal(false);
      setFormData({ name: '', description: '', color: '#3B82F6', icon: '📁' });
      fetchCollections();
    } catch (error) {
      toast.error('Failed to create collection', {
        description: error.message || 'Please try again.',
        duration: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCollection = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/collections/v1/collection/${selectedCollection.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          color: formData.color,
          icon: formData.icon,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update collection');
      }

      toast.success('Collection Updated!', {
        description: `${formData.name} has been updated successfully.`,
        duration: 4000,
      });

      setShowEditModal(false);
      setSelectedCollection(null);
      setFormData({ name: '', description: '', color: '#3B82F6', icon: '📁' });
      fetchCollections();
    } catch (error) {
      toast.error('Failed to update collection', {
        description: error.message || 'Please try again.',
        duration: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (collection) => {
    setSelectedCollection(collection);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCollection) return;
    
    setDeleting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/collections/v1/collection/${selectedCollection.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete collection');
      }

      toast.success('Collection Deleted!', {
        description: `${selectedCollection.name} has been deleted.`,
        duration: 4000,
      });

      setShowDeleteModal(false);
      setSelectedCollection(null);
      fetchCollections();
    } catch (error) {
      toast.error('Failed to delete collection', {
        description: error.message || 'Please try again.',
        duration: 5000,
      });
    } finally {
      setDeleting(false);
    }
  };

  const openEditModal = (collection) => {
    setSelectedCollection(collection);
    setFormData({
      name: collection.name,
      description: collection.description || '',
      color: collection.color || '#3B82F6',
      icon: collection.icon || '📁',
    });
    setShowEditModal(true);
  };

  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (collection.description && collection.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#080C14] flex flex-col">
      <Header />
      
      <main className="flex-1 container px-4 mx-auto py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#F8FAFC]">Collections</h1>
            <p className="text-[#F8FAFC]/50 mt-1">Organize your documents into collections</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-[#3B82F6] to-[#0F766E] text-white font-semibold rounded-xl shadow-lg hover:shadow-[#3B82F6]/30 transition-all duration-300 hover:scale-[1.02] cursor-pointer flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            New Collection
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-3 bg-[#0D1321] border border-[#F8FAFC]/10 rounded-xl text-[#F8FAFC] placeholder-[#F8FAFC]/30 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all duration-300 cursor-text"
            placeholder="Search collections..."
          />
        </div>

        {/* Collections Grid - FIXED with clickable cards */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
          </div>
        ) : filteredCollections.length === 0 ? (
          <div className="text-center py-12 bg-[#0D1321] rounded-2xl border border-[#F8FAFC]/5">
            <p className="text-[#F8FAFC]/30">
              {searchTerm ? 'No collections match your search' : 'No collections yet'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-[#3B82F6] hover:text-[#0F766E] transition-colors mt-2 inline-block cursor-pointer"
              >
                Create your first collection
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCollections.map((collection) => (
              <div
                key={collection.id}
                className="group bg-[#0D1321] rounded-2xl border border-[#F8FAFC]/5 hover:border-[#3B82F6]/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#3B82F6]/5 relative"
              >
                {/* Clickable area - entire card links to collection detail */}
                <Link 
                  to={`/collections/${collection.id}`} 
                  className="block p-6 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ backgroundColor: `${collection.color || '#3B82F6'}20` }}
                      >
                        {collection.icon || '📁'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#F8FAFC] group-hover:text-[#3B82F6] transition-colors">
                          {collection.name}
                        </h3>
                        <p className="text-xs text-[#F8FAFC]/30">
                          {collection.documents?.length || 0} documents
                        </p>
                      </div>
                    </div>
                    {/* Action buttons - positioned to not interfere with card click */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openEditModal(collection);
                        }}
                        className="p-1.5 rounded-lg hover:bg-[#F8FAFC]/5 text-[#F8FAFC]/40 hover:text-[#F8FAFC] transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openDeleteModal(collection);
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#F8FAFC]/40 hover:text-red-500 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {collection.description && (
                    <p className="text-sm text-[#F8FAFC]/40 mt-3 line-clamp-2">
                      {collection.description}
                    </p>
                  )}
                  <div className="mt-4 pt-4 border-t border-[#F8FAFC]/5 flex items-center justify-between">
                    <span className="text-xs text-[#F8FAFC]/20">
                      Created {new Date(collection.created_at).toLocaleDateString()}
                    </span>
                    {collection.is_default && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[#3B82F6]/20 text-[#3B82F6]">
                        Default
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Collection Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0D1321] rounded-2xl p-8 max-w-md w-full border border-[#F8FAFC]/5 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#F8FAFC]">Create Collection</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#F8FAFC]/40 hover:text-[#F8FAFC] transition-colors cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateCollection}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#F8FAFC]/70 mb-1.5 cursor-default">
                  Collection Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[#080C14] border border-[#F8FAFC]/10 rounded-xl text-[#F8FAFC] placeholder-[#F8FAFC]/30 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all duration-300 cursor-text"
                  placeholder="Enter collection name"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-[#F8FAFC]/70 mb-1.5 cursor-default">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-[#080C14] border border-[#F8FAFC]/10 rounded-xl text-[#F8FAFC] placeholder-[#F8FAFC]/30 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all duration-300 cursor-text resize-none"
                  placeholder="Enter collection description"
                  rows="3"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-[#F8FAFC]/70 mb-1.5 cursor-default">
                  Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`w-10 h-10 rounded-xl text-xl transition-all duration-300 cursor-pointer ${
                        formData.icon === icon
                          ? 'bg-[#3B82F6] text-white scale-110'
                          : 'bg-[#080C14] text-[#F8FAFC]/40 hover:bg-[#1A2332] hover:text-[#F8FAFC]'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-[#F8FAFC]/70 mb-1.5 cursor-default">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full transition-all duration-300 cursor-pointer ${
                        formData.color === color
                          ? 'ring-2 ring-white scale-110'
                          : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-[#080C14] text-[#F8FAFC]/60 font-medium rounded-xl border border-[#F8FAFC]/10 hover:bg-[#1A2332] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formData.name.trim()}
                  className="flex-1 py-3 bg-gradient-to-r from-[#3B82F6] to-[#0F766E] text-white font-semibold rounded-xl shadow-lg hover:shadow-[#3B82F6]/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {submitting ? 'Creating...' : 'Create Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Collection Modal */}
      {showEditModal && selectedCollection && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0D1321] rounded-2xl p-8 max-w-md w-full border border-[#F8FAFC]/5 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#F8FAFC]">Edit Collection</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-[#F8FAFC]/40 hover:text-[#F8FAFC] transition-colors cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateCollection}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#F8FAFC]/70 mb-1.5 cursor-default">
                  Collection Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[#080C14] border border-[#F8FAFC]/10 rounded-xl text-[#F8FAFC] placeholder-[#F8FAFC]/30 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all duration-300 cursor-text"
                  placeholder="Enter collection name"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-[#F8FAFC]/70 mb-1.5 cursor-default">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-[#080C14] border border-[#F8FAFC]/10 rounded-xl text-[#F8FAFC] placeholder-[#F8FAFC]/30 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all duration-300 cursor-text resize-none"
                  placeholder="Enter collection description"
                  rows="3"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-[#F8FAFC]/70 mb-1.5 cursor-default">
                  Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`w-10 h-10 rounded-xl text-xl transition-all duration-300 cursor-pointer ${
                        formData.icon === icon
                          ? 'bg-[#3B82F6] text-white scale-110'
                          : 'bg-[#080C14] text-[#F8FAFC]/40 hover:bg-[#1A2332] hover:text-[#F8FAFC]'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-[#F8FAFC]/70 mb-1.5 cursor-default">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full transition-all duration-300 cursor-pointer ${
                        formData.color === color
                          ? 'ring-2 ring-white scale-110'
                          : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 bg-[#080C14] text-[#F8FAFC]/60 font-medium rounded-xl border border-[#F8FAFC]/10 hover:bg-[#1A2332] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formData.name.trim()}
                  className="flex-1 py-3 bg-gradient-to-r from-[#3B82F6] to-[#0F766E] text-white font-semibold rounded-xl shadow-lg hover:shadow-[#3B82F6]/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {submitting ? 'Updating...' : 'Update Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCollection && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0D1321] rounded-2xl p-8 max-w-md w-full border border-[#F8FAFC]/5 shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-[#F8FAFC] text-center mb-3">
              Delete Collection?
            </h2>
            <p className="text-[#F8FAFC]/60 text-center mb-2">
              Are you sure you want to delete
            </p>
            <p className="text-[#F8FAFC] font-semibold text-center text-lg mb-2">
              "{selectedCollection.name}"
            </p>
            <p className="text-[#F8FAFC]/40 text-center text-sm mb-6">
              This action cannot be undone. All documents in this collection will also be deleted.
            </p>

            <div className="bg-[#080C14] rounded-xl p-4 mb-6 border border-[#F8FAFC]/5">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${selectedCollection.color || '#3B82F6'}20` }}
                >
                  {selectedCollection.icon || '📁'}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#F8FAFC]">{selectedCollection.name}</p>
                  <p className="text-xs text-[#F8FAFC]/30">
                    {selectedCollection.documents?.length || 0} documents
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedCollection(null);
                }}
                className="flex-1 py-3 bg-[#080C14] text-[#F8FAFC]/60 font-medium rounded-xl border border-[#F8FAFC]/10 hover:bg-[#1A2332] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-red-500/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete Collection'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CollectionsPage;
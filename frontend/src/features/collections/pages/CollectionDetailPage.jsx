import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Header } from '../../../shared/components/layout/Header';
import { Footer } from '../../../shared/components/layout/Footer';

const API_BASE_URL = 'http://localhost:8000';

const CollectionDetailPage = () => {
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [collection, setCollection] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [allCollections, setAllCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('active');
  
  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  
  // Rename Modal State
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  
  // Move Modal State
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  
  // Preview Modal State
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [previewObjectUrl, setPreviewObjectUrl] = useState(null);
  const [textContent, setTextContent] = useState('');
  
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCollectionDetail();
    fetchDocuments();
    fetchAllCollections();
    
    return () => {
      if (previewObjectUrl) {
        window.URL.revokeObjectURL(previewObjectUrl);
      }
    };
  }, [collectionId]);

  const fetchCollectionDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/collections/v1/collection/${collectionId}`, {
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
        throw new Error('Failed to fetch collection');
      }

      const data = await response.json();
      setCollection(data);
    } catch (error) {
      console.error('Collection detail error:', error);
      toast.error('Failed to load collection');
      navigate('/collections');
    }
  };

  const fetchAllCollections = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/collections/v1/get`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch collections');

      const data = await response.json();
      setAllCollections(data.filter(c => c.id !== parseInt(collectionId)));
    } catch (error) {
      console.error('Collections error:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/documents/v1/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch documents');

      const data = await response.json();
      const collectionDocs = data.filter(doc => 
        doc.collection_id === parseInt(collectionId)
      );
      setDocuments(collectionDocs);
    } catch (error) {
      console.error('Documents error:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  // Get active documents (not in trash)
  const activeDocuments = documents.filter(doc => doc.document_status !== 'TRASHED');
  
  // Get trashed documents
  const trashedDocuments = documents.filter(doc => doc.document_status === 'TRASHED');

  const filteredActiveDocuments = activeDocuments.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTrashedDocuments = trashedDocuments.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper functions for file types
  const isTextFile = (extension) => {
    const textExtensions = ['.txt', '.csv', '.md', '.json', '.xml', '.html', '.css', '.js', '.py', '.java', '.cpp', '.c'];
    return textExtensions.includes(extension?.toLowerCase() || '');
  };

  const isImageFile = (extension) => {
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp', '.ico'];
    return imageExtensions.includes(extension?.toLowerCase() || '');
  };

  const isPDFFile = (extension) => {
    return extension?.toLowerCase() === '.pdf';
  };

  const isOfficeFile = (extension) => {
    const officeExtensions = ['.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt'];
    return officeExtensions.includes(extension?.toLowerCase() || '');
  };

  const isVideoFile = (extension) => {
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm'];
    return videoExtensions.includes(extension?.toLowerCase() || '');
  };

  const isAudioFile = (extension) => {
    const audioExtensions = ['.mp3', '.wav', '.aac', '.flac', '.ogg', '.wma'];
    return audioExtensions.includes(extension?.toLowerCase() || '');
  };

  // Handle file selection - opens upload modal
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'Maximum file size is 20MB.',
      });
      return;
    }

    const allowedExtensions = ['.pdf', '.docx', '.png', '.jpg', '.jpeg', '.txt', '.csv', '.xls', '.xlsx'];
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      toast.error('Invalid file type', {
        description: `Allowed files: ${allowedExtensions.join(', ')}`,
      });
      return;
    }

    setSelectedFile(file);
    setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
    setShowUploadModal(true);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle actual file upload with title
  const handleUploadWithTitle = async () => {
    if (!selectedFile) return;
    if (!uploadTitle.trim()) {
      toast.warning('Title Required', {
        description: 'Please enter a title for the document.',
      });
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', uploadTitle.trim());
      formData.append('file', selectedFile);
      formData.append('collection_id', collectionId);
      formData.append('is_favorite', 'false');

      const response = await fetch(`${API_BASE_URL}/documents/v1/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      toast.success('Document Uploaded!', {
        description: `${uploadTitle} has been uploaded successfully.`,
        duration: 4000,
      });

      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadTitle('');
      fetchDocuments();
      fetchCollectionDetail();
    } catch (error) {
      toast.error('Upload Failed', {
        description: error.message || 'Please try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  // Preview Document Handler
  const handlePreviewDocument = async (doc) => {
    setPreviewLoading(true);
    setPreviewError(false);
    setPreviewObjectUrl(null);
    setTextContent('');
    setPreviewDocument(doc);
    setShowPreviewModal(true);

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/documents/v1/document/${doc.id}/view`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': '*/*',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load preview: ${response.status}`);
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('File is empty (0 bytes)');
      }

      const fileExtension = doc.extension?.toLowerCase() || '';
      
      if (fileExtension === '.pdf') {
        const objectUrl = window.URL.createObjectURL(blob);
        setPreviewObjectUrl(objectUrl);
      } else if (isImageFile(fileExtension)) {
        const objectUrl = window.URL.createObjectURL(blob);
        setPreviewObjectUrl(objectUrl);
      } else if (isTextFile(fileExtension)) {
        const text = await blob.text();
        setTextContent(text);
        setPreviewObjectUrl(null);
      } else if (isVideoFile(fileExtension) || isAudioFile(fileExtension)) {
        const objectUrl = window.URL.createObjectURL(blob);
        setPreviewObjectUrl(objectUrl);
      } else {
        setPreviewObjectUrl(null);
      }
    } catch (error) {
      console.error('Preview error:', error);
      setPreviewError(true);
      toast.error('Preview Failed', {
        description: error.message || 'Could not load document preview.',
        duration: 5000,
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  // Download Document Handler
  const handleDownloadDocument = async (doc) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/documents/v1/document/${doc.id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status}`);
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('File is empty (0 bytes)');
      }

      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      
      const fileName = doc.original_filename || `${doc.title}${doc.extension || ''}`;
      link.download = fileName;
      
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);

      toast.success('Download Started!', {
        description: `${fileName} is being downloaded.`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Download Failed', {
        description: error.message || 'Could not download the document. Please try again.',
        duration: 5000,
      });
    }
  };

  // ========== FIXED API ENDPOINTS ==========

  // FIXED: Rename Document
  const handleRenameDocument = async (e) => {
    e.preventDefault();
    if (!selectedDocument || !newTitle.trim()) return;

    setDeleting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/documents/v1/document/${selectedDocument.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Rename failed');
      }

      toast.success('Document Renamed!', {
        description: `Document renamed to "${newTitle.trim()}"`,
        duration: 4000,
      });

      setShowRenameModal(false);
      setSelectedDocument(null);
      setNewTitle('');
      fetchDocuments();
    } catch (error) {
      toast.error('Rename Failed', {
        description: error.message || 'Please try again.',
        duration: 5000,
      });
    } finally {
      setDeleting(false);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = async (doc) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/documents/v1/document/${doc.id}/favorite`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_favorite: !doc.is_favorite }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update favorite');
      }

      toast.success(doc.is_favorite ? 'Removed from favorites' : 'Added to favorites');
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to update favorite', {
        description: error.message || 'Please try again.',
        duration: 3000,
      });
    }
  };

  // FIXED: Move to Trash
  const handleMoveToTrash = async () => {
    if (!selectedDocument) return;

    setDeleting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/documents/v1/document/${selectedDocument.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to move to trash');
      }

      toast.success('Document Moved to Trash!', {
        description: `${selectedDocument.title} has been moved to trash.`,
        duration: 4000,
      });

      setShowDeleteModal(false);
      setSelectedDocument(null);
      fetchDocuments();
      fetchCollectionDetail();
    } catch (error) {
      toast.error('Move to Trash Failed', {
        description: error.message || 'Please try again.',
        duration: 5000,
      });
    } finally {
      setDeleting(false);
    }
  };

  // FIXED: Permanent Delete
  const handlePermanentDelete = async () => {
    if (!selectedDocument) return;

    setDeleting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/documents/v1/document/${selectedDocument.id}/permanent`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete permanently');
      }

      toast.success('Document Deleted Permanently!', {
        description: `${selectedDocument.title} has been permanently deleted.`,
        duration: 4000,
      });

      setShowDeleteModal(false);
      setSelectedDocument(null);
      fetchDocuments();
      fetchCollectionDetail();
    } catch (error) {
      toast.error('Delete Failed', {
        description: error.message || 'Please try again.',
        duration: 5000,
      });
    } finally {
      setDeleting(false);
    }
  };

  // FIXED: Restore Document
  const handleRestoreDocument = async (doc) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/documents/v1/document/${doc.id}/restore`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to restore document');
      }

      toast.success('Document Restored!', {
        description: `${doc.title} has been restored from trash.`,
        duration: 4000,
      });

      fetchDocuments();
      fetchCollectionDetail();
    } catch (error) {
      toast.error('Restore Failed', {
        description: error.message || 'Please try again.',
        duration: 5000,
      });
    }
  };

  // FIXED: Move Document to Another Collection
  const handleMoveDocument = async (e) => {
    e.preventDefault();
    if (!selectedDocument || !selectedCollectionId) return;

    setDeleting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/documents/v1/document/${selectedDocument.id}/move-collection`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collection_id: parseInt(selectedCollectionId) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to move document');
      }

      toast.success('Document Moved!', {
        description: `${selectedDocument.title} has been moved to another collection.`,
        duration: 4000,
      });

      setShowMoveModal(false);
      setSelectedDocument(null);
      setSelectedCollectionId('');
      fetchDocuments();
      fetchCollectionDetail();
    } catch (error) {
      toast.error('Move Failed', {
        description: error.message || 'Please try again.',
        duration: 5000,
      });
    } finally {
      setDeleting(false);
    }
  };

  const openRenameModal = (doc) => {
    setSelectedDocument(doc);
    setNewTitle(doc.title);
    setShowRenameModal(true);
  };

  const openDeleteModal = (doc) => {
    setSelectedDocument(doc);
    setShowDeleteModal(true);
  };

  const openMoveModal = (doc) => {
    setSelectedDocument(doc);
    setSelectedCollectionId('');
    setShowMoveModal(true);
  };

  const openPreviewModal = (doc) => {
    handlePreviewDocument(doc);
  };

  const closePreviewModal = () => {
    if (previewObjectUrl) {
      window.URL.revokeObjectURL(previewObjectUrl);
    }
    setShowPreviewModal(false);
    setPreviewDocument(null);
    setPreviewObjectUrl(null);
    setTextContent('');
    setPreviewError(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
      '.gif': '🖼️',
      '.svg': '🖼️',
      '.webp': '🖼️',
      '.txt': '📃',
      '.csv': '📊',
      '.json': '📋',
      '.xml': '📋',
      '.html': '🌐',
      '.css': '🎨',
      '.js': '⚡',
      '.py': '🐍',
      '.java': '☕',
      '.mp4': '🎬',
      '.mp3': '🎵',
      '.wav': '🎵',
    };
    return icons[extension?.toLowerCase()] || '📎';
  };

  const getFileType = (extension) => {
    const types = {
      '.pdf': 'PDF Document',
      '.docx': 'Word Document',
      '.doc': 'Word Document',
      '.xlsx': 'Excel Spreadsheet',
      '.xls': 'Excel Spreadsheet',
      '.pptx': 'PowerPoint Presentation',
      '.ppt': 'PowerPoint Presentation',
      '.png': 'Image',
      '.jpg': 'Image',
      '.jpeg': 'Image',
      '.gif': 'Image',
      '.svg': 'Image',
      '.webp': 'Image',
      '.txt': 'Text File',
      '.csv': 'CSV File',
      '.json': 'JSON File',
      '.xml': 'XML File',
      '.html': 'HTML File',
      '.css': 'CSS File',
      '.js': 'JavaScript File',
      '.py': 'Python File',
      '.java': 'Java File',
      '.mp4': 'Video',
      '.mp3': 'Audio',
      '.wav': 'Audio',
    };
    return types[extension?.toLowerCase()] || 'Document';
  };

  const renderDocumentCard = (doc) => (
    <div
      key={doc.id}
      className="group bg-[#0D1321] rounded-xl p-4 border border-[#F8FAFC]/5 hover:border-[#3B82F6]/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#3B82F6]/5"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => openPreviewModal(doc)}>
          <div className="w-12 h-12 bg-[#080C14] rounded-lg flex items-center justify-center text-2xl">
            {getFileIcon(doc.extension)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#F8FAFC] truncate group-hover:text-[#3B82F6] transition-colors">
              {doc.title}
            </p>
            <p className="text-xs text-[#F8FAFC]/30">
              {formatFileSize(doc.file_size)}
            </p>
          </div>
        </div>
        <button
          onClick={() => handleToggleFavorite(doc)}
          className={`mt-1 transition-colors cursor-pointer ${
            doc.is_favorite ? 'text-yellow-500' : 'text-[#F8FAFC]/20 hover:text-yellow-500'
          }`}
          title={doc.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg className="w-5 h-5" fill={doc.is_favorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
      </div>
      <div className="mt-3 pt-3 border-t border-[#F8FAFC]/5 flex items-center justify-between">
        <button
          onClick={() => openPreviewModal(doc)}
          className="text-xs text-[#3B82F6] hover:text-[#0F766E] transition-colors cursor-pointer flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Preview
        </button>
        <div className="flex gap-1">
          {activeTab === 'active' && (
            <>
              <button
                onClick={() => openMoveModal(doc)}
                className="p-1 rounded hover:bg-[#F8FAFC]/5 text-[#F8FAFC]/30 hover:text-[#3B82F6] transition-colors cursor-pointer"
                title="Move"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>
              <button
                onClick={() => openRenameModal(doc)}
                className="p-1 rounded hover:bg-[#F8FAFC]/5 text-[#F8FAFC]/30 hover:text-[#F8FAFC] transition-colors cursor-pointer"
                title="Rename"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => openDeleteModal(doc)}
                className="p-1 rounded hover:bg-red-500/10 text-[#F8FAFC]/30 hover:text-red-500 transition-colors cursor-pointer"
                title="Move to Trash"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
          {activeTab === 'trash' && (
            <>
              <button
                onClick={() => handleRestoreDocument(doc)}
                className="p-1 rounded hover:bg-green-500/10 text-[#F8FAFC]/30 hover:text-green-500 transition-colors cursor-pointer"
                title="Restore"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={() => openDeleteModal(doc)}
                className="p-1 rounded hover:bg-red-500/10 text-[#F8FAFC]/30 hover:text-red-500 transition-colors cursor-pointer"
                title="Delete Permanently"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderDocumentRow = (doc) => (
    <tr key={doc.id} className="hover:bg-[#111827] transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => openPreviewModal(doc)}>
          <span className="text-xl">{getFileIcon(doc.extension)}</span>
          <span className="text-sm text-[#F8FAFC]">{doc.title}</span>
          {doc.is_favorite && (
            <span className="text-yellow-500 text-xs">⭐</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-[#F8FAFC]/40">{formatFileSize(doc.file_size)}</td>
      <td className="px-6 py-4 text-sm text-[#F8FAFC]/40">
        {new Date(doc.created_at).toLocaleDateString()}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => openPreviewModal(doc)}
            className="p-1.5 rounded hover:bg-[#F8FAFC]/5 text-[#F8FAFC]/30 hover:text-[#3B82F6] transition-colors cursor-pointer"
            title="Preview"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            onClick={() => handleToggleFavorite(doc)}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              doc.is_favorite ? 'text-yellow-500' : 'text-[#F8FAFC]/20 hover:text-yellow-500'
            }`}
            title={doc.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg className="w-4 h-4" fill={doc.is_favorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
          {activeTab === 'active' && (
            <>
              <button
                onClick={() => openMoveModal(doc)}
                className="p-1.5 rounded hover:bg-[#F8FAFC]/5 text-[#F8FAFC]/30 hover:text-[#3B82F6] transition-colors cursor-pointer"
                title="Move"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>
              <button
                onClick={() => openRenameModal(doc)}
                className="p-1.5 rounded hover:bg-[#F8FAFC]/5 text-[#F8FAFC]/30 hover:text-[#F8FAFC] transition-colors cursor-pointer"
                title="Rename"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => openDeleteModal(doc)}
                className="p-1.5 rounded hover:bg-red-500/10 text-[#F8FAFC]/30 hover:text-red-500 transition-colors cursor-pointer"
                title="Move to Trash"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
          {activeTab === 'trash' && (
            <>
              <button
                onClick={() => handleRestoreDocument(doc)}
                className="p-1.5 rounded hover:bg-green-500/10 text-[#F8FAFC]/30 hover:text-green-500 transition-colors cursor-pointer"
                title="Restore"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={() => openDeleteModal(doc)}
                className="p-1.5 rounded hover:bg-red-500/10 text-[#F8FAFC]/30 hover:text-red-500 transition-colors cursor-pointer"
                title="Delete Permanently"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080C14]">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
        </div>
        <Footer />
      </div>
    );
  }

  const currentDocuments = activeTab === 'active' ? filteredActiveDocuments : filteredTrashedDocuments;
  const isTrashEmpty = activeTab === 'trash' && filteredTrashedDocuments.length === 0;

  return (
    <div className="min-h-screen bg-[#080C14] flex flex-col">
      <Header />
      
      <main className="flex-1 container px-4 mx-auto py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#F8FAFC]/40 mb-6">
          <Link to="/collections" className="hover:text-[#3B82F6] transition-colors cursor-pointer">
            Collections
          </Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-[#F8FAFC]">{collection?.name}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: `${collection?.color || '#3B82F6'}20` }}
            >
              {collection?.icon || '📁'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#F8FAFC]">{collection?.name}</h1>
              <p className="text-[#F8FAFC]/50 text-sm">
                {activeDocuments.length} {activeDocuments.length === 1 ? 'document' : 'documents'}
                {trashedDocuments.length > 0 && ` • ${trashedDocuments.length} in trash`}
                {collection?.description && ` • ${collection.description}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex bg-[#0D1321] rounded-xl p-1 border border-[#F8FAFC]/5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-300 cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#3B82F6]/20 text-[#3B82F6]'
                    : 'text-[#F8FAFC]/30 hover:text-[#F8FAFC]'
                }`}
                title="Grid View"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-300 cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-[#3B82F6]/20 text-[#3B82F6]'
                    : 'text-[#F8FAFC]/30 hover:text-[#F8FAFC]'
                }`}
                title="List View"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-6 py-3 bg-gradient-to-r from-[#3B82F6] to-[#0F766E] text-white font-semibold rounded-xl shadow-lg hover:shadow-[#3B82F6]/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload Document
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.docx,.png,.jpg,.jpeg,.txt,.csv,.xls,.xlsx"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#0D1321] rounded-xl p-1 border border-[#F8FAFC]/5 mb-6 max-w-xs">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
              activeTab === 'active'
                ? 'bg-gradient-to-r from-[#3B82F6] to-[#0F766E] text-white shadow-lg shadow-[#3B82F6]/20'
                : 'text-[#F8FAFC]/50 hover:text-[#F8FAFC]'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Active ({activeDocuments.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab('trash')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
              activeTab === 'trash'
                ? 'bg-gradient-to-r from-[#3B82F6] to-[#0F766E] text-white shadow-lg shadow-[#3B82F6]/20'
                : 'text-[#F8FAFC]/50 hover:text-[#F8FAFC]'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Trash ({trashedDocuments.length})
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#F8FAFC]/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md pl-12 pr-4 py-3 bg-[#0D1321] border border-[#F8FAFC]/10 rounded-xl text-[#F8FAFC] placeholder-[#F8FAFC]/30 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all duration-300 cursor-text"
              placeholder={activeTab === 'active' ? 'Search documents...' : 'Search trashed documents...'}
            />
          </div>
        </div>

        {/* Documents Grid/List */}
        {activeTab === 'active' && activeDocuments.length === 0 ? (
          <div className="text-center py-16 bg-[#0D1321] rounded-2xl border border-[#F8FAFC]/5">
            <div className="text-6xl mb-4">📂</div>
            <p className="text-[#F8FAFC]/30 text-lg">This collection is empty</p>
            <p className="text-[#F8FAFC]/20 text-sm mt-2">Upload your first document to get started</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 text-[#3B82F6] hover:text-[#0F766E] transition-colors cursor-pointer"
            >
              Upload a document →
            </button>
          </div>
        ) : isTrashEmpty ? (
          <div className="text-center py-16 bg-[#0D1321] rounded-2xl border border-[#F8FAFC]/5">
            <div className="text-6xl mb-4">🗑️</div>
            <p className="text-[#F8FAFC]/30 text-lg">Trash is empty</p>
            <p className="text-[#F8FAFC]/20 text-sm mt-2">Deleted documents will appear here</p>
          </div>
        ) : currentDocuments.length === 0 ? (
          <div className="text-center py-12 bg-[#0D1321] rounded-2xl border border-[#F8FAFC]/5">
            <p className="text-[#F8FAFC]/30">No documents match your search</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentDocuments.map(renderDocumentCard)}
          </div>
        ) : (
          <div className="bg-[#0D1321] rounded-xl border border-[#F8FAFC]/5 overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#080C14] border-b border-[#F8FAFC]/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#F8FAFC]/30 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#F8FAFC]/30 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#F8FAFC]/30 uppercase tracking-wider">Uploaded</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#F8FAFC]/30 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8FAFC]/5">
                {currentDocuments.map(renderDocumentRow)}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Upload Modal */}
      {showUploadModal && selectedFile && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0D1321] rounded-2xl p-8 max-w-md w-full border border-[#F8FAFC]/5 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#F8FAFC]">Upload Document</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setUploadTitle('');
                }}
                className="text-[#F8FAFC]/40 hover:text-[#F8FAFC] transition-colors cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4 p-4 bg-[#080C14] rounded-xl border border-[#F8FAFC]/5">
              <p className="text-sm text-[#F8FAFC]/60">Selected File</p>
              <p className="text-[#F8FAFC] font-medium">{selectedFile.name}</p>
              <p className="text-xs text-[#F8FAFC]/30">{formatFileSize(selectedFile.size)}</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleUploadWithTitle(); }}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#F8FAFC]/70 mb-1.5 cursor-default">
                  Document Title *
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-[#080C14] border border-[#F8FAFC]/10 rounded-xl text-[#F8FAFC] placeholder-[#F8FAFC]/30 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all duration-300 cursor-text"
                  placeholder="Enter document title"
                  required
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                    setUploadTitle('');
                  }}
                  className="flex-1 py-3 bg-[#080C14] text-[#F8FAFC]/60 font-medium rounded-xl border border-[#F8FAFC]/10 hover:bg-[#1A2332] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadTitle.trim()}
                  className="flex-1 py-3 bg-gradient-to-r from-[#3B82F6] to-[#0F766E] text-white font-semibold rounded-xl shadow-lg hover:shadow-[#3B82F6]/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Uploading...
                    </span>
                  ) : (
                    'Upload'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {showRenameModal && selectedDocument && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0D1321] rounded-2xl p-8 max-w-md w-full border border-[#F8FAFC]/5 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#F8FAFC]">Rename Document</h2>
              <button
                onClick={() => setShowRenameModal(false)}
                className="text-[#F8FAFC]/40 hover:text-[#F8FAFC] transition-colors cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleRenameDocument}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#F8FAFC]/70 mb-1.5 cursor-default">
                  Document Name
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-[#080C14] border border-[#F8FAFC]/10 rounded-xl text-[#F8FAFC] placeholder-[#F8FAFC]/30 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all duration-300 cursor-text"
                  placeholder="Enter new document name"
                  required
                  autoFocus
                />
                <p className="text-xs text-[#F8FAFC]/30 mt-1.5">
                  Current: {selectedDocument.title}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowRenameModal(false)}
                  className="flex-1 py-3 bg-[#080C14] text-[#F8FAFC]/60 font-medium rounded-xl border border-[#F8FAFC]/10 hover:bg-[#1A2332] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleting || !newTitle.trim() || newTitle === selectedDocument.title}
                  className="flex-1 py-3 bg-gradient-to-r from-[#3B82F6] to-[#0F766E] text-white font-semibold rounded-xl shadow-lg hover:shadow-[#3B82F6]/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {deleting ? 'Renaming...' : 'Rename'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Move to Collection Modal */}
      {showMoveModal && selectedDocument && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0D1321] rounded-2xl p-8 max-w-md w-full border border-[#F8FAFC]/5 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#F8FAFC]">Move Document</h2>
              <button
                onClick={() => setShowMoveModal(false)}
                className="text-[#F8FAFC]/40 hover:text-[#F8FAFC] transition-colors cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4 p-3 bg-[#080C14] rounded-xl border border-[#F8FAFC]/5">
              <p className="text-sm text-[#F8FAFC]/60">Moving</p>
              <p className="text-[#F8FAFC] font-medium">{selectedDocument.title}</p>
            </div>

            <form onSubmit={handleMoveDocument}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#F8FAFC]/70 mb-1.5 cursor-default">
                  Select Collection
                </label>
                <select
                  value={selectedCollectionId}
                  onChange={(e) => setSelectedCollectionId(e.target.value)}
                  className="w-full px-4 py-3 bg-[#080C14] border border-[#F8FAFC]/10 rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all duration-300 cursor-pointer"
                  required
                >
                  <option value="">Select a collection...</option>
                  {allCollections.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.icon || '📁'} {col.name}
                    </option>
                  ))}
                </select>
                {allCollections.length === 0 && (
                  <p className="text-xs text-[#F8FAFC]/30 mt-2">
                    No other collections available. Create one first.
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowMoveModal(false)}
                  className="flex-1 py-3 bg-[#080C14] text-[#F8FAFC]/60 font-medium rounded-xl border border-[#F8FAFC]/10 hover:bg-[#1A2332] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleting || !selectedCollectionId || allCollections.length === 0}
                  className="flex-1 py-3 bg-gradient-to-r from-[#3B82F6] to-[#0F766E] text-white font-semibold rounded-xl shadow-lg hover:shadow-[#3B82F6]/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {deleting ? 'Moving...' : 'Move Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedDocument && (
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
              {activeTab === 'trash' ? 'Delete Permanently?' : 'Move to Trash?'}
            </h2>
            <p className="text-[#F8FAFC]/60 text-center mb-2">
              Are you sure you want to {activeTab === 'trash' ? 'permanently delete' : 'move to trash'}
            </p>
            <p className="text-[#F8FAFC] font-semibold text-center text-lg mb-2">
              "{selectedDocument.title}"
            </p>
            <p className="text-[#F8FAFC]/40 text-center text-sm mb-6">
              {activeTab === 'trash' 
                ? 'This action cannot be undone. The document will be permanently deleted.'
                : 'This document will be moved to trash and can be restored later.'}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 bg-[#080C14] text-[#F8FAFC]/60 font-medium rounded-xl border border-[#F8FAFC]/10 hover:bg-[#1A2332] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={activeTab === 'trash' ? handlePermanentDelete : handleMoveToTrash}
                disabled={deleting}
                className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-red-500/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {activeTab === 'trash' ? 'Deleting...' : 'Moving to Trash...'}
                  </>
                ) : (
                  activeTab === 'trash' ? 'Delete Permanently' : 'Move to Trash'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewDocument && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0D1321] rounded-2xl max-w-4xl w-full max-h-[90vh] border border-[#F8FAFC]/5 shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#F8FAFC]/5 flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl flex-shrink-0">{getFileIcon(previewDocument.extension)}</span>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-[#F8FAFC] truncate">{previewDocument.title}</h3>
                  <p className="text-xs text-[#F8FAFC]/30">
                    {getFileType(previewDocument.extension)} • {formatFileSize(previewDocument.file_size)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <button
                  onClick={() => handleDownloadDocument(previewDocument)}
                  className="px-4 py-2 bg-[#3B82F6] text-white text-sm font-medium rounded-lg hover:bg-[#2563EB] transition-colors cursor-pointer flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
                <button
                  onClick={closePreviewModal}
                  className="text-[#F8FAFC]/40 hover:text-[#F8FAFC] transition-colors cursor-pointer p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 bg-[#080C14]">
              {previewLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
                </div>
              ) : previewError ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <svg className="w-16 h-16 text-[#F8FAFC]/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-[#F8FAFC]/50">Failed to load preview</p>
                  <button
                    onClick={() => handlePreviewDocument(previewDocument)}
                    className="mt-4 text-[#3B82F6] hover:text-[#0F766E] transition-colors cursor-pointer"
                  >
                    Try Again
                  </button>
                </div>
              ) : previewObjectUrl ? (
                isPDFFile(previewDocument.extension) ? (
                  <iframe
                    src={previewObjectUrl}
                    className="w-full h-[75vh] rounded-lg"
                    title={previewDocument.title}
                    style={{ border: 'none', backgroundColor: '#ffffff' }}
                    allow="fullscreen"
                  />
                ) : isImageFile(previewDocument.extension) ? (
                  <div className="flex items-center justify-center h-full min-h-[300px]">
                    <img
                      src={previewObjectUrl}
                      alt={previewDocument.title}
                      className="max-w-full max-h-[70vh] object-contain rounded-lg"
                    />
                  </div>
                ) : isVideoFile(previewDocument.extension) ? (
                  <div className="flex items-center justify-center h-full min-h-[300px]">
                    <video
                      src={previewObjectUrl}
                      controls
                      className="max-w-full max-h-[70vh] rounded-lg"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : isAudioFile(previewDocument.extension) ? (
                  <div className="flex flex-col items-center justify-center h-64">
                    <div className="text-6xl mb-4">🎵</div>
                    <audio
                      src={previewObjectUrl}
                      controls
                      className="w-full max-w-md"
                    >
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <span className="text-6xl mb-4">{getFileIcon(previewDocument.extension)}</span>
                    <p className="text-[#F8FAFC]/40 font-medium">{getFileType(previewDocument.extension)}</p>
                    <p className="text-[#F8FAFC]/20 text-sm mt-2">Preview not available</p>
                    <button
                      onClick={() => handleDownloadDocument(previewDocument)}
                      className="mt-4 px-6 py-2 bg-[#3B82F6] text-white text-sm font-medium rounded-lg hover:bg-[#2563EB] transition-colors cursor-pointer"
                    >
                      Download File
                    </button>
                  </div>
                )
              ) : isTextFile(previewDocument.extension) && textContent ? (
                <div className="bg-[#0D1321] rounded-lg p-4 border border-[#F8FAFC]/5">
                  <pre className="text-[#F8FAFC]/80 text-sm whitespace-pre-wrap break-words font-mono max-h-[60vh] overflow-auto">
                    {textContent}
                  </pre>
                </div>
              ) : isOfficeFile(previewDocument.extension) ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <span className="text-6xl mb-4">{getFileIcon(previewDocument.extension)}</span>
                  <p className="text-[#F8FAFC]/40 font-medium">{getFileType(previewDocument.extension)}</p>
                  <p className="text-[#F8FAFC]/20 text-sm mt-2">
                    Preview not available for this file type
                  </p>
                  <button
                    onClick={() => handleDownloadDocument(previewDocument)}
                    className="mt-4 px-6 py-2 bg-[#3B82F6] text-white text-sm font-medium rounded-lg hover:bg-[#2563EB] transition-colors cursor-pointer"
                  >
                    Download File
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <span className="text-6xl mb-4">{getFileIcon(previewDocument.extension)}</span>
                  <p className="text-[#F8FAFC]/40 font-medium">{getFileType(previewDocument.extension)}</p>
                  <p className="text-[#F8FAFC]/20 text-sm mt-2">Preview not available</p>
                  <button
                    onClick={() => handleDownloadDocument(previewDocument)}
                    className="mt-4 px-6 py-2 bg-[#3B82F6] text-white text-sm font-medium rounded-lg hover:bg-[#2563EB] transition-colors cursor-pointer"
                  >
                    Download File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CollectionDetailPage;
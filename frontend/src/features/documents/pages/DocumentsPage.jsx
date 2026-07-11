import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Header } from '../../../shared/components/layout/Header';
import { Footer } from '../../../shared/components/layout/Footer';

const API_BASE_URL = 'http://localhost:8000';

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch documents');
      
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete document');
      
      toast.success('Document deleted successfully');
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#080C14] flex flex-col">
      <Header />
      
      <main className="flex-1 container px-4 mx-auto py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#F8FAFC]">Documents</h1>
            <p className="text-[#F8FAFC]/50 mt-1">Manage your documents</p>
          </div>
          <Link to="/documents/upload">
            <button className="px-6 py-3 bg-gradient-to-r from-[#3B82F6] to-[#0F766E] text-white font-semibold rounded-xl shadow-lg hover:shadow-[#3B82F6]/30 transition-all duration-300 hover:scale-[1.02] cursor-pointer">
              Upload Document
            </button>
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-3 bg-[#0D1321] border border-[#F8FAFC]/10 rounded-xl text-[#F8FAFC] placeholder-[#F8FAFC]/30 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all duration-300"
            placeholder="Search documents..."
          />
        </div>

        {/* Documents Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-12 bg-[#0D1321] rounded-2xl border border-[#F8FAFC]/5">
            <p className="text-[#F8FAFC]/30">No documents found</p>
            <Link to="/documents/upload" className="text-[#3B82F6] hover:text-[#0F766E] transition-colors mt-2 inline-block">
              Upload your first document
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="bg-[#0D1321] rounded-2xl p-6 border border-[#F8FAFC]/5 hover:border-[#3B82F6]/30 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#F8FAFC]">{doc.name}</h3>
                      <p className="text-xs text-[#F8FAFC]/30">{doc.file_size}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="text-[#F8FAFC]/20 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="mt-4 pt-4 border-t border-[#F8FAFC]/5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#F8FAFC]/30">{doc.uploaded_at}</span>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-[#0F766E]/20 text-[#A3E635]">
                      {doc.status || 'Processed'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default DocumentsPage;
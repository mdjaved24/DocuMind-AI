import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-[#080C14] border-t border-[#F8FAFC]/5">
      <div className="container px-4 mx-auto py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-r from-[#3B82F6] to-[#0F766E] rounded-xl flex items-center justify-center shadow-lg shadow-[#3B82F6]/20">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="text-xl font-bold text-[#F8FAFC]">DocuMind AI</span>
            </Link>
            <p className="text-sm text-[#F8FAFC]/50 max-w-sm leading-relaxed">
              AI-Powered Document Intelligence Platform. Transform your documents into actionable insights.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-[#F8FAFC]/30 hover:text-[#3B82F6] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-[#F8FAFC]/30 hover:text-[#3B82F6] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 01-1.93.07 4.28 4.28 0 004 2.98 8.521 8.521 0 01-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a href="#" className="text-[#F8FAFC]/30 hover:text-[#3B82F6] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.15 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.62.24 2.85.12 3.15.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Product Links */}
          <div>
            <h3 className="text-[#F8FAFC] font-semibold text-lg mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/features" className="text-[#F8FAFC]/50 hover:text-[#3B82F6] transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="text-[#F8FAFC]/50 hover:text-[#3B82F6] transition-colors">Pricing</Link></li>
              <li><Link to="/docs" className="text-[#F8FAFC]/50 hover:text-[#3B82F6] transition-colors">Documentation</Link></li>
            </ul>
          </div>
          
          {/* Company Links */}
          <div>
            <h3 className="text-[#F8FAFC] font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-[#F8FAFC]/50 hover:text-[#3B82F6] transition-colors">About</Link></li>
              <li><Link to="/blog" className="text-[#F8FAFC]/50 hover:text-[#3B82F6] transition-colors">Blog</Link></li>
              <li><Link to="/contact" className="text-[#F8FAFC]/50 hover:text-[#3B82F6] transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-[#F8FAFC]/5 mt-8 pt-6 text-sm text-[#F8FAFC]/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; 2024 DocuMind AI. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/privacy" className="hover:text-[#3B82F6] transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-[#3B82F6] transition-colors">Terms of Service</Link>
            <Link to="/cookies" className="hover:text-[#3B82F6] transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
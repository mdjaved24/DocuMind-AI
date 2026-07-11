import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-[#080C14]/95 backdrop-blur-lg border-b border-[#F8FAFC]/5 sticky top-0 z-50">
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 bg-gradient-to-r from-[#3B82F6] to-[#0F766E] rounded-xl flex items-center justify-center shadow-lg shadow-[#3B82F6]/20">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="text-xl font-bold text-[#F8FAFC]">DocuMind AI</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {isLandingPage ? (
              <>
                <button 
                  onClick={() => scrollToSection('features')} 
                  className="text-[#F8FAFC]/70 hover:text-[#F8FAFC] transition-colors font-medium text-sm"
                >
                  Features
                </button>
                <button 
                  onClick={() => scrollToSection('how-it-works')} 
                  className="text-[#F8FAFC]/70 hover:text-[#F8FAFC] transition-colors font-medium text-sm"
                >
                  How It Works
                </button>
                <button 
                  onClick={() => scrollToSection('testimonials')} 
                  className="text-[#F8FAFC]/70 hover:text-[#F8FAFC] transition-colors font-medium text-sm"
                >
                  Testimonials
                </button>
                <Link to="/login" className="text-[#F8FAFC]/70 hover:text-[#F8FAFC] transition-colors font-medium text-sm">
                  Sign In
                </Link>
                <Link to="/register">
                  <button className="px-5 py-2.5 bg-gradient-to-r from-[#3B82F6] to-[#0F766E] text-white font-semibold text-sm rounded-xl hover:shadow-lg hover:shadow-[#3B82F6]/25 transition-all duration-300 hover:scale-105">
                    Sign up
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="text-[#F8FAFC]/70 hover:text-[#F8FAFC] transition-colors font-medium text-sm">
                  Dashboard
                </Link>
                <Link to="/documents" className="text-[#F8FAFC]/70 hover:text-[#F8FAFC] transition-colors font-medium text-sm">
                  Documents
                </Link>
                <Link to="/profile" className="text-[#F8FAFC]/70 hover:text-[#F8FAFC] transition-colors font-medium text-sm">
                  Profile
                </Link>
                <button className="px-4 py-2 bg-[#F8FAFC]/10 text-[#F8FAFC] font-medium text-sm rounded-xl hover:bg-[#F8FAFC]/20 transition-colors">
                  Logout
                </button>
              </>
            )}
          </nav>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-[#F8FAFC]/5 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6 text-[#F8FAFC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-[#F8FAFC]/5">
            <div className="flex flex-col gap-3">
              {isLandingPage ? (
                <>
                  <button 
                    onClick={() => scrollToSection('features')} 
                    className="text-[#F8FAFC]/70 hover:text-[#F8FAFC] transition-colors px-2 py-2 text-left font-medium"
                  >
                    Features
                  </button>
                  <button 
                    onClick={() => scrollToSection('how-it-works')} 
                    className="text-[#F8FAFC]/70 hover:text-[#F8FAFC] transition-colors px-2 py-2 text-left font-medium"
                  >
                    How It Works
                  </button>
                  <button 
                    onClick={() => scrollToSection('testimonials')} 
                    className="text-[#F8FAFC]/70 hover:text-[#F8FAFC] transition-colors px-2 py-2 text-left font-medium"
                  >
                    Testimonials
                  </button>
                  <Link to="/login" className="text-[#F8FAFC]/70 hover:text-[#F8FAFC] transition-colors px-2 py-2 font-medium">
                    Sign In
                  </Link>
                  <Link to="/register">
                    <button className="w-full px-5 py-3 bg-gradient-to-r from-[#3B82F6] to-[#0F766E] text-white font-semibold rounded-xl text-center">
                      Start Free Trial
                    </button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="text-[#F8FAFC]/70 hover:text-[#F8FAFC] transition-colors px-2 py-2 font-medium">
                    Dashboard
                  </Link>
                  <Link to="/documents" className="text-[#F8FAFC]/70 hover:text-[#F8FAFC] transition-colors px-2 py-2 font-medium">
                    Documents
                  </Link>
                  <Link to="/profile" className="text-[#F8FAFC]/70 hover:text-[#F8FAFC] transition-colors px-2 py-2 font-medium">
                    Profile
                  </Link>
                  <button className="w-full px-5 py-3 bg-[#F8FAFC]/10 text-[#F8FAFC] font-medium rounded-xl text-center hover:bg-[#F8FAFC]/20 transition-colors">
                    Logout
                  </button>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#080C14] py-20 md:py-28">
      {/* Premium Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#080C14] via-[#0D1321] to-[#111827]">
        {/* Gradient Orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#3B82F6] rounded-full mix-blend-screen filter blur-3xl opacity-10"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#0F766E] rounded-full mix-blend-screen filter blur-3xl opacity-10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-128 h-128 bg-[#0284C7] rounded-full mix-blend-screen filter blur-3xl opacity-5"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="container px-4 mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left Content */}
          <div className={`flex-1 text-center lg:text-left transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {/* AI Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#3B82F6]/10 backdrop-blur-sm rounded-full border border-[#3B82F6]/20 text-[#3B82F6] text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-[#3B82F6] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3B82F6]"></span>
              </span>
              AI-Powered Document Intelligence
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-[#F8FAFC] leading-tight mb-6">
              Transform Your Documents Into
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] via-[#0F766E] to-[#A3E635]">
                Intelligent Insights
              </span>
            </h1>
            
            {/* Description */}
            <p className="text-lg md:text-xl text-[#F8FAFC]/70 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Upload, organize, and analyze your documents with cutting-edge AI. 
              Get instant summaries, extract key insights, and chat with your documents.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/register">
                <button className="group relative px-8 py-4 bg-[#3B82F6] text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-[#3B82F6]/30 transition-all duration-300 hover:scale-105 overflow-hidden">
                  <span className="relative z-10 flex items-center gap-2">
                    Sign up
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0F766E] via-[#0284C7] to-[#3B82F6] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </button>
              </Link>
              <Link to="/login">
                <button className="px-8 py-4 bg-[#F8FAFC]/5 backdrop-blur-sm text-[#F8FAFC] font-semibold text-lg rounded-2xl border-2 border-[#F8FAFC]/10 hover:bg-[#F8FAFC]/10 hover:border-[#F8FAFC]/30 transition-all duration-300 hover:scale-105">
                  Sign In
                </button>
              </Link>
            </div>
            
            {/* Social Proof */}
            <div className="flex items-center gap-6 md:gap-8 mt-8 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {['SJ', 'MC', 'ER', 'AK'].map((initials, i) => (
                  <div 
                    key={i} 
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3B82F6]/20 to-[#0F766E]/20 border-2 border-[#111827] flex items-center justify-center text-xs font-semibold text-[#F8FAFC]"
                  >
                    {initials}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#0F766E] border-2 border-[#111827] flex items-center justify-center text-xs font-semibold text-white">
                  +5k
                </div>
              </div>
              <div className="text-sm text-[#F8FAFC]/60">
                <span className="font-bold text-[#F8FAFC]">10,000+</span> users trust us
              </div>
            </div>
          </div>
          
          {/* Right Content - Hero Image */}
          <div className={`flex-1 transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#3B82F6] via-[#0F766E] to-[#A3E635] rounded-2xl blur-3xl opacity-20 animate-pulse"></div>
              
              {/* Main Card */}
              <div className="relative bg-[#0D1321] rounded-2xl shadow-2xl p-6 border border-[#F8FAFC]/5 hover:border-[#3B82F6]/20 transition-all duration-500">
                {/* Document Header */}
                <div className="bg-[#080C14] rounded-xl p-4 mb-4 hover:bg-[#111827] transition-colors duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6]/20 to-[#0F766E]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#F8FAFC] truncate">Annual Report 2024.pdf</div>
                      <div className="text-xs text-[#F8FAFC]/50">2.4 MB • Uploaded 2 mins ago</div>
                    </div>
                    <span className="px-2 py-1 bg-[#0F766E]/20 text-[#A3E635] text-xs font-medium rounded-full flex-shrink-0 animate-pulse">
                      Processing
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#1A2332] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#3B82F6] to-[#0F766E] rounded-full transition-all duration-1000" style={{ width: '75%' }}></div>
                  </div>
                </div>
                
                {/* AI Summary */}
                <div className="bg-gradient-to-r from-[#3B82F6]/5 via-[#0F766E]/5 to-[#A3E635]/5 rounded-xl p-4 border border-[#F8FAFC]/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-[#3B82F6] to-[#0F766E] rounded-lg flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-[#F8FAFC]">AI Summary</span>
                  </div>
                  <p className="text-sm text-[#F8FAFC]/70 leading-relaxed">
                    This annual report shows a <span className="font-semibold text-[#A3E635]">23% revenue growth</span> in Q4, with significant expansion in 
                    European markets. Key recommendations include...
                  </p>
                </div>
              </div>
              
              {/* Floating Badge - AI Ready */}
              <div className="absolute -top-3 -right-3 bg-[#0D1321] rounded-full shadow-lg px-4 py-2.5 animate-float border border-[#F8FAFC]/10">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A3E635] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#A3E635]"></span>
                  </span>
                  <span className="text-xs font-semibold text-[#F8FAFC]">AI Ready</span>
                </div>
              </div>

              {/* Floating Badge - Real-time */}
              <div className="absolute -bottom-2 -left-2 bg-[#0D1321] rounded-full shadow-lg px-4 py-2 animate-float border border-[#F8FAFC]/10" style={{ animationDelay: '1.5s' }}>
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-medium text-[#F8FAFC]/70">Real-time</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#3B82F6]/5 to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-gradient-to-r from-[#0F766E]/5 to-transparent pointer-events-none"></div>
    </section>
  );
};
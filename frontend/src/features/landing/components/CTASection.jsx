import React from 'react';
import { Link } from 'react-router-dom';

export const CTASection = () => {
  return (
    <section className="relative overflow-hidden py-24 md:py-32 bg-[#080C14]">
      {/* Premium Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#080C14] via-[#0D1321] to-[#111827]">
        {/* Floating gradient orbs - subtle */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#3B82F6] rounded-full mix-blend-screen filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0F766E] rounded-full mix-blend-screen filter blur-3xl opacity-10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-128 h-128 bg-[#0284C7] rounded-full mix-blend-screen filter blur-3xl opacity-5"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Floating particles - subtle */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#3B82F6]/5 backdrop-blur-sm animate-float"
            style={{
              width: `${Math.random() * 12 + 3}px`,
              height: `${Math.random() * 12 + 3}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${Math.random() * 12 + 8}s`
            }}
          ></div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container px-4 mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#3B82F6]/10 backdrop-blur-lg rounded-full border border-[#3B82F6]/20 shadow-lg mb-8">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3B82F6] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#3B82F6]"></span>
            </span>
            <span className="text-sm font-medium text-[#F8FAFC]">🚀 Join 10,000+ teams worldwide</span>
          </div>

          {/* Main Heading */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-[#F8FAFC] leading-[1.1] mb-8">
            Start Using{' '}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] via-[#0F766E] to-[#A3E635]">
              DocuMind AI Today
            </span>
          </h2>
          
          {/* Description */}
          <p className="text-xl md:text-2xl text-[#F8FAFC]/80 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
            Experience the power of AI document intelligence. No credit card needed.
            <span className="block text-[#F8FAFC]/50 text-lg mt-2">Start free, stay free. Forever.</span>
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Link to="/register">
              <button className="group relative px-10 py-5 bg-[#3B82F6] text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-[#3B82F6]/30 transition-all duration-300 hover:scale-105 overflow-hidden">
                <span className="relative z-10 flex items-center gap-3">
                  Get Started Now
                  <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#0F766E] via-[#0284C7] to-[#3B82F6] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </button>
            </Link>
            <Link to="/demo">
              <button className="px-10 py-5 bg-[#F8FAFC]/5 backdrop-blur-lg text-[#F8FAFC] font-semibold text-lg rounded-2xl border-2 border-[#F8FAFC]/10 hover:bg-[#F8FAFC]/10 hover:border-[#F8FAFC]/30 transition-all duration-300 hover:scale-105">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Watch Demo
                </span>
              </button>
            </Link>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-12">
            <div className="flex items-center gap-3 text-[#F8FAFC]/60">
              <div className="w-10 h-10 rounded-full bg-[#F8FAFC]/5 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium">No credit card</span>
            </div>
            <div className="w-px h-8 bg-[#F8FAFC]/10 hidden sm:block"></div>
            <div className="flex items-center gap-3 text-[#F8FAFC]/60">
              <div className="w-10 h-10 rounded-full bg-[#F8FAFC]/5 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium">Free forever</span>
            </div>
            <div className="w-px h-8 bg-[#F8FAFC]/10 hidden sm:block"></div>
            <div className="flex items-center gap-3 text-[#F8FAFC]/60">
              <div className="w-10 h-10 rounded-full bg-[#F8FAFC]/5 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium">Cancel anytime</span>
            </div>
          </div>

          {/* Social Proof Bar */}
          <div className="mt-12 pt-8 border-t border-[#F8FAFC]/5">
            <div className="flex flex-wrap items-center justify-center gap-6">
              <div className="flex -space-x-3">
                {['JC', 'MK', 'SR', 'AL', 'TW'].map((initials, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-[#111827] flex items-center justify-center text-xs font-bold text-[#F8FAFC] bg-[#3B82F6]/20 backdrop-blur-sm"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {initials}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-[#111827] flex items-center justify-center text-xs font-bold text-[#F8FAFC] bg-gradient-to-r from-[#3B82F6] to-[#0F766E]">
                  +2k
                </div>
              </div>
              <span className="text-[#F8FAFC]/50 text-sm">Join 2,000+ users who started today</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom decorative wave - subtle */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 60L60 50C120 40 240 20 360 25C480 30 600 60 720 65C840 70 960 50 1080 40C1200 30 1320 30 1380 30L1440 30V120H0V60Z" fill="#0D1321" fillOpacity="0.3"/>
          <path d="M0 80L60 70C120 60 240 40 360 45C480 50 600 80 720 85C840 90 960 70 1080 60C1200 50 1320 50 1380 50L1440 50V120H0V80Z" fill="#080C14" fillOpacity="0.2"/>
        </svg>
      </div>
    </section>
  );
};
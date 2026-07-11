import React from 'react';

const features = [
  {
    icon: '📄',
    title: 'Smart Document Upload',
    description: 'Upload any document format - PDF, Word, Excel, Images. Our AI automatically processes and organizes your content.',
    gradient: 'from-[#3B82F6] to-[#0284C7]'
  },
  {
    icon: '🧠',
    title: 'AI-Powered Analysis',
    description: 'Get instant summaries, extract key insights, and analyze sentiment. Let AI do the heavy lifting for you.',
    gradient: 'from-[#0F766E] to-[#0284C7]'
  },
  {
    icon: '💬',
    title: 'Chat with Documents',
    description: 'Have natural conversations with your documents. Ask questions and get answers instantly.',
    gradient: 'from-[#3B82F6] to-[#0F766E]'
  },
  {
    icon: '📚',
    title: 'Smart Collections',
    description: 'Organize documents into collections. Tag, search, and filter with intelligent categorization.',
    gradient: 'from-[#0284C7] to-[#A3E635]'
  },
  {
    icon: '⚡',
    title: 'Instant Insights',
    description: 'Extract key information, detect patterns, and get actionable insights in seconds.',
    gradient: 'from-[#A3E635] to-[#0F766E]'
  },
  {
    icon: '🛡️',
    title: 'Enterprise Security',
    description: 'Bank-grade encryption, SSO, and compliance ready. Your data is always protected.',
    gradient: 'from-[#3B82F6] to-[#A3E635]'
  }
];

export const FeaturesSection = () => {
  return (
    <section className="py-24 bg-[#0D1321]" id="features">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#3B82F6]/10 rounded-full border border-[#3B82F6]/20 text-[#3B82F6] text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-[#3B82F6] rounded-full"></span>
            Features
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-[#F8FAFC] mb-4">
            Everything You Need to
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] via-[#0F766E] to-[#A3E635]">
              Manage Documents
            </span>
          </h2>
          <p className="text-xl text-[#F8FAFC]/60">
            Powerful AI features that transform how you work with documents
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group relative p-8 bg-[#111827] rounded-2xl border border-[#F8FAFC]/5 hover:border-[#3B82F6]/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:shadow-[#3B82F6]/5"
            >
              {/* Gradient hover background */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
              
              <div className="relative z-10">
                {/* Icon with gradient */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-2xl shadow-lg mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-xl font-bold text-[#F8FAFC] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#F8FAFC]/60 leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Decorative line */}
                <div className={`w-12 h-1 rounded-full bg-gradient-to-r ${feature.gradient} mt-4 group-hover:w-20 transition-all duration-300`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
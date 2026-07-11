import React from 'react';

const steps = [
  {
    number: '01',
    title: 'Upload Your Document',
    description: 'Drag and drop any document format. Our AI starts processing immediately.',
    icon: '📤',
    gradient: 'from-[#3B82F6] to-[#0284C7]'
  },
  {
    number: '02',
    title: 'AI Analysis',
    description: 'Our AI analyzes content, extracts insights, and creates smart summaries.',
    icon: '🤖',
    gradient: 'from-[#0F766E] to-[#A3E635]'
  },
  {
    number: '03',
    title: 'Get Insights & Chat',
    description: 'View AI summaries, ask questions, and get answers instantly.',
    icon: '💬',
    gradient: 'from-[#3B82F6] to-[#0F766E]'
  }
];

export const HowItWorksSection = () => {
  return (
    <section className="py-24 bg-[#080C14]" id="how-it-works">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F766E]/10 rounded-full border border-[#0F766E]/20 text-[#0F766E] text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-[#0F766E] rounded-full"></span>
            How It Works
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-[#F8FAFC] mb-4">
            Get Started in
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] via-[#0F766E] to-[#A3E635]">
              3 Simple Steps
            </span>
          </h2>
          <p className="text-xl text-[#F8FAFC]/60">
            From upload to insights - it's that simple
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-[#3B82F6] via-[#0F766E] to-[#A3E635] -translate-y-1/2 opacity-20"></div>
          
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-[#111827] rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 text-center relative z-10 hover:-translate-y-2 hover:shadow-[#3B82F6]/5 border border-[#F8FAFC]/5">
                {/* Step number */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white font-bold text-xl mx-auto mb-5 shadow-lg`}>
                  {step.number}
                </div>
                
                <div className="text-5xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-bold text-[#F8FAFC] mb-3">{step.title}</h3>
                <p className="text-[#F8FAFC]/60">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
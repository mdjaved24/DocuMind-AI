import React from 'react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'CEO, TechStart Inc.',
    content: 'DocuMind AI has completely transformed how we handle documents. The AI summaries alone save us 20+ hours per week!',
    avatar: 'SJ',
    gradient: 'from-[#3B82F6] to-[#0284C7]',
    rating: 5
  },
  {
    name: 'Michael Chen',
    role: 'Legal Counsel, Global Corp',
    content: 'The document analysis is incredibly accurate. We\'ve caught issues we would have missed with traditional methods.',
    avatar: 'MC',
    gradient: 'from-[#0F766E] to-[#A3E635]',
    rating: 5
  },
  {
    name: 'Emily Rodriguez',
    role: 'Research Director, Science Labs',
    content: 'Processing research papers has never been easier. The chat feature helps us find specific information instantly.',
    avatar: 'ER',
    gradient: 'from-[#3B82F6] to-[#0F766E]',
    rating: 5
  }
];

export const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-[#0D1321]" id="testimonials">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#A3E635]/10 rounded-full border border-[#A3E635]/20 text-[#A3E635] text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-[#A3E635] rounded-full"></span>
            Testimonials
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-[#F8FAFC] mb-4">
            Loved by Teams
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] via-[#0F766E] to-[#A3E635]">
              Worldwide
            </span>
          </h2>
          <p className="text-xl text-[#F8FAFC]/60">
            See what our users say about DocuMind AI
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-[#111827] rounded-2xl p-8 border border-[#F8FAFC]/5 hover:border-[#3B82F6]/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#3B82F6]/5">
              {/* Rating stars */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-[#A3E635]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              
              <p className="text-[#F8FAFC]/80 mb-6 leading-relaxed">"{testimonial.content}"</p>
              
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center font-bold text-white shadow-lg`}>
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-bold text-[#F8FAFC]">{testimonial.name}</div>
                  <div className="text-sm text-[#F8FAFC]/50">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
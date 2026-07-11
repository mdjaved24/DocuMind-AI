import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../shared/components/common/Button';

const plans = [
  {
    name: 'Starter',
    price: '$29',
    description: 'Perfect for individuals and small teams',
    features: [
      '50 documents per month',
      'Basic AI summaries',
      'Document search',
      '5GB storage',
      'Email support'
    ],
    cta: 'Start Free Trial',
    popular: false
  },
  {
    name: 'Professional',
    price: '$79',
    description: 'Best for growing teams and businesses',
    features: [
      '500 documents per month',
      'Advanced AI analysis',
      'Chat with documents',
      '50GB storage',
      'Priority support',
      'Team collaboration',
      'API access'
    ],
    cta: 'Start Free Trial',
    popular: true
  },
  {
    name: 'Enterprise',
    price: '$199',
    description: 'For large organizations with custom needs',
    features: [
      'Unlimited documents',
      'Full AI suite',
      'Custom integrations',
      '500GB storage',
      '24/7 dedicated support',
      'SSO and compliance',
      'Custom AI models'
    ],
    cta: 'Contact Sales',
    popular: false
  }
];

export const PricingSection = () => {
  return (
    <section className="py-20 bg-gray-50" id="pricing">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Pricing</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
            Choose the Perfect Plan
          </h2>
          <p className="text-lg text-gray-600">
            Start free and upgrade as you grow
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div key={index} className={'bg-white rounded-2xl p-8 relative ' + (plan.popular ? 'ring-2 ring-blue-600 shadow-xl' : 'shadow-sm hover:shadow-xl') + ' transition-all duration-300'}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                  Most Popular
                </div>
              )}
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500">/mo</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link to={plan.name === 'Enterprise' ? '/contact' : '/register'}>
                <Button className="w-full" variant={plan.popular ? 'primary' : 'secondary'}>
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Footer } from '../../../shared/components/layout/Footer';

const API_BASE_URL = 'http://localhost:8000';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    if (step === 2) {
      document.getElementById('otp-input')?.focus();
    }
  }, [step]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setError('');
  };

  const validateForm = () => {
    const { fullName, email, phone, password, confirmPassword } = formData;

    if (!fullName.trim()) {
      toast.warning('Full Name Required', {
        description: 'Please enter your full name.',
        duration: 3000,
      });
      return false;
    }

    if (!email.trim()) {
      toast.warning('Email Required', {
        description: 'Please enter your email address.',
        duration: 3000,
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.warning('Invalid Email', {
        description: 'Please enter a valid email address.',
        duration: 3000,
      });
      return false;
    }

    if (!phone.trim()) {
      toast.warning('Phone Number Required', {
        description: 'Please enter your phone number.',
        duration: 3000,
      });
      return false;
    }

    if (password.length < 8) {
      toast.warning('Weak Password', {
        description: 'Password must be at least 8 characters long.',
        duration: 3000,
      });
      return false;
    }

    if (password !== confirmPassword) {
      toast.warning('Passwords Mismatch', {
        description: 'Password and confirm password do not match.',
        duration: 3000,
      });
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const { fullName, email, phone, password } = formData;

    try {
      const response = await fetch(`${API_BASE_URL}/user/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          full_name: fullName,
          email: email,
          phone_no: phone,
          password: password,
        }),
      });

      // Handle non-OK responses with proper error parsing
      if (!response.ok) {
        let errorMessage = 'Registration failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (jsonError) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      setOtpSent(true);
      setStep(2);
      setResendTimer(60);

      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      toast.success('OTP Sent!', {
        description: `We've sent a 6-digit OTP to ${email}`,
        duration: 4000,
      });

      console.log('OTP (for testing): Check server logs');
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        toast.error('Connection Error', {
          description: 'Could not connect to the server. Please check if the backend is running.',
          duration: 6000,
        });
      } else {
        toast.error('Registration Failed', {
          description: error.message || 'Failed to register. Please try again.',
          duration: 5000,
        });
      }
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      toast.warning('Invalid OTP', {
        description: 'Please enter a valid 6-digit OTP.',
        duration: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/user/auth/verify-signup-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          otp: otp,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Verification failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (jsonError) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      toast.success('🎉 Account Created!', {
        description: 'Your account has been successfully verified.',
        duration: 4000,
      });

      navigate('/login');
    } catch (error) {
      console.error('OTP verification error:', error);
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        toast.error('Connection Error', {
          description: 'Could not connect to the server. Please check if the backend is running.',
          duration: 6000,
        });
      } else {
        toast.error('Verification Failed', {
          description: error.message || 'Invalid OTP. Please try again.',
          duration: 5000,
        });
      }
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/user/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          phone_no: formData.phone,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to resend OTP';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (jsonError) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      setResendTimer(60);
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      toast.success('OTP Resent!', {
        description: `We've sent a new OTP to ${formData.email}`,
        duration: 4000,
      });
    } catch (error) {
      toast.error('Failed to Resend OTP', {
        description: error.message || 'Please try again.',
        duration: 5000,
      });
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);
  const goBackToForm = () => {
    setStep(1);
    setOtp('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#080C14] flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Brand Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-r from-[#3B82F6] to-[#0F766E] rounded-2xl flex items-center justify-center shadow-lg shadow-[#3B82F6]/20 group-hover:scale-105 transition-transform duration-300">
                <span className="text-white font-bold text-2xl">D</span>
              </div>
              <span className="text-2xl font-bold text-[#F8FAFC] group-hover:text-[#3B82F6] transition-colors duration-300">
                DocuMind AI
              </span>
            </Link>
          </div>

          {/* Registration/OTP Card */}
          <div className="bg-[#0D1321] rounded-2xl p-8 border border-[#F8FAFC]/5 shadow-2xl">
            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className={`flex items-center gap-2 ${step === 1 ? 'text-[#3B82F6]' : 'text-[#F8FAFC]/30'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${step === 1 ? 'border-[#3B82F6] bg-[#3B82F6]/10 text-[#3B82F6]' : 'border-[#F8FAFC]/10 text-[#F8FAFC]/30'}`}>
                  1
                </div>
                <span className={`text-sm font-medium ${step === 1 ? 'text-[#F8FAFC]' : 'text-[#F8FAFC]/30'}`}>Details</span>
              </div>
              <div className="w-12 h-px bg-[#F8FAFC]/10"></div>
              <div className={`flex items-center gap-2 ${step === 2 ? 'text-[#3B82F6]' : 'text-[#F8FAFC]/30'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${step === 2 ? 'border-[#3B82F6] bg-[#3B82F6]/10 text-[#3B82F6]' : 'border-[#F8FAFC]/10 text-[#F8FAFC]/30'}`}>
                  2
                </div>
                <span className={`text-sm font-medium ${step === 2 ? 'text-[#F8FAFC]' : 'text-[#F8FAFC]/30'}`}>Verify</span>
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#F8FAFC] cursor-default">
                {step === 1 ? 'Create Account' : 'Verify Your Email'}
              </h2>
              <p className="text-[#F8FAFC]/50 mt-1 cursor-default">
                {step === 1 
                  ? 'Start your free trial today' 
                  : `We've sent a 6-digit OTP to ${formData.email}`}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2 cursor-default">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Step 1: Registration Form */}
            {step === 1 && (
              <form onSubmit={handleRegister}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#F8FAFC]/70 mb-1.5 cursor-default">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#080C14] border border-[#F8FAFC]/10 rounded-xl text-[#F8FAFC] placeholder-[#F8FAFC]/30 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all duration-300 cursor-text"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#F8FAFC]/70 mb-1.5 cursor-default">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#080C14] border border-[#F8FAFC]/10 rounded-xl text-[#F8FAFC] placeholder-[#F8FAFC]/30 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all duration-300 cursor-text"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#F8FAFC]/70 mb-1.5 cursor-default">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#080C14] border border-[#F8FAFC]/10 rounded-xl text-[#F8FAFC] placeholder-[#F8FAFC]/30 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all duration-300 cursor-text"
                    placeholder="+1 234 567 8900"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#F8FAFC]/70 mb-1.5 cursor-default">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#080C14] border border-[#F8FAFC]/10 rounded-xl text-[#F8FAFC] placeholder-[#F8FAFC]/30 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all duration-300 cursor-text pr-12"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F8FAFC]/40 hover:text-[#F8FAFC]/70 transition-colors cursor-pointer"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-[#F8FAFC]/30 mt-1.5 cursor-default">
                    Must be at least 8 characters
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-[#F8FAFC]/70 mb-1.5 cursor-default">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#080C14] border border-[#F8FAFC]/10 rounded-xl text-[#F8FAFC] placeholder-[#F8FAFC]/30 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all duration-300 cursor-text pr-12"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F8FAFC]/40 hover:text-[#F8FAFC]/70 transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-[#3B82F6] to-[#0F766E] text-white font-semibold rounded-xl shadow-lg hover:shadow-[#3B82F6]/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Creating Account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <form onSubmit={handleVerifyOTP}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-[#F8FAFC]/70 mb-1.5 cursor-default">
                    Enter OTP
                  </label>
                  <div className="flex gap-3">
                    <input
                      id="otp-input"
                      type="text"
                      value={otp}
                      onChange={handleOtpChange}
                      className="flex-1 px-4 py-3 bg-[#080C14] border border-[#F8FAFC]/10 rounded-xl text-[#F8FAFC] placeholder-[#F8FAFC]/30 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all duration-300 cursor-text text-center text-2xl font-bold tracking-widest"
                      placeholder="000000"
                      maxLength="6"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={resendTimer > 0}
                      className={`px-4 py-3 font-medium rounded-xl transition-all duration-300 whitespace-nowrap cursor-pointer ${
                        resendTimer > 0 
                          ? 'bg-[#F8FAFC]/5 text-[#F8FAFC]/30 cursor-not-allowed' 
                          : 'bg-[#3B82F6]/10 text-[#3B82F6] hover:bg-[#3B82F6]/20 border border-[#3B82F6]/20'
                      }`}
                    >
                      {resendTimer > 0 ? `${resendTimer}s` : 'Resend'}
                    </button>
                  </div>
                  <p className="text-xs text-[#F8FAFC]/30 mt-2 cursor-default">
                    OTP sent to your email. Valid for 10 minutes.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={loading || !otp}
                    className="w-full py-3.5 bg-gradient-to-r from-[#3B82F6] to-[#0F766E] text-white font-semibold rounded-xl shadow-lg hover:shadow-[#3B82F6]/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Verifying...
                      </span>
                    ) : (
                      'Verify & Create Account'
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={goBackToForm}
                    className="w-full py-3 text-[#F8FAFC]/50 hover:text-[#F8FAFC] font-medium text-sm transition-colors cursor-pointer"
                  >
                    ← Back to registration
                  </button>
                </div>
              </form>
            )}

            {/* Divider */}
            {step === 1 && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#F8FAFC]/5"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-[#0D1321] text-[#F8FAFC]/30 cursor-default">or</span>
                  </div>
                </div>

                <p className="text-center text-sm text-[#F8FAFC]/50">
                  Already have an account?{' '}
                  <Link to="/login" className="text-[#3B82F6] hover:text-[#0F766E] font-medium transition-colors cursor-pointer">
                    Sign In
                  </Link>
                </p>
              </>
            )}
          </div>

          {/* Features Badge */}
          <div className="mt-6 text-center">
            <p className="text-xs text-[#F8FAFC]/20 flex items-center justify-center gap-4">
              <span className="flex items-center gap-1 cursor-default">
                <svg className="w-3 h-3 text-[#A3E635]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Free forever
              </span>
              <span className="w-px h-3 bg-[#F8FAFC]/10"></span>
              <span className="flex items-center gap-1 cursor-default">
                <svg className="w-3 h-3 text-[#A3E635]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                AI-powered
              </span>
              <span className="w-px h-3 bg-[#F8FAFC]/10"></span>
              <span className="flex items-center gap-1 cursor-default">
                <svg className="w-3 h-3 text-[#A3E635]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Secure
              </span>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RegisterPage;
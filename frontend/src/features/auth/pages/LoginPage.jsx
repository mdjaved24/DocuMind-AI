import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Footer } from '../../../shared/components/layout/Footer';

// API Base URL
const API_BASE_URL = 'http://localhost:8000';

const LoginPage = () => {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Auto-focus OTP input when OTP is sent
  useEffect(() => {
    if (otpSent) {
      document.getElementById('otp-input')?.focus();
    }
  }, [otpSent]);

  // Password Login Handler
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/user/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error('Server returned an invalid response. Please try again.');
      }

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user || { email }));

      toast.success('🎉 Welcome back!', {
        description: 'You have been successfully logged in.',
        duration: 4000,
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        toast.error('Connection Error', {
          description: 'Could not connect to the server. Please check if the backend is running.',
          duration: 6000,
        });
      } else {
        toast.error('Login Failed', {
          description: error.message || 'Invalid email or password. Please try again.',
          duration: 5000,
        });
      }
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Send OTP Handler
  const handleSendOTP = async () => {
    if (!email) {
      toast.warning('Email Required', {
        description: 'Please enter your email address first.',
        duration: 3000,
      });
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/user/auth/login-with-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error('Server returned an invalid response.');
      }

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Failed to send OTP');
      }

      setOtpSent(true);
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
      console.error('Send OTP error:', error);
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        toast.error('Connection Error', {
          description: 'Could not connect to the server. Please check if the backend is running.',
          duration: 6000,
        });
      } else {
        toast.error('Failed to Send OTP', {
          description: error.message || 'Please check your email and try again.',
          duration: 5000,
        });
      }
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // OTP Login Handler
  const handleOTPLogin = async (e) => {
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
      const response = await fetch(`${API_BASE_URL}/user/auth/verify-login-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error('Server returned an invalid response.');
      }

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Invalid OTP');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user || { email }));

      toast.success('🎉 Welcome back!', {
        description: 'You have been successfully logged in with OTP.',
        duration: 4000,
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('OTP verification error:', error);
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        toast.error('Connection Error', {
          description: 'Could not connect to the server. Please check if the backend is running.',
          duration: 6000,
        });
      } else {
        toast.error('Verification Failed', {
          description: error.message || 'Invalid OTP. Please try again or request a new one.',
          duration: 5000,
        });
      }
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP Handler
  const handleResendOTP = () => {
    if (resendTimer > 0) return;
    handleSendOTP();
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle OTP input change
  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
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

          {/* Login Card */}
          <div className="bg-[#0D1321] rounded-2xl p-8 border border-[#F8FAFC]/5 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[#F8FAFC] cursor-default">Welcome Back</h2>
              <p className="text-[#F8FAFC]/50 mt-1 cursor-default">Sign in to your account</p>
            </div>

            {/* Login Method Toggle */}
            <div className="flex bg-[#080C14] rounded-xl p-1 mb-6 border border-[#F8FAFC]/5">
              <button
                onClick={() => {
                  setLoginMethod('password');
                  setError('');
                  setOtpSent(false);
                  setOtp('');
                }}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
                  loginMethod === 'password'
                    ? 'bg-gradient-to-r from-[#3B82F6] to-[#0F766E] text-white shadow-lg shadow-[#3B82F6]/20'
                    : 'text-[#F8FAFC]/50 hover:text-[#F8FAFC]'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Password
                </span>
              </button>
              <button
                onClick={() => {
                  setLoginMethod('otp');
                  setError('');
                  setOtpSent(false);
                  setOtp('');
                }}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
                  loginMethod === 'otp'
                    ? 'bg-gradient-to-r from-[#3B82F6] to-[#0F766E] text-white shadow-lg shadow-[#3B82F6]/20'
                    : 'text-[#F8FAFC]/50 hover:text-[#F8FAFC]'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  OTP
                </span>
              </button>
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

            {/* Password Login Form */}
            {loginMethod === 'password' && (
              <form onSubmit={handlePasswordLogin}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#F8FAFC]/70 mb-1.5 cursor-default">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-[#080C14] border border-[#F8FAFC]/10 rounded-xl text-[#F8FAFC] placeholder-[#F8FAFC]/30 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all duration-300 cursor-text"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-[#F8FAFC]/70 mb-1.5 cursor-default">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-[#080C14] border border-[#F8FAFC]/10 rounded-xl text-[#F8FAFC] placeholder-[#F8FAFC]/30 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all duration-300 cursor-text pr-12"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F8FAFC]/40 hover:text-[#F8FAFC]/70 transition-colors cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                      Signing In...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
            )}

            {/* OTP Login Form - Updated to match Register page style */}
            {loginMethod === 'otp' && (
              <form onSubmit={handleOTPLogin}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#F8FAFC]/70 mb-1.5 cursor-default">
                    Email Address
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 px-4 py-3 bg-[#080C14] border border-[#F8FAFC]/10 rounded-xl text-[#F8FAFC] placeholder-[#F8FAFC]/30 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all duration-300 cursor-text"
                      placeholder="you@example.com"
                      required
                      disabled={otpSent}
                    />
                    {!otpSent && (
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={loading || !email}
                        className="px-4 py-3 bg-[#3B82F6]/10 text-[#3B82F6] font-medium rounded-xl border border-[#3B82F6]/20 hover:bg-[#3B82F6]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                      >
                        {loading ? 'Sending...' : 'Send OTP'}
                      </button>
                    )}
                  </div>
                </div>

                {otpSent && (
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
                        autoFocus
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
                )}

                {otpSent && (
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
                      'Verify & Sign In'
                    )}
                  </button>
                )}
              </form>
            )}

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#F8FAFC]/5"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#0D1321] text-[#F8FAFC]/30 cursor-default">or</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-[#F8FAFC]/50">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#3B82F6] hover:text-[#0F766E] font-medium transition-colors cursor-pointer">
                Create Account
              </Link>
            </p>
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

export default LoginPage;
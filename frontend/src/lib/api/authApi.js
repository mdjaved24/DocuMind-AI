const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const authApi = {
  // Password Login
  loginWithPassword: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/user/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Login failed');
    }
    return data;
  },

  // Send OTP
  sendOTP: async (email) => {
    const response = await fetch(`${API_BASE_URL}/user/auth/login-with-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Failed to send OTP');
    }
    return data;
  },

  // Verify OTP
  verifyOTP: async (email, otp) => {
    const response = await fetch(`${API_BASE_URL}/user/auth/verify-login-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Invalid OTP');
    }
    return data;
  },
};
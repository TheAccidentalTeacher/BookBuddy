import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../contexts/AuthContext';
import { useDebug } from '../../contexts/DebugContext';
import toast from 'react-hot-toast';

function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { log } = useDebug();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      log('warn', 'auth', 'Login form validation failed', errors);
      return;
    }

    setIsLoading(true);

    try {
      log('info', 'auth', 'Login attempt started', { email: formData.email });
      await login(formData.email, formData.password);
      log('info', 'auth', 'Login successful');
      toast.success('Welcome back!');
    } catch (error: any) {
      log('error', 'auth', 'Login failed', error);
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign In - AI Fiction Editing Tool</title>
        <meta name="description" content="Sign in to your AI Fiction Editing Tool account" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-color)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <span role="img" aria-label="Book icon" className="text-4xl">📖</span>
            </div>
            <h1 className="text-3xl font-bold text-[var(--text-color)]">
              Sign In
            </h1>
            <p className="mt-2 text-[var(--text-muted)]">
              Welcome back to your AI Fiction Editing Tool
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
            <div className="space-y-4">
              {/* Email Field */}
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-[var(--text-color)] mb-1"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md bg-[var(--bg-color)] text-[var(--text-color)] 
                    transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] 
                    ${errors.email 
                      ? 'border-[var(--error-color)] focus:border-[var(--error-color)]' 
                      : 'border-[var(--border-color)] focus:border-[var(--primary-color)]'
                    }`}
                  placeholder="Enter your email"
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="mt-1 text-sm text-[var(--error-color)]" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-[var(--text-color)] mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md bg-[var(--bg-color)] text-[var(--text-color)] 
                    transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] 
                    ${errors.password 
                      ? 'border-[var(--error-color)] focus:border-[var(--error-color)]' 
                      : 'border-[var(--border-color)] focus:border-[var(--primary-color)]'
                    }`}
                  placeholder="Enter your password"
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                {errors.password && (
                  <p id="password-error" className="mt-1 text-sm text-[var(--error-color)]" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 px-4 py-2 border border-transparent 
                rounded-md shadow-sm text-sm font-medium text-white bg-[var(--primary-color)] 
                hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 
                focus:ring-offset-2 focus:ring-[var(--primary-color)] 
                disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-describedby={isLoading ? 'signing-in-status' : undefined}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span id="signing-in-status">Signing in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Links */}
            <div className="text-center space-y-2">
              <p className="text-sm text-[var(--text-muted)]">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="text-[var(--primary-color)] hover:text-[var(--primary-hover)] font-medium"
                >
                  Create one here
                </Link>
              </p>
              
              <p className="text-sm">
                <Link 
                  to="/help" 
                  className="text-[var(--text-muted)] hover:text-[var(--text-color)]"
                >
                  Need help?
                </Link>
              </p>
            </div>
          </form>

          {/* Accessibility Notice */}
          <div className="text-center">
            <p className="text-xs text-[var(--text-muted)]">
              This tool is fully accessible. Press F12 for debug console.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;

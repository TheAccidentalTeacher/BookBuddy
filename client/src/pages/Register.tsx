import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../contexts/AuthContext';
import { useDebug } from '../../contexts/DebugContext';
import toast from 'react-hot-toast';

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
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

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter, one uppercase letter, and one number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      log('warn', 'auth', 'Registration form validation failed', errors);
      return;
    }

    setIsLoading(true);

    try {
      log('info', 'auth', 'Registration attempt started', { 
        username: formData.username, 
        email: formData.email 
      });
      await register(formData.username, formData.email, formData.password);
      log('info', 'auth', 'Registration successful');
      toast.success('Account created successfully! Welcome!');
    } catch (error: any) {
      log('error', 'auth', 'Registration failed', error);
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create Account - AI Fiction Editing Tool</title>
        <meta name="description" content="Create your AI Fiction Editing Tool account" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-color)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <span role="img" aria-label="Book icon" className="text-4xl">📖</span>
            </div>
            <h1 className="text-3xl font-bold text-[var(--text-color)]">
              Create Account
            </h1>
            <p className="mt-2 text-[var(--text-muted)]">
              Join the AI Fiction Editing Tool community
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
            <div className="space-y-4">
              {/* Username Field */}
              <div>
                <label 
                  htmlFor="username" 
                  className="block text-sm font-medium text-[var(--text-color)] mb-1"
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md bg-[var(--bg-color)] text-[var(--text-color)] 
                    transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] 
                    ${errors.username 
                      ? 'border-[var(--error-color)] focus:border-[var(--error-color)]' 
                      : 'border-[var(--border-color)] focus:border-[var(--primary-color)]'
                    }`}
                  placeholder="Choose a username"
                  aria-invalid={errors.username ? 'true' : 'false'}
                  aria-describedby={errors.username ? 'username-error' : 'username-help'}
                />
                {!errors.username && (
                  <p id="username-help" className="mt-1 text-xs text-[var(--text-muted)]">
                    Letters, numbers, and underscores only. At least 3 characters.
                  </p>
                )}
                {errors.username && (
                  <p id="username-error" className="mt-1 text-sm text-[var(--error-color)]" role="alert">
                    {errors.username}
                  </p>
                )}
              </div>

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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md bg-[var(--bg-color)] text-[var(--text-color)] 
                    transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] 
                    ${errors.password 
                      ? 'border-[var(--error-color)] focus:border-[var(--error-color)]' 
                      : 'border-[var(--border-color)] focus:border-[var(--primary-color)]'
                    }`}
                  placeholder="Create a strong password"
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'password-error' : 'password-help'}
                />
                {!errors.password && (
                  <p id="password-help" className="mt-1 text-xs text-[var(--text-muted)]">
                    At least 6 characters with uppercase, lowercase, and number.
                  </p>
                )}
                {errors.password && (
                  <p id="password-error" className="mt-1 text-sm text-[var(--error-color)]" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label 
                  htmlFor="confirmPassword" 
                  className="block text-sm font-medium text-[var(--text-color)] mb-1"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md bg-[var(--bg-color)] text-[var(--text-color)] 
                    transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] 
                    ${errors.confirmPassword 
                      ? 'border-[var(--error-color)] focus:border-[var(--error-color)]' 
                      : 'border-[var(--border-color)] focus:border-[var(--primary-color)]'
                    }`}
                  placeholder="Confirm your password"
                  aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                  aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                />
                {errors.confirmPassword && (
                  <p id="confirm-password-error" className="mt-1 text-sm text-[var(--error-color)]" role="alert">
                    {errors.confirmPassword}
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
              aria-describedby={isLoading ? 'creating-account-status' : undefined}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span id="creating-account-status">Creating account...</span>
                </>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Links */}
            <div className="text-center space-y-2">
              <p className="text-sm text-[var(--text-muted)]">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-[var(--primary-color)] hover:text-[var(--primary-hover)] font-medium"
                >
                  Sign in here
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

export default RegisterPage;

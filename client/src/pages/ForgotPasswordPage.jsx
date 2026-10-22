import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Film, Mail, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import api from '../services/api';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isResetDone, setIsResetDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRequestToken = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');
      const res = await api.post('/auth/forgot-password', { email });
      setIsSubmitted(true);
      setMessage(res.message || 'Reset token generated');
      if (res.data?.resetToken) {
        setResetToken(res.data.resetToken);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate reset request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteReset = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');
      await api.post('/auth/reset-password', {
        token: resetToken,
        password: newPassword
      });
      setIsResetDone(true);
    } catch (err) {
      setError(err.message || 'Password reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 p-8 rounded-3xl bg-card border border-border shadow-2xl">
        <Link
          to="/login"
          className="inline-flex items-center space-x-1.5 text-xs text-muted hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </Link>

        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-cerulean to-cerulean-light items-center justify-center shadow-cerulean mb-2">
            <Film className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Reset Password</h2>
          <p className="text-xs text-muted">
            Enter your email to receive recovery instructions
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-error/15 border border-error/30 text-error text-xs">
            {error}
          </div>
        )}

        {isResetDone ? (
          <div className="text-center space-y-4">
            <CheckCircle2 className="w-10 h-10 text-success mx-auto" />
            <h3 className="text-base font-bold text-white">Password Updated!</h3>
            <p className="text-xs text-muted">Your password has been securely reset. You can now login.</p>
            <Link
              to="/login"
              className="inline-block w-full py-3 rounded-xl bg-cerulean text-white text-xs font-bold text-center"
            >
              Sign In Now
            </Link>
          </div>
        ) : !isSubmitted ? (
          <form onSubmit={handleRequestToken} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-muted block mb-1.5">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-elevated border border-border text-sm text-white placeholder-muted focus:outline-none focus:border-cerulean transition-all"
                />
                <Mail className="w-4 h-4 text-muted absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-cerulean hover:bg-cerulean-hover text-white text-sm font-bold flex items-center justify-center space-x-2 shadow-cerulean transition-all disabled:opacity-50"
            >
              <span>{isLoading ? 'Sending...' : 'Request Reset Token'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleCompleteReset} className="space-y-4">
            <div className="p-3 bg-elevated rounded-xl border border-border text-xs text-muted">
              Demo Reset Token: <span className="font-mono text-white font-bold">{resetToken}</span>
            </div>

            <div>
              <label className="text-xs font-bold text-muted block mb-1.5">Reset Token</label>
              <input
                type="text"
                required
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-elevated border border-border text-sm text-white font-mono focus:outline-none focus:border-cerulean"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted block mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-elevated border border-border text-sm text-white focus:outline-none focus:border-cerulean"
                />
                <Lock className="w-4 h-4 text-muted absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-cerulean hover:bg-cerulean-hover text-white text-sm font-bold shadow-cerulean transition-all disabled:opacity-50"
            >
              <span>{isLoading ? 'Updating...' : 'Set New Password'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Film, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { loginUser, clearError } from '../store/slices/authSlice';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { isLoading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const redirectPath = location.state?.from?.pathname || location.state?.from || '/';

  React.useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin' && redirectPath === '/') {
        navigate('/admin');
      } else {
        navigate(redirectPath);
      }
    }
  }, [isAuthenticated, user, navigate, redirectPath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    dispatch(loginUser({ email, password }));
  };

  const handleDemoLogin = (role) => {
    dispatch(clearError());
    if (role === 'admin') {
      setEmail('admin@imovies.com');
      setPassword('Admin@123456');
      dispatch(loginUser({ email: 'admin@imovies.com', password: 'Admin@123456' }));
    } else {
      setEmail('user@imovies.com');
      setPassword('User@123456');
      dispatch(loginUser({ email: 'user@imovies.com', password: 'User@123456' }));
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 p-8 rounded-3xl bg-card border border-border shadow-2xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-cerulean to-cerulean-light items-center justify-center shadow-cerulean mb-2">
            <Film className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Welcome Back</h2>
          <p className="text-xs text-muted">Sign in to your IMovies account to access your tickets</p>
        </div>

        {/* Demo Quick Logins */}
        <div className="p-3 rounded-2xl bg-elevated border border-border space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted block text-center">
            Demo Credentials
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('user')}
              className="py-1.5 px-2 rounded-lg bg-card hover:bg-cerulean/20 border border-border hover:border-cerulean text-[11px] font-bold text-white transition-all text-center"
            >
              Demo User
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="py-1.5 px-2 rounded-lg bg-card hover:bg-rose-neon/20 border border-border hover:border-rose-neon text-[11px] font-bold text-rose-neon transition-all text-center"
            >
              Demo Admin
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-error/15 border border-error/30 text-error text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-muted">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-cerulean hover:text-cerulean-light"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-elevated border border-border text-sm text-white placeholder-muted focus:outline-none focus:border-cerulean transition-all"
              />
              <Lock className="w-4 h-4 text-muted absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-cerulean hover:bg-cerulean-hover text-white text-sm font-bold flex items-center justify-center space-x-2 shadow-cerulean transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-muted">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-cerulean hover:underline">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

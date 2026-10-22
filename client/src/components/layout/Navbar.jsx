import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Film,
  MapPin,
  Search,
  User,
  LogOut,
  Ticket,
  ShieldAlert,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { setCity } from '../../store/slices/citySlice';
import { logoutUser } from '../../store/slices/authSlice';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { selectedCity, availableCities } = useSelector((state) => state.city);

  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleCitySelect = (city) => {
    dispatch(setCity(city));
    setIsCityDropdownOpen(false);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    setIsProfileDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Movies', path: '/movies' },
    { label: 'Theatres', path: '/theatres' },
    { label: 'My Bookings', path: '/my-bookings', authRequired: true }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-jet/90 backdrop-blur-md border-b border-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cerulean to-cerulean-light flex items-center justify-center shadow-cerulean">
                <Film className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold tracking-tight text-white flex items-center">
                  <span className="text-cerulean">I</span>MOVIES
                  <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-rose-neon shadow-rose animate-pulse-subtle"></span>
                </span>
                <span className="text-[10px] font-semibold tracking-widest text-muted uppercase -mt-1">
                  Cinemas
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                if (link.authRequired && !isAuthenticated) return null;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'text-white bg-cerulean/15 border border-cerulean/30 shadow-cerulean'
                        : 'text-muted hover:text-white hover:bg-card'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Search, City & Auth */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search movies, genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 rounded-full bg-card border border-border text-sm text-white placeholder-muted focus:outline-none focus:border-cerulean focus:ring-1 focus:ring-cerulean transition-all"
              />
              <Search className="w-4 h-4 text-muted absolute left-3.5 top-3" />
            </form>

            {/* City Selector */}
            <div className="relative">
              <button
                onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-card border border-border text-sm font-medium text-white hover:border-cerulean transition-all"
              >
                <MapPin className="w-4 h-4 text-rose-neon" />
                <span>{selectedCity}</span>
                <ChevronDown className="w-3.5 h-3.5 text-muted" />
              </button>

              {isCityDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl bg-elevated border border-border shadow-elevated py-1.5 z-50">
                  <div className="px-3 py-1 text-xs font-semibold uppercase text-muted tracking-wider">
                    Select City
                  </div>
                  {availableCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => handleCitySelect(city)}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-card transition-colors ${
                        selectedCity === city ? 'text-cerulean font-semibold' : 'text-white'
                      }`}
                    >
                      {city}
                      {selectedCity === city && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cerulean"></span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth Buttons / Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2.5 px-3 py-1.5 rounded-full bg-card border border-border hover:border-cerulean transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cerulean to-rose-neon flex items-center justify-center text-xs font-bold text-white uppercase">
                    {user?.name ? user.name.slice(0, 2) : 'IM'}
                  </div>
                  <span className="text-sm font-medium text-white max-w-[100px] truncate">
                    {user?.name || 'Account'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted" />
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-elevated border border-border shadow-elevated py-2 z-50">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                      <p className="text-xs text-muted truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-cerulean/20 text-cerulean border border-cerulean/30">
                        {user?.role === 'admin' ? 'Administrator' : 'Standard Member'}
                      </span>
                    </div>

                    <Link
                      to="/my-bookings"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-white hover:bg-card hover:text-cerulean transition-colors"
                    >
                      <Ticket className="w-4 h-4 text-cerulean" />
                      <span>My Bookings</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-white hover:bg-card hover:text-cerulean transition-colors"
                    >
                      <User className="w-4 h-4 text-muted" />
                      <span>Profile Settings</span>
                    </Link>

                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-rose-neon hover:bg-card transition-colors"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <div className="border-t border-border mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-error hover:bg-card transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-white hover:text-cerulean transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-cerulean hover:bg-cerulean-hover text-white transition-all shadow-cerulean"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-card border border-border text-muted hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-jet px-4 pt-4 pb-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-card border border-border text-sm text-white focus:outline-none focus:border-cerulean"
            />
            <Search className="w-4 h-4 text-muted absolute left-3 top-3" />
          </form>

          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-sm text-muted">City</span>
            <div className="flex space-x-2">
              {availableCities.map((city) => (
                <button
                  key={city}
                  onClick={() => handleCitySelect(city)}
                  className={`px-2.5 py-1 text-xs rounded-md ${
                    selectedCity === city
                      ? 'bg-cerulean text-white font-semibold'
                      : 'bg-card text-muted'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-white hover:bg-card"
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-rose-neon hover:bg-card"
              >
                Admin Dashboard
              </Link>
            )}
          </div>

          <div className="border-t border-border pt-4">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-lg text-sm font-semibold bg-card text-error hover:bg-elevated"
              >
                Sign Out ({user?.name})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2.5 text-center rounded-lg text-sm font-semibold bg-card text-white hover:bg-elevated"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2.5 text-center rounded-lg text-sm font-semibold bg-cerulean text-white hover:bg-cerulean-hover"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

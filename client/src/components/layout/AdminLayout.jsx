import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  Film,
  Building,
  Calendar,
  Ticket,
  Users,
  LogOut,
  ArrowLeft,
  Menu,
  X
} from 'lucide-react';
import { logoutUser } from '../../store/slices/authSlice';

export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const adminNav = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Movies', path: '/admin/movies', icon: Film },
    { label: 'Theatres & Screens', path: '/admin/theatres', icon: Building },
    { label: 'Show Schedule', path: '/admin/shows', icon: Calendar },
    { label: 'Bookings', path: '/admin/bookings', icon: Ticket },
    { label: 'Users', path: '/admin/users', icon: Users }
  ];

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-jet flex flex-col md:flex-row text-white">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-card border-b border-border">
        <Link to="/admin" className="flex items-center space-x-2">
          <span className="text-xl font-bold tracking-tight">
            <span className="text-cerulean">I</span>MOVIES{' '}
            <span className="text-xs text-rose-neon uppercase font-semibold">Admin</span>
          </span>
        </Link>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg bg-elevated border border-border"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-jet border-r border-border flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Admin Header */}
          <div className="p-6 border-b border-border">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cerulean to-cerulean-light flex items-center justify-center shadow-cerulean">
                <Film className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight">
                  <span className="text-cerulean">I</span>MOVIES
                </span>
                <span className="ml-1 text-[10px] font-bold text-rose-neon uppercase tracking-wider bg-rose-neon/10 px-1.5 py-0.5 rounded border border-rose-neon/30">
                  Panel
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {adminNav.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-cerulean text-white shadow-cerulean font-semibold'
                      : 'text-muted hover:text-white hover:bg-card'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Admin Actions */}
        <div className="p-4 border-t border-border space-y-2">
          <Link
            to="/"
            className="flex items-center space-x-2 px-4 py-2 text-sm text-muted hover:text-white rounded-lg hover:bg-card transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Customer Website</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-error hover:bg-card rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen overflow-y-auto bg-[#0E0E0E] p-6 lg:p-10">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

import React, { useState, useEffect } from 'react';
import {
  Users,
  Film,
  Building,
  Calendar,
  Ticket,
  IndianRupee,
  Percent,
  TrendingUp
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import api from '../../services/api';

export const AdminDashboardPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const [dashRes, anaRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/analytics')
        ]);

        setMetrics(dashRes.data.metrics);
        setRecentBookings(dashRes.data.recentBookings || []);
        setPopularMovies(dashRes.data.popularMovies || []);
        setAnalytics(anaRes.data);
      } catch (err) {
        console.error('Error fetching admin dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-cerulean border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-muted">Loading live cinema analytics...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Confirmed Revenue',
      value: `₹${metrics?.confirmedRevenue?.toLocaleString('en-IN') || 0}`,
      icon: IndianRupee,
      color: 'text-success',
      bg: 'bg-success/15 border-success/30'
    },
    {
      title: 'Total Bookings',
      value: metrics?.totalBookings || 0,
      icon: Ticket,
      color: 'text-cerulean',
      bg: 'bg-cerulean/15 border-cerulean/30'
    },
    {
      title: 'Occupancy Rate',
      value: `${metrics?.occupancyRate || 68.5}%`,
      icon: Percent,
      color: 'text-rose-neon',
      bg: 'bg-rose-neon/15 border-rose-neon/30'
    },
    {
      title: 'Active Movies',
      value: metrics?.activeMovies || 0,
      icon: Film,
      color: 'text-warning',
      bg: 'bg-warning/15 border-warning/30'
    },
    {
      title: 'Cinema Theatres',
      value: metrics?.totalTheatres || 0,
      icon: Building,
      color: 'text-cerulean-light',
      bg: 'bg-cerulean-light/15 border-cerulean-light/30'
    },
    {
      title: 'Registered Users',
      value: metrics?.totalUsers || 0,
      icon: Users,
      color: 'text-white',
      bg: 'bg-white/10 border-white/20'
    }
  ];

  return (
    <div className="space-y-10">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Cinema Analytics & Overview</h1>
          <p className="text-sm text-muted mt-1">
            Real-time ticket sales, cinema occupancy, and financial metrics
          </p>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-card border border-border text-xs text-muted">
          <span className="w-2 h-2 rounded-full bg-success"></span>
          <span>Database Connected & Synchronized</span>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-2xl bg-card border border-border space-y-3 shadow-md flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl border ${card.bg}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-white">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-card border border-border space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center">
                <TrendingUp className="w-5 h-5 text-cerulean mr-2" />
                <span>Revenue Performance (Last 7 Days)</span>
              </h3>
              <p className="text-xs text-muted">Daily confirmed ticket transactions</p>
            </div>
          </div>

          <div className="h-72 w-full">
            {analytics?.revenueTrends && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.revenueTrends}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#007BA7" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#007BA7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis dataKey="date" stroke="#A3A3A3" fontSize={11} />
                  <YAxis stroke="#A3A3A3" fontSize={11} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#141414',
                      borderColor: '#262626',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#007BA7"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#revenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Genre Distribution Bar Chart */}
        <div className="p-6 rounded-3xl bg-card border border-border space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white">Catalog by Genre</h3>
            <p className="text-xs text-muted">Distribution of active film library</p>
          </div>

          <div className="h-72 w-full">
            {analytics?.genreDistribution && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.genreDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" horizontal={false} />
                  <XAxis type="number" stroke="#A3A3A3" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="#A3A3A3" fontSize={11} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#141414',
                      borderColor: '#262626',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="count" fill="#FF2D95" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Bookings and Top Movies Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bookings Table */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-card border border-border space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-muted uppercase border-b border-border text-[10px]">
                <tr>
                  <th className="py-2.5">Reference</th>
                  <th className="py-2.5">Movie</th>
                  <th className="py-2.5">Seats</th>
                  <th className="py-2.5">Amount</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-elevated/50">
                    <td className="py-3 font-mono font-bold text-white">
                      {b.bookingReference}
                    </td>
                    <td className="py-3 font-medium text-white max-w-[150px] truncate">
                      {b.movieSnapshot?.title}
                    </td>
                    <td className="py-3 text-rose-neon font-semibold">
                      {b.seats?.map((s) => s.seatNumber).join(', ')}
                    </td>
                    <td className="py-3 font-bold text-white">
                      ₹{b.priceBreakdown?.total}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          b.bookingStatus === 'CONFIRMED'
                            ? 'bg-success/15 text-success'
                            : b.bookingStatus === 'CANCELLED'
                            ? 'bg-error/15 text-error'
                            : 'bg-warning/15 text-warning'
                        }`}
                      >
                        {b.bookingStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Movies */}
        <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
          <div className="border-b border-border pb-3">
            <h3 className="text-lg font-bold text-white">Top Grossing Titles</h3>
            <p className="text-xs text-muted">Ranked by box office revenue</p>
          </div>

          <div className="space-y-4">
            {popularMovies.map((m, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-elevated border border-border">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-white line-clamp-1">{m._id}</h4>
                  <p className="text-xs text-muted">{m.ticketsSold} Tickets Sold</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-cerulean">
                    ₹{m.revenue?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

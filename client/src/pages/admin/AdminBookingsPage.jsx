import React, { useState, useEffect } from 'react';
import { Ticket, Search, Filter, Calendar, MapPin, CheckCircle2, XCircle } from 'lucide-react';
import api from '../../services/api';

export const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const res = await api.get(`/admin/bookings?${params.toString()}`);
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [search, statusFilter]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Booking Management</h1>
          <p className="text-sm text-muted mt-1">Audit customer reservations and payment records</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search reference or movie..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-card border border-border text-xs text-white placeholder-muted focus:outline-none focus:border-cerulean"
            />
            <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-2.5" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 rounded-xl bg-card border border-border text-xs text-white focus:outline-none focus:border-cerulean"
          >
            <option value="">All Statuses</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PENDING">PENDING</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-elevated border-b border-border text-muted uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Reference</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Movie & Cinema</th>
                <th className="p-4">Seats</th>
                <th className="p-4">Paid Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bookings.map((b) => (
                <tr key={b._id} className="hover:bg-elevated/50 transition-colors">
                  <td className="p-4 font-mono font-bold text-white">{b.bookingReference}</td>
                  <td className="p-4">
                    <p className="font-semibold text-white">{b.user?.name || 'Customer'}</p>
                    <p className="text-muted text-[11px]">{b.user?.email}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-white">{b.movieSnapshot?.title}</p>
                    <p className="text-muted text-[11px]">{b.theatreSnapshot?.name}</p>
                  </td>
                  <td className="p-4 font-bold text-rose-neon">
                    {b.seats?.map((s) => s.seatNumber).join(', ')}
                  </td>
                  <td className="p-4 font-extrabold text-white">
                    ₹{b.priceBreakdown?.total}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
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
                  <td className="p-4 text-muted">
                    {new Date(b.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminBookingsPage;

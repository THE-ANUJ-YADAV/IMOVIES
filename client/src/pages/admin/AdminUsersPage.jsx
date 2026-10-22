import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, Ban, CheckCircle, Mail, Phone } from 'lucide-react';
import api from '../../services/api';

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/admin/users?search=${encodeURIComponent(search)}`);
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleToggleStatus = async (user) => {
    if (user.role === 'admin') {
      alert('Cannot change status of admin user');
      return;
    }
    try {
      await api.patch(`/admin/users/${user._id}/toggle-status`);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to update user status');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">User Accounts</h1>
          <p className="text-sm text-muted mt-1">Manage customer memberships and administrative roles</p>
        </div>

        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-card border border-border text-xs text-white placeholder-muted focus:outline-none focus:border-cerulean"
          />
          <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-elevated border-b border-border text-muted uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-elevated/50 transition-colors">
                  <td className="p-4 font-bold text-white flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-elevated border border-border flex items-center justify-center text-xs font-bold text-cerulean uppercase">
                      {u.name?.slice(0, 2)}
                    </div>
                    <span>{u.name}</span>
                  </td>
                  <td className="p-4 text-muted">{u.email}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-rose-neon/15 text-rose-neon border border-rose-neon/30'
                          : 'bg-cerulean/15 text-cerulean border border-cerulean/30'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-muted">{u.phone || '—'}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.status === 'active'
                          ? 'bg-success/15 text-success'
                          : 'bg-error/15 text-error'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          u.status === 'active'
                            ? 'bg-error/10 hover:bg-error/20 text-error border border-error/30'
                            : 'bg-success/10 hover:bg-success/20 text-success border border-success/30'
                        }`}
                      >
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    )}
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

export default AdminUsersPage;

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, Mail, Phone, Shield, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { updateUserData } from '../store/slices/authSlice';

export const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setMessage({ text: '', type: '' });
      const res = await api.patch('/auth/profile', { name, phone });
      dispatch(updateUserData(res.data.user));
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      setMessage({ text: err.message || 'Failed to update profile', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-extrabold text-white">Profile Settings</h1>
        <p className="text-sm text-muted mt-1">Manage your personal information and contact details</p>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-2xl text-sm flex items-center space-x-2 ${
            message.type === 'success'
              ? 'bg-success/15 border border-success/30 text-success'
              : 'bg-error/15 border border-error/30 text-error'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="p-8 rounded-3xl bg-card border border-border space-y-6">
        <div className="flex items-center space-x-4 border-b border-border pb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cerulean to-rose-neon flex items-center justify-center text-xl font-extrabold text-white uppercase shadow-cerulean">
            {user?.name ? user.name.slice(0, 2) : 'IM'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{user?.name}</h3>
            <p className="text-xs text-muted">{user?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-cerulean/20 text-cerulean border border-cerulean/30">
              {user?.role === 'admin' ? 'Administrator' : 'Standard Member'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted block mb-1.5">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-elevated border border-border text-sm text-white focus:outline-none focus:border-cerulean transition-all"
              />
              <User className="w-4 h-4 text-muted absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted block mb-1.5">Email Address</label>
            <div className="relative">
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-elevated/50 border border-border text-sm text-muted cursor-not-allowed"
              />
              <Mail className="w-4 h-4 text-muted absolute left-3.5 top-3" />
            </div>
            <span className="text-[10px] text-muted mt-1 block">Email address cannot be modified</span>
          </div>

          <div>
            <label className="text-xs font-bold text-muted block mb-1.5">Phone Number</label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-elevated border border-border text-sm text-white focus:outline-none focus:border-cerulean transition-all"
              />
              <Phone className="w-4 h-4 text-muted absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 rounded-xl bg-cerulean hover:bg-cerulean-hover text-white text-xs font-bold flex items-center space-x-2 shadow-cerulean transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;

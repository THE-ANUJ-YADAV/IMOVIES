import React, { useState, useEffect } from 'react';
import { Building, Plus, Trash2, Edit2, MapPin, X, AlertCircle, Monitor } from 'lucide-react';
import api from '../../services/api';

export const AdminTheatresPage = () => {
  const [theatres, setTheatres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTheatreModalOpen, setIsTheatreModalOpen] = useState(false);
  const [isScreenModalOpen, setIsScreenModalOpen] = useState(false);
  const [selectedTheatreId, setSelectedTheatreId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [theatreForm, setTheatreForm] = useState({
    name: '',
    city: 'Mumbai',
    address: '',
    facilities: 'Dolby Atmos, 4K Laser, Valet Parking, Food Court'
  });

  const [screenForm, setScreenForm] = useState({
    name: 'Audi 1 (IMAX)',
    screenNumber: 1,
    rows: 8,
    columns: 12,
    formats: 'IMAX 2D, 2D, 3D'
  });

  const fetchTheatres = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/theatres');
      setTheatres(res.data.theatres || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTheatres();
  }, []);

  const handleCreateTheatre = async (e) => {
    e.preventDefault();
    try {
      setErrorMessage('');
      await api.post('/theatres', {
        ...theatreForm,
        facilities: theatreForm.facilities.split(',').map((f) => f.trim()).filter(Boolean)
      });
      setIsTheatreModalOpen(false);
      fetchTheatres();
    } catch (err) {
      setErrorMessage(err.message || 'Error creating theatre');
    }
  };

  const handleCreateScreen = async (e) => {
    e.preventDefault();
    try {
      setErrorMessage('');
      await api.post('/theatres/screens', {
        theatre: selectedTheatreId,
        name: screenForm.name,
        screenNumber: parseInt(screenForm.screenNumber, 10),
        supportedFormats: screenForm.formats.split(',').map((f) => f.trim()).filter(Boolean)
      });
      setIsScreenModalOpen(false);
      fetchTheatres();
    } catch (err) {
      setErrorMessage(err.message || 'Error creating screen');
    }
  };

  const handleDeleteTheatre = async (id) => {
    if (!window.confirm('Delete this theatre and associated screens?')) return;
    try {
      await api.delete(`/theatres/${id}`);
      fetchTheatres();
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Theatres & Screens</h1>
          <p className="text-sm text-muted mt-1">Manage cinema multiplexes and auditoriums</p>
        </div>

        <button
          onClick={() => {
            setTheatreForm({
              name: '',
              city: 'Mumbai',
              address: '',
              facilities: 'Dolby Atmos, 4K Laser, Valet Parking, Food Court'
            });
            setIsTheatreModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-cerulean hover:bg-cerulean-hover text-white text-xs font-bold flex items-center space-x-2 shadow-cerulean transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Cinema Theatre</span>
        </button>
      </div>

      {/* Theatres List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {theatres.map((t) => (
          <div key={t._id} className="p-6 rounded-3xl bg-card border border-border space-y-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">{t.name}</h3>
                <div className="flex items-center space-x-1 text-xs text-muted mt-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-neon" />
                  <span>{t.address}, {t.city}</span>
                </div>
              </div>

              <button
                onClick={() => handleDeleteTheatre(t._id)}
                className="p-1.5 rounded-lg bg-elevated hover:bg-card text-error hover:text-red-400 border border-border"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Screens */}
            <div className="bg-elevated p-4 rounded-2xl border border-border space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-muted uppercase">Auditoriums ({t.screens?.length || 0})</span>
                <button
                  onClick={() => {
                    setSelectedTheatreId(t._id);
                    setIsScreenModalOpen(true);
                  }}
                  className="text-cerulean hover:text-cerulean-light flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Screen</span>
                </button>
              </div>

              <div className="space-y-2">
                {t.screens?.map((screen) => (
                  <div
                    key={screen._id}
                    className="flex items-center justify-between p-2 rounded-xl bg-card border border-border text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <Monitor className="w-4 h-4 text-cerulean" />
                      <span className="font-semibold text-white">{screen.name}</span>
                    </div>
                    <span className="text-muted">
                      {screen.supportedFormats?.join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Theatre Modal */}
      {isTheatreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-white">Add Theatre Location</h3>
              <button onClick={() => setIsTheatreModalOpen(false)} className="text-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-error/15 border border-error/30 text-error text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateTheatre} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-muted block mb-1">Theatre Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IMovies PVR Phoenix"
                  value={theatreForm.name}
                  onChange={(e) => setTheatreForm({ ...theatreForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-elevated border border-border text-white focus:outline-none focus:border-cerulean"
                />
              </div>

              <div>
                <label className="font-bold text-muted block mb-1">City</label>
                <select
                  value={theatreForm.city}
                  onChange={(e) => setTheatreForm({ ...theatreForm, city: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-elevated border border-border text-white focus:outline-none focus:border-cerulean"
                >
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Hyderabad">Hyderabad</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-muted block mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={theatreForm.address}
                  onChange={(e) => setTheatreForm({ ...theatreForm, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-elevated border border-border text-white focus:outline-none focus:border-cerulean"
                />
              </div>

              <div>
                <label className="font-bold text-muted block mb-1">Facilities (comma separated)</label>
                <input
                  type="text"
                  value={theatreForm.facilities}
                  onChange={(e) => setTheatreForm({ ...theatreForm, facilities: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-elevated border border-border text-white focus:outline-none focus:border-cerulean"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsTheatreModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-elevated text-white hover:bg-card border border-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-cerulean text-white font-bold hover:bg-cerulean-hover shadow-cerulean"
                >
                  Save Theatre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Screen Modal */}
      {isScreenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-white">Add Screen / Auditorium</h3>
              <button onClick={() => setIsScreenModalOpen(false)} className="text-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateScreen} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-muted block mb-1">Screen Name</label>
                <input
                  type="text"
                  required
                  value={screenForm.name}
                  onChange={(e) => setScreenForm({ ...screenForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-elevated border border-border text-white focus:outline-none focus:border-cerulean"
                />
              </div>

              <div>
                <label className="font-bold text-muted block mb-1">Screen Number</label>
                <input
                  type="number"
                  required
                  value={screenForm.screenNumber}
                  onChange={(e) => setScreenForm({ ...screenForm, screenNumber: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-elevated border border-border text-white focus:outline-none focus:border-cerulean"
                />
              </div>

              <div>
                <label className="font-bold text-muted block mb-1">Supported Formats (comma separated)</label>
                <input
                  type="text"
                  value={screenForm.formats}
                  onChange={(e) => setScreenForm({ ...screenForm, formats: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-elevated border border-border text-white focus:outline-none focus:border-cerulean"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsScreenModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-elevated text-white hover:bg-card border border-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-cerulean text-white font-bold hover:bg-cerulean-hover shadow-cerulean"
                >
                  Create Screen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTheatresPage;

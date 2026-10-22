import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Clock, X, AlertCircle, Film, Building } from 'lucide-react';
import api from '../../services/api';

export const AdminShowsPage = () => {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [screens, setScreens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [form, setForm] = useState({
    movie: '',
    theatre: '',
    screen: '',
    startTime: '',
    endTime: '',
    format: 'IMAX 2D',
    language: 'English',
    priceStandard: 250,
    pricePremium: 380,
    priceRecliner: 550
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [showsRes, moviesRes, theatresRes] = await Promise.all([
        api.get('/shows'),
        api.get('/movies?limit=100'),
        api.get('/theatres')
      ]);

      setShows(showsRes.data.shows || []);
      setMovies(moviesRes.data.movies || []);
      setTheatres(theatresRes.data.theatres || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTheatreChange = (theatreId) => {
    const selected = theatres.find((t) => t._id === theatreId);
    setScreens(selected?.screens || []);
    setForm({
      ...form,
      theatre: theatreId,
      screen: selected?.screens?.[0]?._id || ''
    });
  };

  const handleCreateShow = async (e) => {
    e.preventDefault();
    try {
      setErrorMessage('');
      await api.post('/shows', {
        movie: form.movie,
        theatre: form.theatre,
        screen: form.screen,
        startTime: new Date(form.startTime),
        endTime: new Date(form.endTime),
        format: form.format,
        language: form.language,
        pricing: [
          { category: 'Standard', price: parseInt(form.priceStandard, 10) },
          { category: 'Premium', price: parseInt(form.pricePremium, 10) },
          { category: 'Recliner', price: parseInt(form.priceRecliner, 10) }
        ]
      });

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setErrorMessage(err.message || 'Error scheduling show. Check screen conflicts.');
    }
  };

  const handleDeleteShow = async (id) => {
    if (!window.confirm('Cancel this show?')) return;
    try {
      await api.delete(`/shows/${id}`);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to cancel show');
    }
  };

  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Show Scheduling</h1>
          <p className="text-sm text-muted mt-1">
            Schedule cinema showtimes and configure category-wise seat prices
          </p>
        </div>

        <button
          onClick={() => {
            if (movies.length > 0 && theatres.length > 0) {
              const defaultTheatre = theatres[0];
              setScreens(defaultTheatre.screens || []);
              const now = new Date();
              now.setHours(now.getHours() + 2, 0, 0, 0);
              const end = new Date(now);
              end.setMinutes(end.getMinutes() + 150);

              setForm({
                movie: movies[0]._id,
                theatre: defaultTheatre._id,
                screen: defaultTheatre.screens?.[0]?._id || '',
                startTime: now.toISOString().slice(0, 16),
                endTime: end.toISOString().slice(0, 16),
                format: 'IMAX 2D',
                language: 'English',
                priceStandard: 250,
                pricePremium: 380,
                priceRecliner: 550
              });
            }
            setIsModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-cerulean hover:bg-cerulean-hover text-white text-xs font-bold flex items-center space-x-2 shadow-cerulean transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Show</span>
        </button>
      </div>

      {/* Shows Table */}
      <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-elevated border-b border-border text-muted uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Movie</th>
                <th className="p-4">Cinema & Screen</th>
                <th className="p-4">Time Window</th>
                <th className="p-4">Format</th>
                <th className="p-4">Pricing</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {shows.map((show) => (
                <tr key={show._id} className="hover:bg-elevated/50 transition-colors">
                  <td className="p-4 font-bold text-white text-sm">
                    {show.movie?.title || 'Unknown Title'}
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-white">{show.theatre?.name}</p>
                    <p className="text-muted text-[11px]">{show.screen?.name}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-1.5 text-cerulean font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDateTime(show.startTime)}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cerulean/15 text-cerulean border border-cerulean/30 uppercase">
                      {show.format}
                    </span>
                  </td>
                  <td className="p-4 text-white font-medium">
                    {show.pricing?.map((p) => `${p.category}: ₹${p.price}`).join(' | ')}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeleteShow(show._id)}
                      className="p-1.5 rounded-lg bg-elevated hover:bg-card border border-border text-error hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Show Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-lg w-full my-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-white">Schedule New Show</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-error/15 border border-error/30 text-error text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateShow} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-muted block mb-1">Select Movie</label>
                <select
                  value={form.movie}
                  onChange={(e) => setForm({ ...form, movie: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-elevated border border-border text-white focus:outline-none focus:border-cerulean"
                >
                  {movies.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title} ({m.certification}) - {m.duration} mins
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-muted block mb-1">Select Theatre</label>
                  <select
                    value={form.theatre}
                    onChange={(e) => handleTheatreChange(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-elevated border border-border text-white focus:outline-none focus:border-cerulean"
                  >
                    {theatres.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name} ({t.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-muted block mb-1">Auditorium / Screen</label>
                  <select
                    value={form.screen}
                    onChange={(e) => setForm({ ...form, screen: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-elevated border border-border text-white focus:outline-none focus:border-cerulean"
                  >
                    {screens.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-muted block mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-elevated border border-border text-white focus:outline-none focus:border-cerulean"
                  />
                </div>

                <div>
                  <label className="font-bold text-muted block mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-elevated border border-border text-white focus:outline-none focus:border-cerulean"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-muted block mb-1">Format</label>
                  <select
                    value={form.format}
                    onChange={(e) => setForm({ ...form, format: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-elevated border border-border text-white focus:outline-none focus:border-cerulean"
                  >
                    <option value="IMAX 2D">IMAX 2D</option>
                    <option value="2D">2D</option>
                    <option value="3D">3D</option>
                    <option value="4DX">4DX</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-muted block mb-1">Language</label>
                  <select
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-elevated border border-border text-white focus:outline-none focus:border-cerulean"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Telugu">Telugu</option>
                  </select>
                </div>
              </div>

              {/* Tiered Category Pricing */}
              <div className="p-3 bg-elevated rounded-2xl border border-border space-y-2">
                <span className="font-bold text-white block">Category Pricing (INR)</span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-muted block text-[10px]">Standard (₹)</label>
                    <input
                      type="number"
                      value={form.priceStandard}
                      onChange={(e) => setForm({ ...form, priceStandard: e.target.value })}
                      className="w-full p-2 rounded-lg bg-card border border-border text-white"
                    />
                  </div>
                  <div>
                    <label className="text-muted block text-[10px]">Premium (₹)</label>
                    <input
                      type="number"
                      value={form.pricePremium}
                      onChange={(e) => setForm({ ...form, pricePremium: e.target.value })}
                      className="w-full p-2 rounded-lg bg-card border border-border text-white"
                    />
                  </div>
                  <div>
                    <label className="text-rose-neon block text-[10px] font-bold">Recliner (₹)</label>
                    <input
                      type="number"
                      value={form.priceRecliner}
                      onChange={(e) => setForm({ ...form, priceRecliner: e.target.value })}
                      className="w-full p-2 rounded-lg bg-card border border-border text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-elevated text-white hover:bg-card border border-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-cerulean text-white font-bold hover:bg-cerulean-hover shadow-cerulean"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShowsPage;

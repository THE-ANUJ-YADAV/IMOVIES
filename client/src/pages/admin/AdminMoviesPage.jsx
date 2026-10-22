import React, { useState, useEffect } from 'react';
import { Film, Plus, Trash2, Edit2, Star, Clock, X, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export const AdminMoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    synopsis: '',
    posterUrl: '',
    backdropUrl: '',
    trailerUrl: '',
    genres: 'Action, Sci-Fi',
    languages: 'English, Hindi',
    duration: 150,
    releaseDate: new Date().toISOString().split('T')[0],
    certification: 'UA',
    status: 'now_showing',
    formats: '2D, 3D, IMAX 2D'
  });

  const fetchMovies = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/movies?limit=100');
      setMovies(res.data.movies || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleOpenCreate = () => {
    setEditingMovie(null);
    setFormData({
      title: '',
      synopsis: '',
      posterUrl: '',
      backdropUrl: '',
      trailerUrl: '',
      genres: 'Action, Sci-Fi',
      languages: 'English, Hindi',
      duration: 150,
      releaseDate: new Date().toISOString().split('T')[0],
      certification: 'UA',
      status: 'now_showing',
      formats: '2D, 3D, IMAX 2D'
    });
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title,
      synopsis: movie.synopsis,
      posterUrl: movie.posterUrl,
      backdropUrl: movie.backdropUrl || '',
      trailerUrl: movie.trailerUrl || '',
      genres: movie.genres?.join(', ') || '',
      languages: movie.languages?.join(', ') || '',
      duration: movie.duration,
      releaseDate: new Date(movie.releaseDate).toISOString().split('T')[0],
      certification: movie.certification,
      status: movie.status,
      formats: movie.formats?.join(', ') || ''
    });
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this movie from the catalog?')) return;
    try {
      await api.delete(`/movies/${id}`);
      fetchMovies();
    } catch (err) {
      alert(err.message || 'Failed to delete movie');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setErrorMessage('');
      const payload = {
        ...formData,
        genres: formData.genres.split(',').map((s) => s.trim()).filter(Boolean),
        languages: formData.languages.split(',').map((s) => s.trim()).filter(Boolean),
        formats: formData.formats.split(',').map((s) => s.trim()).filter(Boolean),
        duration: parseInt(formData.duration, 10)
      };

      if (editingMovie) {
        await api.patch(`/movies/${editingMovie._id}`, payload);
      } else {
        await api.post('/movies', payload);
      }

      setIsModalOpen(false);
      fetchMovies();
    } catch (err) {
      setErrorMessage(err.message || 'Error saving movie');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Movie Management</h1>
          <p className="text-sm text-muted mt-1">Add, update, and manage movies in the catalog</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded-xl bg-cerulean hover:bg-cerulean-hover text-white text-xs font-bold flex items-center space-x-2 shadow-cerulean transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Movie</span>
        </button>
      </div>

      {/* Movies Table */}
      <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-elevated border-b border-border text-muted uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Movie</th>
                <th className="p-4">Genres</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Cert</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {movies.map((m) => (
                <tr key={m._id} className="hover:bg-elevated/50 transition-colors">
                  <td className="p-4 flex items-center space-x-3">
                    <img
                      src={m.posterUrl}
                      alt={m.title}
                      className="w-10 h-14 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm">{m.title}</h4>
                      <p className="text-muted text-[11px]">{m.formats?.join(', ')}</p>
                    </div>
                  </td>
                  <td className="p-4 text-muted">{m.genres?.join(', ')}</td>
                  <td className="p-4 text-white font-medium">{m.duration} mins</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-elevated border border-border text-[10px] font-bold text-white">
                      {m.certification}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        m.status === 'now_showing'
                          ? 'bg-success/15 text-success'
                          : 'bg-warning/15 text-warning'
                      }`}
                    >
                      {m.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(m)}
                      className="p-1.5 rounded-lg bg-elevated hover:bg-card border border-border text-cerulean hover:text-cerulean-light transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(m._id)}
                      className="p-1.5 rounded-lg bg-elevated hover:bg-card border border-border text-error hover:text-red-400 transition-colors"
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-xl w-full my-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-bold text-white">
                {editingMovie ? 'Edit Movie' : 'Add New Movie'}
              </h3>
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

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-muted block mb-1">Movie Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-elevated border border-border text-white focus:outline-none focus:border-cerulean"
                />
              </div>

              <div>
                <label className="font-bold text-muted block mb-1">Synopsis</label>
                <textarea
                  required
                  rows={3}
                  value={formData.synopsis}
                  onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-elevated border border-border text-white focus:outline-none focus:border-cerulean"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-muted block mb-1">Poster URL</label>
                  <input
                    type="url"
                    required
                    value={formData.posterUrl}
                    onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-elevated border border-border text-white focus:outline-none focus:border-cerulean"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted block mb-1">Backdrop URL</label>
                  <input
                    type="url"
                    value={formData.backdropUrl}
                    onChange={(e) => setFormData({ ...formData, backdropUrl: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-elevated border border-border text-white focus:outline-none focus:border-cerulean"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-muted block mb-1">Trailer URL (YouTube)</label>
                  <input
                    type="url"
                    value={formData.trailerUrl}
                    onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-elevated border border-border text-white focus:outline-none focus:border-cerulean"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted block mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-elevated border border-border text-white focus:outline-none focus:border-cerulean"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-muted block mb-1">Certification</label>
                  <select
                    value={formData.certification}
                    onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-elevated border border-border text-white focus:outline-none focus:border-cerulean"
                  >
                    <option value="U">U</option>
                    <option value="UA">UA</option>
                    <option value="A">A</option>
                    <option value="R">R</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-muted block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-elevated border border-border text-white focus:outline-none focus:border-cerulean"
                  >
                    <option value="now_showing">Now Showing</option>
                    <option value="coming_soon">Coming Soon</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-muted block mb-1">Release Date</label>
                  <input
                    type="date"
                    required
                    value={formData.releaseDate}
                    onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-elevated border border-border text-white focus:outline-none focus:border-cerulean"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-muted block mb-1">Genres (comma separated)</label>
                  <input
                    type="text"
                    value={formData.genres}
                    onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-elevated border border-border text-white focus:outline-none focus:border-cerulean"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted block mb-1">Formats (comma separated)</label>
                  <input
                    type="text"
                    value={formData.formats}
                    onChange={(e) => setFormData({ ...formData, formats: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-elevated border border-border text-white focus:outline-none focus:border-cerulean"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-border">
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
                  {editingMovie ? 'Save Changes' : 'Create Movie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMoviesPage;

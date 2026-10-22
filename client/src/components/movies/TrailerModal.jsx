import React from 'react';
import { X } from 'lucide-react';

export const TrailerModal = ({ isOpen, onClose, trailerUrl, movieTitle }) => {
  if (!isOpen) return null;

  // Transform standard YouTube URL to embed URL
  let embedUrl = trailerUrl;
  if (trailerUrl && trailerUrl.includes('watch?v=')) {
    embedUrl = trailerUrl.replace('watch?v=', 'embed/') + '?autoplay=1';
  } else if (trailerUrl && trailerUrl.includes('youtu.be/')) {
    embedUrl = trailerUrl.replace('youtu.be/', 'youtube.com/embed/') + '?autoplay=1';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-elevated">
          <h3 className="text-lg font-bold text-white truncate">{movieTitle} — Official Trailer</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted hover:text-white hover:bg-card transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video w-full bg-black">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={movieTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted">
              Trailer video is not available at this moment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrailerModal;

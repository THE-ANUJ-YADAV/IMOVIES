import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 space-y-5">
      <div className="w-16 h-16 rounded-3xl bg-card border border-border flex items-center justify-center text-rose-neon shadow-rose">
        <Film className="w-8 h-8" />
      </div>
      <div className="space-y-1">
        <h1 className="text-5xl font-extrabold text-white">404</h1>
        <h2 className="text-xl font-bold text-muted">Scene Not Found</h2>
        <p className="text-sm text-muted max-w-sm mx-auto">
          The cinema reel you are looking for does not exist or has been moved.
        </p>
      </div>
      <Link
        to="/"
        className="px-6 py-3 rounded-xl bg-cerulean hover:bg-cerulean-hover text-white text-xs font-bold flex items-center space-x-2 shadow-cerulean transition-all"
      >
        <Home className="w-4 h-4" />
        <span>Return to Premiere</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;

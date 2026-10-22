import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Heart, Shield, HelpCircle, Mail, Phone } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-jet border-t border-border mt-20 pt-16 pb-12 text-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-border">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cerulean to-cerulean-light flex items-center justify-center shadow-cerulean">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                <span className="text-cerulean">I</span>MOVIES
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-muted">
              Next-generation cinematic movie booking platform. Reserve your dream seats in real-time with instant digital QR tickets.
            </p>
            <div className="flex items-center space-x-2 text-xs text-muted">
              <Shield className="w-4 h-4 text-cerulean" />
              <span>100% Secure Checkout & Ticket Verification</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/movies" className="hover:text-cerulean transition-colors">
                  Now Showing
                </Link>
              </li>
              <li>
                <Link to="/movies?status=coming_soon" className="hover:text-cerulean transition-colors">
                  Coming Soon
                </Link>
              </li>
              <li>
                <Link to="/theatres" className="hover:text-cerulean transition-colors">
                  Cinemas & Theatres
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="hover:text-cerulean transition-colors">
                  My Bookings
                </Link>
              </li>
            </ul>
          </div>

          {/* Cinema Formats */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Premium Formats
            </h4>
            <div className="flex flex-wrap gap-2">
              {['IMAX 2D', 'Dolby Atmos', '4DX', 'RealD 3D', 'Gold Class', 'Laser Projection'].map(
                (fmt) => (
                  <span
                    key={fmt}
                    className="px-2.5 py-1 rounded bg-card border border-border text-xs text-white"
                  >
                    {fmt}
                  </span>
                )
              )}
            </div>
            <div className="mt-4 text-xs text-muted">
              Experience the highest audiovisual standards in partner luxury auditoriums.
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Help & Support
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-rose-neon" />
                <span>support@imovies.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-cerulean" />
                <span>+91 1800-419-MOVIES</span>
              </li>
              <li className="flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-muted" />
                <span>Cancellation & Refund Policy</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-muted space-y-4 sm:space-y-0">
          <div>
            &copy; {new Date().getFullYear()} IMovies Cinema Network. All rights reserved.
          </div>
          <div className="flex items-center space-x-6">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span className="hover:text-white cursor-pointer">Security Safeguards</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

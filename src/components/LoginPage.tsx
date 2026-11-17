import React, { useState } from 'react';
import { ArrowRight, Compass, Eye, EyeOff, Lock, User } from 'lucide-react';

interface LoginPageProps {
  onLogin: (username: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [imgError, setImgError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUser = username.trim();
    if (!trimmedUser) {
      setError('Please enter your username.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    setError('');
    onLogin(trimmedUser);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:grid lg:grid-cols-12">
      {/* Left Visual Showcase Column */}
      <div className="relative lg:col-span-7 min-h-[280px] lg:min-h-screen bg-slate-900 overflow-hidden flex flex-col justify-between p-8 sm:p-12">
        {!imgError ? (
          <img
            src="/src/assets/images/dest_kyoto_hero_1794940093397.jpg"
            alt="Golden hour street view in Kyoto leading toward Yasaka Pagoda"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900" />
        )}

        {/* Measured contrast scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-slate-950/50" />

        {/* Brand Mark */}
        <div className="relative z-10 flex items-center gap-2.5 text-white">
          <Compass className="w-5 h-5 text-sky-400 shrink-0" aria-hidden="true" />
          <span className="font-display text-lg font-bold tracking-tight whitespace-nowrap">
            TripTuner
          </span>
        </div>

        {/* Editorial Headline */}
        <div className="relative z-10 max-w-xl text-white mt-12 lg:mt-0">
          <p className="text-xs font-medium text-sky-300 tracking-wide mb-2.5">
            Intelligent Travel Planner · Route, Budget & Weather Engine
          </p>
          <h1
            className="font-display font-bold tracking-tight leading-[1.1] text-white mb-3"
            style={{ fontSize: 'clamp(1.85rem, 3.2vw, 2.85rem)', textWrap: 'balance' }}
          >
            Design thoughtful, day-wise itineraries tailored to how you travel.
          </h1>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
            Build timed schedules with local food pairings, interactive route maps, multi-day weather previews, and live four-category expense tracking.
          </p>
        </div>
      </div>

      {/* Right Sign-In Panel */}
      <div className="lg:col-span-5 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md space-y-7">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Sign in to TripTuner
            </h2>
            <p className="text-sm text-slate-600 mt-1.5">
              Enter your username and password to open your travel planner and saved itineraries.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {error && (
              <div
                role="alert"
                className="px-3.5 py-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800"
              >
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="login-username"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Username
              </label>
              <div className="relative">
                <User
                  className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="login-username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter your username"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter your password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-11 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Eye className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-sky-700 hover:bg-sky-800 text-white text-sm font-semibold rounded-lg transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>

          <div className="pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Kyoto · Amalfi · Reykjavik · Tokyo · Banff</span>
            <span className="font-mono text-slate-400">TripTuner</span>
          </div>
        </div>
      </div>
    </div>
  );
};

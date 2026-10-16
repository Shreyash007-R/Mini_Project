import React, { useState } from 'react';
import { Eye, EyeOff, LockKeyhole, LogIn, UserRound, ShieldCheck } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

export const LoginPage = ({ isStudent = false, onSwitchToStudent, onSwitchToAdmin }) => {
  const { login } = useLibrary();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password.trim()) {
      setError('Enter both your username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(trimmedUsername, password);
    } catch (loginError) {
      setError(loginError.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl shadow-indigo-950/40 backdrop-blur-xl">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative hidden lg:block overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-950 p-10">
            <div className="absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-indigo-500/30 blur-3xl" />
            <div className="absolute right-10 top-10 h-52 w-52 rounded-full bg-cyan-500/20 blur-3xl" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Secure access
                </div>
                <h1 className="mt-6 text-4xl font-black tracking-tight text-white">LibroHub</h1>
                <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">
                  Modern library operations for circulation, member management, and data-driven reporting.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-700/80 bg-slate-900/40 p-5 text-sm text-slate-300">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-white">{isStudent ? 'Student portal' : 'Librarian portal'}</span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                    Online
                  </span>
                </div>
                <ul className="mt-4 space-y-3 text-xs text-slate-300">
                  {isStudent ? (
                    <>
                      <li>• Search the library catalog</li>
                      <li>• Track your loans and due dates</li>
                      <li>• View your student profile</li>
                    </>
                  ) : (
                    <>
                      <li>• Real-time issue and return tracking</li>
                      <li>• Member and inventory management</li>
                      <li>• Session-protected administrative actions</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mb-8 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
                  {isStudent ? 'Student access' : 'Welcome back'}
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white">
                  {isStudent ? 'Student sign in' : 'Sign in to continue'}
                </h2>
              </div>
              <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-2 text-indigo-300">
                <LockKeyhole className="h-6 w-6" />
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div>
                <label htmlFor="username" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Username
                </label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    autoComplete="username"
                    placeholder="Enter your username"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-3 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-3 pl-10 pr-11 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-200"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-700/25 transition hover:from-indigo-500 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <LogIn className="h-4 w-4" />
                {loading ? 'Authenticating...' : 'Sign in'}
              </button>
            </form>

            {isStudent ? (
              <button
                type="button"
                onClick={onSwitchToAdmin}
                className="mt-6 text-sm font-medium text-indigo-300 transition hover:text-indigo-200"
              >
                Return to administrator login
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onSwitchToStudent}
                  className="mt-6 w-full rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-500/20"
                >
                  Student Login
                </button>
                <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-xs text-slate-400">
                  <p className="font-medium text-slate-300">First-time admin setup</p>
                  <p className="mt-2 leading-5">
                    Create the administrator securely from the backend terminal with: <span className="font-mono text-indigo-300">python app.py</span> and then run <span className="font-mono text-indigo-300">flask create-admin</span> in the backend folder.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

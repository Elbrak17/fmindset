'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [odId, setOdId] = useState<string | null>(null);
  const [pseudonymStatus, setPseudonymStatus] = useState<{
    canRegenerate: boolean;
    nextAvailableDate?: string;
    currentPseudonym?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const storedOdId = localStorage.getItem('odId') || localStorage.getItem('fmindset_odId');
    setOdId(storedOdId);
    if (storedOdId) {
      checkPseudonymCooldown();
    }
  }, []);

  const checkPseudonymCooldown = () => {
    const currentPseudonym = localStorage.getItem('fmindset_pseudonym');
    
    // No cooldown - allow regeneration at will
    setPseudonymStatus({
      canRegenerate: true,
      currentPseudonym: currentPseudonym || undefined,
    });
  };

  const fetchPseudonymStatus = async (userId: string) => {
    // This is now handled client-side
    checkPseudonymCooldown();
  };

  const handleRegeneratePseudonym = async () => {
    if (!odId || !pseudonymStatus?.canRegenerate) return;
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/pseudonym', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ odId }),
      });
      const data = await response.json();
      if (response.ok) {
        // Save to localStorage
        localStorage.setItem('fmindset_pseudonym', data.pseudonym);
        localStorage.setItem('fmindset_last_pseudonym_regen', new Date().toISOString());
        
        setMessage({ type: 'success', text: `New pseudonym: ${data.pseudonym}` });
        checkPseudonymCooldown();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to regenerate pseudonym' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    if (!odId) return;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/user/data?odId=${odId}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fmindset-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setMessage({ type: 'success', text: 'Data exported successfully' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to export data' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAllData = async () => {
    if (!odId) return;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/user/data?odId=${odId}&confirm=true`, {
        method: 'DELETE',
      });
      if (response.ok) {
        localStorage.removeItem('odId');
        setMessage({ type: 'success', text: 'All data deleted. Redirecting...' });
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete data' });
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!odId) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30" />
        <div className="relative text-center animate-fade-in">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 border border-white/50 shadow-xl">
            <span className="text-6xl mb-6 block">🔐</span>
            <p className="text-gray-600 mb-6 text-lg">No user session found</p>
            <Link 
              href="/assessment/quiz" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:scale-105 transition-all"
            >
              Take the assessment to get started
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent" />
      <div className="fixed top-20 left-[10%] w-80 h-80 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl animate-blob" />
      <div className="fixed bottom-40 right-[10%] w-96 h-96 bg-gradient-to-br from-cyan-200/20 to-indigo-200/20 rounded-full blur-3xl animate-blob animation-delay-2000" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="mb-10 animate-fade-in-up">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm mb-4">
            <span className="text-lg">⚙️</span>
            <span className="text-sm font-medium text-gray-600">Privacy & Data</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            <span className="gradient-text">Settings</span>
          </h1>
          <p className="text-gray-600 mt-3 text-lg">Manage your privacy and data</p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-2xl animate-scale-in ${
              message.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                : 'bg-rose-50 border border-rose-200 text-rose-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{message.type === 'success' ? '✅' : '❌'}</span>
              {message.text}
            </div>
          </div>
        )}

        {/* Pseudonym Section */}
        <section className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 shadow-lg shadow-gray-100/50 p-8 mb-6 animate-fade-in-up animation-delay-100">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30">
              <span className="text-2xl">🎭</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Anonymous Identity</h2>
              <p className="text-sm text-gray-600 mt-1">
                Your pseudonym is used in the community forum. You can regenerate it anytime.
              </p>
            </div>
          </div>

          {pseudonymStatus?.currentPseudonym && (
            <div className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Current pseudonym</p>
              <p className="text-xl font-bold gradient-text">{pseudonymStatus.currentPseudonym}</p>
            </div>
          )}

          <div className="flex items-center gap-4">
            <button
              onClick={handleRegeneratePseudonym}
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
            >
              {isLoading ? 'Loading...' : 'Regenerate Pseudonym'}
            </button>
          </div>
        </section>

        {/* Data Export Section */}
        <section className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 shadow-lg shadow-gray-100/50 p-8 mb-6 animate-fade-in-up animation-delay-200">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg shadow-emerald-500/30">
              <span className="text-2xl">📦</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Export Your Data</h2>
              <p className="text-sm text-gray-600 mt-1">
                Download all your data in JSON format. This includes your assessments, journal entries,
                burnout scores, and forum posts.
              </p>
            </div>
          </div>

          <button
            onClick={handleExportData}
            disabled={isLoading}
            className="mt-4 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-lg disabled:opacity-50 transition-all"
          >
            {isLoading ? 'Exporting...' : '⬇️ Download My Data'}
          </button>
        </section>

        {/* Delete Data Section */}
        <section className="bg-white/80 backdrop-blur-sm rounded-3xl border border-rose-200 shadow-lg shadow-rose-100/50 p-8 animate-fade-in-up animation-delay-300">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl shadow-lg shadow-rose-500/30">
              <span className="text-2xl">🗑️</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-rose-700">Delete All Data</h2>
              <p className="text-sm text-gray-600 mt-1">
                Permanently delete all your data from FMindset. This action cannot be undone.
                Your forum posts will be anonymized but the content will remain.
              </p>
            </div>
          </div>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="mt-4 px-6 py-3 bg-rose-50 border-2 border-rose-200 text-rose-700 font-semibold rounded-xl hover:bg-rose-100 hover:border-rose-300 transition-all"
            >
              Delete My Data
            </button>
          ) : (
            <div className="mt-4 p-6 bg-rose-50 rounded-2xl border border-rose-200 animate-scale-in">
              <p className="text-sm text-rose-700 mb-4 font-semibold flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                Are you sure? This will permanently delete:
              </p>
              <ul className="text-sm text-rose-600 mb-6 space-y-2">
                {['All assessment results', 'All journal entries', 'All burnout scores', 'All action items', 'Your user profile'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAllData}
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-rose-600 to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-rose-500/25 hover:shadow-xl disabled:opacity-50 transition-all"
                >
                  {isLoading ? 'Deleting...' : 'Yes, Delete Everything'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Data Retention Info */}
        <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl animate-fade-in-up animation-delay-400">
          <h3 className="font-bold text-indigo-800 mb-3 flex items-center gap-2">
            <span className="text-xl">📋</span>
            Data Retention Policy
          </h3>
          <p className="text-sm text-indigo-700 leading-relaxed">
            Your journal entries, burnout scores, and action items are automatically deleted after 1 year
            to protect your privacy. Assessment results are kept until you delete them manually.
          </p>
        </div>
      </div>
    </div>
  );
}

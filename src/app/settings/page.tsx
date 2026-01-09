'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [odId, setOdId] = useState<string | null>(null);
  const [pseudonymStatus, setPseudonymStatus] = useState<{
    canRegenerate: boolean;
    nextAvailableDate?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const storedOdId = localStorage.getItem('odId');
    setOdId(storedOdId);

    if (storedOdId) {
      fetchPseudonymStatus(storedOdId);
    }
  }, []);

  const fetchPseudonymStatus = async (userId: string) => {
    try {
      const response = await fetch(`/api/user/pseudonym?odId=${userId}`);
      const data = await response.json();
      setPseudonymStatus(data);
    } catch (error) {
      console.error('Error fetching pseudonym status:', error);
    }
  };

  const handleRegeneratePseudonym = async () => {
    if (!odId) return;
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
        setMessage({ type: 'success', text: `New pseudonym: ${data.pseudonym}` });
        fetchPseudonymStatus(odId);
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete data' });
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!odId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No user session found</p>
          <Link href="/assessment/quiz" className="text-indigo-600 hover:underline">
            Take the assessment to get started
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your privacy and data</p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Pseudonym Section */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Anonymous Identity</h2>
          <p className="text-sm text-gray-600 mb-4">
            Your pseudonym is used in the community forum. You can regenerate it once per month.
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={handleRegeneratePseudonym}
              disabled={isLoading || !pseudonymStatus?.canRegenerate}
              className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Loading...' : 'Regenerate Pseudonym'}
            </button>
            {pseudonymStatus && !pseudonymStatus.canRegenerate && (
              <span className="text-sm text-gray-500">
                Available on {new Date(pseudonymStatus.nextAvailableDate!).toLocaleDateString()}
              </span>
            )}
          </div>
        </section>

        {/* Data Export Section */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Export Your Data</h2>
          <p className="text-sm text-gray-600 mb-4">
            Download all your data in JSON format. This includes your assessments, journal entries,
            burnout scores, and forum posts.
          </p>

          <button
            onClick={handleExportData}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Exporting...' : 'Download My Data'}
          </button>
        </section>

        {/* Delete Data Section */}
        <section className="bg-white rounded-xl border border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-700 mb-2">Delete All Data</h2>
          <p className="text-sm text-gray-600 mb-4">
            Permanently delete all your data from FMindset. This action cannot be undone.
            Your forum posts will be anonymized but the content will remain.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 transition-colors"
            >
              Delete My Data
            </button>
          ) : (
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-700 mb-4 font-medium">
                ⚠️ Are you sure? This will permanently delete:
              </p>
              <ul className="text-sm text-red-600 mb-4 list-disc list-inside">
                <li>All assessment results</li>
                <li>All journal entries</li>
                <li>All burnout scores</li>
                <li>All action items</li>
                <li>Your user profile</li>
              </ul>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAllData}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Deleting...' : 'Yes, Delete Everything'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Data Retention Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <h3 className="font-medium text-blue-800 mb-2">📋 Data Retention Policy</h3>
          <p className="text-sm text-blue-700">
            Your journal entries, burnout scores, and action items are automatically deleted after 1 year
            to protect your privacy. Assessment results are kept until you delete them manually.
          </p>
        </div>
      </div>
    </div>
  );
}

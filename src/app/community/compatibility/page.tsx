'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CompatibilityResult } from '@/components/Community';

interface CompatibilityData {
  score: number;
  strengths: string[];
  challenges: string[];
  recommendations: string[];
}

export default function CompatibilityPage() {
  const [partnerCode, setPartnerCode] = useState('');
  const [result, setResult] = useState<CompatibilityData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [odId, setOdId] = useState<string | null>(null);
  const [showShareCode, setShowShareCode] = useState(false);

  useEffect(() => {
    const storedOdId = localStorage.getItem('odId');
    setOdId(storedOdId);
  }, []);

  const handleCheckCompatibility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!odId || !partnerCode.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/community/compatibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId1: odId,
          userId2: partnerCode.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate compatibility');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const copyShareCode = () => {
    if (odId) {
      navigator.clipboard.writeText(odId);
      setShowShareCode(true);
      setTimeout(() => setShowShareCode(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href="/community"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Community
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">⚖️</span>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Co-Founder Compatibility</h1>
          <p className="text-gray-600">
            Check psychological compatibility with a potential co-founder
          </p>
        </div>

        {/* No Assessment Warning */}
        {!odId && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6 text-center">
            <h3 className="font-semibold text-yellow-800 mb-2">Complete Your Assessment First</h3>
            <p className="text-yellow-700 mb-4">
              Both founders need to complete the assessment to check compatibility.
            </p>
            <Link
              href="/assessment/quiz"
              className="inline-block px-4 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Take Assessment
            </Link>
          </div>
        )}

        {odId && (
          <>
            {/* Share Your Code */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h2 className="font-semibold text-gray-900 mb-3">Your Compatibility Code</h2>
              <p className="text-sm text-gray-600 mb-4">
                Share this code with your potential co-founder so they can check compatibility with you.
              </p>
              <div className="flex items-center gap-3">
                <code className="flex-1 px-4 py-2 bg-gray-100 rounded-lg text-sm font-mono text-gray-700 truncate">
                  {odId}
                </code>
                <button
                  onClick={copyShareCode}
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {showShareCode ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Check Compatibility Form */}
            <form onSubmit={handleCheckCompatibility} className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h2 className="font-semibold text-gray-900 mb-3">Check Compatibility</h2>
              <p className="text-sm text-gray-600 mb-4">
                Enter your potential co-founder's compatibility code to see how well you match.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={partnerCode}
                  onChange={(e) => setPartnerCode(e.target.value)}
                  placeholder="Enter partner's code"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={isLoading || !partnerCode.trim()}
                  className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Checking...' : 'Check'}
                </button>
              </div>
            </form>

            {/* Result */}
            {result && <CompatibilityResult {...result} />}
          </>
        )}

        {/* How It Works */}
        <div className="mt-8 bg-gray-100 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">How Compatibility Works</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>Complementary Strengths:</strong> We look for dimensions where one founder is strong 
              and the other is developing, creating balance.
            </p>
            <p>
              <strong>Shared Challenges:</strong> We identify areas where both founders might struggle, 
              so you can plan support systems.
            </p>
            <p>
              <strong>Motivation Alignment:</strong> We check if your driving forces complement each other.
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="mt-6 text-xs text-gray-500 text-center">
          ⚠️ This tool provides insights based on psychological profiles. 
          It should be used as a conversation starter, not a definitive assessment.
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PeerMatchCard } from '@/components/Community';

interface PeerMatch {
  id: string;
  matchedUserId: string;
  matchScore: number;
  sharedDimensions: string[];
  isDismissed: boolean;
  isMutualOptIn: boolean;
}

export default function PeersPage() {
  const [matches, setMatches] = useState<PeerMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [odId, setOdId] = useState<string | null>(null);
  const [hasAssessment, setHasAssessment] = useState<boolean | null>(null);

  useEffect(() => {
    const storedOdId = localStorage.getItem('odId') || localStorage.getItem('fmindset_odId');
    setOdId(storedOdId);
    
    // Check if user has completed an assessment
    if (storedOdId) {
      checkAssessment(storedOdId);
    } else {
      setHasAssessment(false);
      setIsLoading(false);
    }
  }, []);

  const checkAssessment = async (userId: string) => {
    try {
      const response = await fetch(`/api/assessment/stats?odId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setHasAssessment(data.count > 0);
      } else {
        setHasAssessment(false);
      }
    } catch {
      setHasAssessment(false);
    }
  };

  const fetchMatches = useCallback(async () => {
    if (!odId || !hasAssessment) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/community/peers?odId=${odId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch matches');
      }

      setMatches(data.matches || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, [odId, hasAssessment]);

  useEffect(() => {
    if (odId && hasAssessment) {
      fetchMatches();
    } else if (hasAssessment === false) {
      setIsLoading(false);
    }
  }, [odId, hasAssessment, fetchMatches]);

  const handleDismiss = (matchId: string) => {
    setMatches((prev) => prev.filter((m) => m.id !== matchId));
  };

  const activeMatches = matches.filter((m) => !m.isDismissed);
  const mutualConnections = activeMatches.filter((m) => m.isMutualOptIn);
  const pendingMatches = activeMatches.filter((m) => !m.isMutualOptIn);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Peers Like You</h1>
          <p className="text-gray-600">
            Connect with founders who share similar psychological profiles and challenges
          </p>
        </div>

        {/* No Assessment Warning */}
        {hasAssessment === false && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2">Complete Your Assessment First</h3>
            <p className="text-yellow-700 mb-4">
              To find peer matches based on your archetype and psychological dimensions, you need to complete the assessment first.
            </p>
            <Link
              href="/assessment/quiz"
              className="inline-block px-4 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Take Assessment
            </Link>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchMatches}
              className="mt-4 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : activeMatches.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <span className="text-4xl mb-4 block">🔍</span>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Matches Yet</h3>
            <p className="text-gray-600 mb-4">
              We're looking for founders with similar profiles. Check back soon!
            </p>
            <p className="text-sm text-gray-500">
              Matches are based on your archetype and psychological dimensions.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Mutual Connections */}
            {mutualConnections.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-green-500">✓</span> Mutual Connections
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mutualConnections.map((match) => (
                    <PeerMatchCard
                      key={match.id}
                      matchId={match.id}
                      matchScore={match.matchScore}
                      sharedDimensions={match.sharedDimensions as string[]}
                      isMutualOptIn={match.isMutualOptIn}
                      odId={odId!}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Pending Matches */}
            {pendingMatches.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Suggested Peers
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingMatches.map((match) => (
                    <PeerMatchCard
                      key={match.id}
                      matchId={match.id}
                      matchScore={match.matchScore}
                      sharedDimensions={match.sharedDimensions as string[]}
                      isMutualOptIn={match.isMutualOptIn}
                      odId={odId!}
                      onDismiss={() => handleDismiss(match.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* How It Works */}
        <div className="mt-12 bg-indigo-50 border border-indigo-200 rounded-xl p-6">
          <h3 className="font-semibold text-indigo-900 mb-4">How Peer Matching Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-indigo-800">
            <div className="flex items-start gap-3">
              <span className="text-xl">1️⃣</span>
              <p>We analyze your psychological profile from the assessment</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">2️⃣</span>
              <p>We find founders with similar archetypes and dimensions</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">3️⃣</span>
              <p>Both founders must opt-in before connecting</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

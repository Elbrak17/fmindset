'use client';

import { useState } from 'react';

interface PeerMatchCardProps {
  matchId: string;
  matchScore: number;
  sharedDimensions: string[];
  isMutualOptIn: boolean;
  odId: string;
  onDismiss?: () => void;
  onOptIn?: () => void;
}

export function PeerMatchCard({
  matchId,
  matchScore,
  sharedDimensions,
  isMutualOptIn,
  odId,
  onDismiss,
  onOptIn,
}: PeerMatchCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasOptedIn, setHasOptedIn] = useState(false);

  const handleAction = async (action: 'dismiss' | 'optIn') => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/community/peers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ odId, matchId, action }),
      });

      if (response.ok) {
        if (action === 'dismiss') {
          onDismiss?.();
        } else {
          setHasOptedIn(true);
          onOptIn?.();
        }
      }
    } catch (error) {
      console.error('Error updating match:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      {/* Match Score */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤝</span>
          <span className="font-semibold text-gray-900">Peer Match</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-500">Match:</span>
          <span className={`font-bold ${matchScore >= 70 ? 'text-green-600' : matchScore >= 50 ? 'text-yellow-600' : 'text-gray-600'}`}>
            {matchScore}%
          </span>
        </div>
      </div>

      {/* Shared Dimensions */}
      {sharedDimensions.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">What you have in common:</p>
          <div className="flex flex-wrap gap-2">
            {sharedDimensions.map((dim, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-indigo-50 text-indigo-700 rounded-full"
              >
                {dim}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Status / Actions */}
      {isMutualOptIn ? (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 font-medium">
            ✅ Mutual connection! You can now connect in the forum.
          </p>
        </div>
      ) : hasOptedIn ? (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            ⏳ Waiting for the other founder to opt in...
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleAction('optIn')}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Loading...' : 'Connect'}
          </button>
          <button
            onClick={() => handleAction('dismiss')}
            disabled={isLoading}
            className="px-4 py-2 text-gray-600 font-medium rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            Skip
          </button>
        </div>
      )}

      {/* Privacy Note */}
      <p className="mt-3 text-xs text-gray-500">
        🔒 Your identity remains anonymous until mutual opt-in
      </p>
    </div>
  );
}

export default PeerMatchCard;

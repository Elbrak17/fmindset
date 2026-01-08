'use client';

import React, { useState } from 'react';
import { PsychologicalScores, ArchetypeResult } from '@/types/assessment';
import { getScoreColor } from '@/utils/scoreColorUtils';

export interface ResultsDisplayProps {
  scores: PsychologicalScores;
  archetype: ArchetypeResult;
  recommendations: string[];
  groqInsights: string | null;
  isLoadingInsights: boolean;
}

// Re-export for backwards compatibility
export { getScoreColor } from '@/utils/scoreColorUtils';

// Archetype emoji mapping
const ARCHETYPE_EMOJIS: Record<string, string> = {
  'Perfectionist Builder': '🏗️',
  'Opportunistic Visionary': '🚀',
  'Isolated Dreamer': '💭',
  'Burning Out': '🔥',
  'Self-Assured Hustler': '💪',
  'Community-Driven': '🤝',
  'Balanced Founder': '⚖️',
  'Growth Seeker': '🌱',
};

// Dimension display names
const DIMENSION_LABELS: Record<string, string> = {
  imposterSyndrome: 'Imposter Syndrome',
  founderDoubt: 'Founder Doubt',
  identityFusion: 'Identity Fusion',
  fearOfRejection: 'Fear of Rejection',
  riskTolerance: 'Risk Tolerance',
  isolationLevel: 'Isolation Level',
};

function ScoreBar({ label, score }: { label: string; score: number }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { bg, text, tooltip } = getScoreColor(score);
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div className="relative">
          <span className={`text-sm font-semibold ${text}`}>{score}/100</span>
          {tooltip && (
            <button type="button" className="ml-1 text-gray-400 hover:text-gray-600"
              onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}
              onFocus={() => setShowTooltip(true)} onBlur={() => setShowTooltip(false)} aria-label={tooltip}>ⓘ</button>
          )}
          {showTooltip && tooltip && (
            <div className="absolute right-0 top-6 z-10 px-2 py-1 text-xs text-white bg-gray-800 rounded shadow-lg whitespace-nowrap">{tooltip}</div>
          )}
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div className={`${bg} h-3 rounded-full transition-all duration-500`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function RecommendationCard({ recommendation, index }: { recommendation: string; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = recommendation.length > 100;
  const displayText = isExpanded || !isLong ? recommendation : recommendation.slice(0, 100) + '...';
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => isLong && setIsExpanded(!isExpanded)} role={isLong ? "button" : undefined} aria-expanded={isLong ? isExpanded : undefined}>
      <div className="flex items-start">
        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">{index + 1}</span>
        <p className="text-gray-700 text-sm leading-relaxed">{displayText}</p>
      </div>
      {isLong && (
        <button className="mt-2 ml-9 text-xs text-blue-600 hover:text-blue-800"
          onClick={(e: React.MouseEvent) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}>{isExpanded ? 'Show less' : 'Read more'}</button>
      )}
    </div>
  );
}


/**
 * ResultsDisplay Component
 * Displays assessment results including archetype, score bars, recommendations, and AI insights.
 * 
 * Requirements: 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.12, 5.13
 */
export function ResultsDisplay({
  scores,
  archetype,
  recommendations,
  groqInsights,
  isLoadingInsights,
}: ResultsDisplayProps) {
  const emoji = ARCHETYPE_EMOJIS[archetype.name] || '🎯';

  // Get numeric scores for display (excluding motivationType)
  const numericScores = [
    { key: 'imposterSyndrome', value: scores.imposterSyndrome },
    { key: 'founderDoubt', value: scores.founderDoubt },
    { key: 'identityFusion', value: scores.identityFusion },
    { key: 'fearOfRejection', value: scores.fearOfRejection },
    { key: 'riskTolerance', value: scores.riskTolerance },
    { key: 'isolationLevel', value: scores.isolationLevel },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {/* Burnout Alert - Requirement 5.8 */}
      {archetype.isUrgent && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
          <div className="flex items-start">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <h3 className="text-lg font-semibold text-red-800">Important Notice</h3>
              <p className="text-red-700 mt-1">
                Your assessment indicates elevated stress across multiple areas. 
                Please consider reaching out to a mental health professional or trusted mentor.
              </p>
              <a
                href="https://www.samhsa.gov/find-help/national-helpline"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-red-600 hover:text-red-800 underline font-medium"
              >
                Mental Health Resources →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Archetype Card - Requirements 5.2 */}
      <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm">
        <div className="text-center">
          <span className="text-5xl mb-4 block">{emoji}</span>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{archetype.name}</h2>
          <p className="text-gray-600 mb-4">{archetype.description}</p>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {archetype.traits.map((trait: string, idx: number) => (
              <span key={idx} className="px-3 py-1 bg-white text-gray-700 text-sm rounded-full shadow-sm">{trait}</span>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-left">
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="text-sm font-semibold text-green-800 mb-1">💪 Your Strength</h4>
              <p className="text-sm text-green-700">{archetype.strength}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <h4 className="text-sm font-semibold text-amber-800 mb-1">🎯 Your Challenge</h4>
              <p className="text-sm text-amber-700">{archetype.challenge}</p>
            </div>
          </div>
          {archetype.encouragement && (
            <div className="mt-4 p-3 bg-purple-50 rounded-lg text-left">
              <h4 className="text-sm font-semibold text-purple-800 mb-1">🌟 Encouragement</h4>
              <p className="text-sm text-purple-700">{archetype.encouragement}</p>
            </div>
          )}
        </div>
      </div>

      {/* Score Bars - Requirements 5.3, 5.4, 5.6, 5.7 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Psychological Profile</h3>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          {numericScores.map(({ key, value }) => <ScoreBar key={key} label={DIMENSION_LABELS[key] || key} score={value} />)}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Motivation Type</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full capitalize">{scores.motivationType}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations - Requirements 5.5, 5.9 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personalized Recommendations</h3>
        <div className="space-y-3">
          {recommendations.slice(0, 3).map((rec, idx) => <RecommendationCard key={idx} recommendation={rec} index={idx} />)}
        </div>
      </div>

      {/* Groq AI Insights - Requirements 5.12, 5.13 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Powered Insights</h3>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg">
          {isLoadingInsights ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Generating personalized insights...</span>
            </div>
          ) : groqInsights ? (
            <div className="animate-fade-in">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{groqInsights}</p>
              <p className="mt-4 text-xs text-gray-500 italic">Generated by AI psychologist</p>
            </div>
          ) : (
            <p className="text-gray-600 py-4">We're generating personalized insights for you. Check back in a moment.</p>
          )}
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}

export default ResultsDisplay;

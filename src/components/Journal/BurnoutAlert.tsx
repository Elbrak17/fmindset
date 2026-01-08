'use client';

import React, { useState, useCallback, useId } from 'react';

// Types
export type RiskLevel = 'low' | 'caution' | 'high' | 'critical';

export interface BurnoutAlertProps {
  score: number;
  riskLevel: RiskLevel;
  contributingFactors: string[];
  calculatedAt?: string;
  onDismiss?: () => void;
}

// Risk level configuration
const RISK_CONFIG: Record<RiskLevel, {
  bgColor: string;
  borderColor: string;
  textColor: string;
  iconColor: string;
  label: string;
  emoji: string;
  description: string;
}> = {
  low: {
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    iconColor: 'text-green-500',
    label: 'Low Risk',
    emoji: '✅',
    description: 'Your burnout risk is low. Keep up the good work!',
  },
  caution: {
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-500',
    label: 'Caution',
    emoji: '⚠️',
    description: 'Some signs of stress detected. Consider taking preventive steps.',
  },
  high: {
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-800',
    iconColor: 'text-orange-500',
    label: 'High Risk',
    emoji: '🔶',
    description: 'Elevated burnout risk. Please prioritize self-care and consider seeking support.',
  },
  critical: {
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-500',
    label: 'Critical',
    emoji: '🚨',
    description: 'Your burnout risk is critical. Please reach out for professional support.',
  },
};

// Crisis resources
const CRISIS_RESOURCES = [
  {
    name: 'National Suicide Prevention Lifeline',
    phone: '988',
    description: 'Free, confidential support 24/7',
  },
  {
    name: 'Crisis Text Line',
    phone: 'Text HOME to 741741',
    description: 'Free crisis counseling via text',
  },
  {
    name: 'SAMHSA National Helpline',
    phone: '1-800-662-4357',
    description: 'Mental health treatment referrals',
  },
];


/**
 * BurnoutAlert Component
 * Displays a color-coded banner showing burnout risk level with expandable details.
 * Shows crisis resources for high/critical risk levels.
 * 
 * Requirements: 3.3, 3.4
 */
export function BurnoutAlert({
  score,
  riskLevel,
  contributingFactors,
  calculatedAt,
  onDismiss,
}: BurnoutAlertProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const detailsId = useId();
  const alertId = useId();

  const config = RISK_CONFIG[riskLevel];
  const showCrisisResources = riskLevel === 'high' || riskLevel === 'critical';

  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
    onDismiss?.();
  }, [onDismiss]);

  // Don't render if dismissed
  if (isDismissed) {
    return null;
  }

  return (
    <div
      id={alertId}
      role="alert"
      aria-live="polite"
      className={`
        w-full rounded-xl border-2 overflow-hidden transition-all duration-300
        ${config.bgColor} ${config.borderColor}
      `}
    >
      {/* Main Banner */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          {/* Left: Icon and Content */}
          <div className="flex items-start gap-3 flex-1">
            {/* Risk Icon */}
            <span className="text-2xl flex-shrink-0" aria-hidden="true">
              {config.emoji}
            </span>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Score and Risk Level */}
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`font-bold text-lg ${config.textColor}`}>
                  Burnout Risk: {config.label}
                </span>
                <span
                  className={`
                    px-2 py-0.5 rounded-full text-sm font-semibold
                    ${config.bgColor} ${config.textColor} border ${config.borderColor}
                  `}
                >
                  Score: {score}/100
                </span>
              </div>

              {/* Description */}
              <p className={`text-sm ${config.textColor} opacity-90`}>
                {config.description}
              </p>

              {/* Calculated timestamp */}
              {calculatedAt && (
                <p className={`text-xs ${config.textColor} opacity-60 mt-1`}>
                  Last calculated: {new Date(calculatedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Expand/Collapse Button */}
            {contributingFactors.length > 0 && (
              <button
                type="button"
                onClick={handleToggleExpand}
                aria-expanded={isExpanded}
                aria-controls={detailsId}
                className={`
                  p-2 rounded-lg transition-colors duration-200
                  hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-offset-1
                  ${config.textColor} focus:ring-current
                `}
                aria-label={isExpanded ? 'Hide details' : 'Show details'}
              >
                <svg
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            )}

            {/* Dismiss Button */}
            <button
              type="button"
              onClick={handleDismiss}
              className={`
                p-2 rounded-lg transition-colors duration-200
                hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-offset-1
                ${config.textColor} focus:ring-current
              `}
              aria-label="Dismiss alert"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Details Section */}
      <div
        id={detailsId}
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className={`px-4 sm:px-5 pb-4 sm:pb-5 border-t ${config.borderColor}`}>
          {/* Contributing Factors */}
          {contributingFactors.length > 0 && (
            <div className="pt-4">
              <h3 className={`font-semibold text-sm mb-2 ${config.textColor}`}>
                Contributing Factors:
              </h3>
              <ul className="space-y-1">
                {contributingFactors.map((factor, index) => (
                  <li
                    key={index}
                    className={`flex items-center gap-2 text-sm ${config.textColor} opacity-90`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${config.iconColor} bg-current`} />
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Crisis Resources for high/critical levels */}
          {showCrisisResources && (
            <div className="pt-4 mt-4 border-t border-current/20">
              <h3 className={`font-semibold text-sm mb-3 ${config.textColor}`}>
                🆘 Crisis Resources
              </h3>
              <div className="space-y-3">
                {CRISIS_RESOURCES.map((resource, index) => (
                  <div
                    key={index}
                    className={`
                      p-3 rounded-lg bg-white/60 border ${config.borderColor}
                    `}
                  >
                    <p className={`font-medium text-sm ${config.textColor}`}>
                      {resource.name}
                    </p>
                    <p className={`text-sm font-bold ${config.textColor}`}>
                      {resource.phone}
                    </p>
                    <p className={`text-xs ${config.textColor} opacity-70`}>
                      {resource.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className={`px-4 sm:px-5 py-3 bg-white/40 border-t ${config.borderColor}`}>
        <p className={`text-xs ${config.textColor} opacity-70 text-center`}>
          ⚕️ <strong>Disclaimer:</strong> This is not a medical diagnosis. If you&apos;re struggling, 
          please consult a healthcare professional.
        </p>
      </div>
    </div>
  );
}

export default BurnoutAlert;

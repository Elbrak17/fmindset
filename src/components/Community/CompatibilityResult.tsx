'use client';

interface CompatibilityResultProps {
  score: number;
  strengths: string[];
  challenges: string[];
  recommendations: string[];
}

export function CompatibilityResult({
  score,
  strengths,
  challenges,
  recommendations,
}: CompatibilityResultProps) {
  const getScoreColor = () => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = () => {
    if (score >= 70) return 'Strong Match';
    if (score >= 50) return 'Moderate Match';
    return 'Challenging Match';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Score Header */}
      <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Co-Founder Compatibility</p>
          <div className={`text-5xl font-bold ${getScoreColor()}`}>{score}</div>
          <p className={`text-lg font-medium ${getScoreColor()}`}>{getScoreLabel()}</p>
        </div>

        {/* Score Bar */}
        <div className="mt-4 h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Strengths */}
        {strengths.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
              <span className="text-green-500">✓</span> Strengths
            </h3>
            <ul className="space-y-2">
              {strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-1">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Challenges */}
        {challenges.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
              <span className="text-orange-500">⚠</span> Potential Challenges
            </h3>
            <ul className="space-y-2">
              {challenges.map((challenge, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <span className="text-orange-500 mt-1">•</span>
                  {challenge}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
              <span className="text-blue-500">💡</span> Recommendations
            </h3>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <span className="text-blue-500 mt-1">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          ⚠️ This compatibility analysis is based on psychological profiles and should be used as a starting point for discussion, not a definitive assessment.
        </p>
      </div>
    </div>
  );
}

export default CompatibilityResult;

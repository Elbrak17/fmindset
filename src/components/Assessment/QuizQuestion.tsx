'use client';

import React from 'react';
import { AnswerValue } from '@/types/assessment';

export interface QuizOption {
  value: AnswerValue;
  label: string;
}

export interface QuizQuestionProps {
  questionId: number;
  questionText: string;
  dimensionLabel: string;
  options: QuizOption[];
  selectedOption: AnswerValue | null;
  onSelect: (questionId: number, answer: AnswerValue) => void;
  progress: { current: number; total: number };
}

/**
 * QuizQuestion Component
 * Displays a single quiz question with dimension label, question text,
 * 4 radio options (A, B, C, D), and progress indicator.
 * 
 * Requirements: 2.1, 2.2, 2.3
 */
export function QuizQuestion({
  questionId,
  questionText,
  dimensionLabel,
  options,
  selectedOption,
  onSelect,
  progress,
}: QuizQuestionProps) {
  const handleOptionClick = (value: AnswerValue) => {
    onSelect(questionId, value);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">
            Question {progress.current} of {progress.total}
          </span>
          <span className="text-sm text-gray-500">
            {progress.current}/{progress.total}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(progress.current / progress.total) * 100}%` }}
          />
        </div>
      </div>

      {/* Dimension label */}
      <div className="mb-4">
        <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
          {dimensionLabel}
        </span>
      </div>

      {/* Question text */}
      <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-6">
        {questionText}
      </h2>

      {/* Radio options */}
      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = selectedOption === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleOptionClick(option.value)}
              className={`
                w-full p-4 text-left rounded-lg border-2 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${isSelected
                  ? 'border-blue-600 bg-blue-50 text-blue-900'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/50'
                }
              `}
              aria-pressed={isSelected}
              role="radio"
              aria-checked={isSelected}
            >
              <div className="flex items-center">
                <span
                  className={`
                    flex-shrink-0 w-6 h-6 rounded-full border-2 mr-3
                    flex items-center justify-center text-sm font-medium
                    ${isSelected
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 text-gray-500'
                    }
                  `}
                >
                  {option.value}
                </span>
                <span className="text-sm sm:text-base">{option.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default QuizQuestion;

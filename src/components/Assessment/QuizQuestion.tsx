'use client';

import React, { useCallback, useEffect, useRef } from 'react';
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

// Keyboard shortcuts mapping
const KEY_TO_ANSWER: Record<string, AnswerValue> = {
  '1': 'A',
  '2': 'B',
  '3': 'C',
  '4': 'D',
  'a': 'A',
  'b': 'B',
  'c': 'C',
  'd': 'D',
};

/**
 * QuizQuestion Component
 * Displays a single quiz question with dimension label, question text,
 * 4 radio options (A, B, C, D), and progress indicator.
 * 
 * Accessibility features:
 * - Full keyboard navigation (Tab, Arrow keys)
 * - Keyboard shortcuts (1-4 or A-D to select)
 * - ARIA labels and roles
 * - Focus management
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
  const containerRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleOptionClick = useCallback((value: AnswerValue) => {
    onSelect(questionId, value);
  }, [questionId, onSelect]);

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Quick select with 1-4 or A-D keys
      const answer = KEY_TO_ANSWER[e.key.toLowerCase()];
      if (answer) {
        e.preventDefault();
        handleOptionClick(answer);
        return;
      }

      // Arrow key navigation within options
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const currentIndex = options.findIndex(o => o.value === selectedOption);
        let newIndex: number;

        if (e.key === 'ArrowDown') {
          newIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
        } else {
          newIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
        }

        optionRefs.current[newIndex]?.focus();
        handleOptionClick(options[newIndex].value);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleOptionClick, options, selectedOption]);

  return (
    <div 
      ref={containerRef}
      className="w-full max-w-2xl mx-auto px-4 py-6 sm:px-6 lg:px-8"
      role="region"
      aria-label={`Question ${progress.current} of ${progress.total}`}
    >
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
      <h2 
        id={`question-${questionId}`}
        className="text-lg sm:text-xl font-medium text-gray-900 mb-6"
      >
        {questionText}
      </h2>

      {/* Keyboard hint */}
      <p className="text-xs text-gray-500 mb-4" aria-hidden="true">
        💡 Press 1-4 or A-D to quickly select an answer
      </p>

      {/* Radio options */}
      <div 
        className="space-y-3"
        role="radiogroup"
        aria-labelledby={`question-${questionId}`}
      >
        {options.map((option, index) => {
          const isSelected = selectedOption === option.value;
          return (
            <button
              key={option.value}
              ref={(el) => { optionRefs.current[index] = el; }}
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
              aria-label={`Option ${option.value}: ${option.label}`}
              tabIndex={isSelected || (!selectedOption && index === 0) ? 0 : -1}
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
                  aria-hidden="true"
                >
                  {option.value}
                </span>
                <span className="text-sm sm:text-base">{option.label}</span>
                <span className="ml-auto text-xs text-gray-400" aria-hidden="true">
                  {index + 1}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default QuizQuestion;

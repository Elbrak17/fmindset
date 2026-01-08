'use client';

import React, { useState, useCallback, useId } from 'react';
import { MoodSlider } from './MoodSlider';

// Types
export interface JournalEntryData {
  mood: number;
  energy: number;
  stress: number;
  notes?: string;
}

export interface ExistingEntry {
  id: string;
  mood: number;
  energy: number;
  stress: number;
  notes?: string | null;
  entryDate: string;
}

export interface CheckInFormProps {
  existingEntry?: ExistingEntry | null;
  onSubmit: (data: JournalEntryData) => Promise<void>;
  isLoading?: boolean;
}

// Constants
const MAX_NOTES_LENGTH = 500;
const DEFAULT_MOOD = 50;
const DEFAULT_ENERGY = 50;
const DEFAULT_STRESS = 50;

/**
 * CheckInForm Component
 * Daily check-in form with sliders for mood, energy, stress and optional notes.
 * Supports edit mode when an entry exists for today.
 * 
 * Requirements: 1.1, 1.2, 1.4, 1.5, 1.6
 */
export function CheckInForm({
  existingEntry,
  onSubmit,
  isLoading = false,
}: CheckInFormProps) {
  const formId = useId();
  const notesId = useId();

  // Initialize state from existing entry or defaults
  const [mood, setMood] = useState(existingEntry?.mood ?? DEFAULT_MOOD);
  const [energy, setEnergy] = useState(existingEntry?.energy ?? DEFAULT_ENERGY);
  const [stress, setStress] = useState(existingEntry?.stress ?? DEFAULT_STRESS);
  const [notes, setNotes] = useState(existingEntry?.notes ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!existingEntry;
  const notesLength = notes.length;
  const isNotesOverLimit = notesLength > MAX_NOTES_LENGTH;

  const handleNotesChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setNotes(e.target.value);
      setError(null);
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (isSubmitting || isLoading) return;

      // Validate notes length
      if (notes.length > MAX_NOTES_LENGTH) {
        setError(`Notes must be ${MAX_NOTES_LENGTH} characters or less`);
        return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        await onSubmit({
          mood,
          energy,
          stress,
          notes: notes.trim() || undefined,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to save entry. Please try again.';
        setError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [mood, energy, stress, notes, onSubmit, isSubmitting, isLoading]
  );

  const buttonDisabled = isSubmitting || isLoading || isNotesOverLimit;

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      className="w-full max-w-lg mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
            {isEditMode ? 'Update Your Check-in' : 'How are you feeling today?'}
          </h2>
          <p className="text-sm text-gray-500">
            {isEditMode
              ? 'Adjust your responses as needed. Your wellbeing matters.'
              : 'Take a moment to reflect. There are no wrong answers.'}
          </p>
        </div>

        {/* Sliders */}
        <div className="space-y-6 mb-6">
          {/* Mood Slider */}
          <MoodSlider
            label="Mood"
            value={mood}
            onChange={setMood}
            colorClass="bg-blue-500"
            emojis={['😢', '😕', '😐', '😊', '😄']}
            description="How would you describe your overall mood right now?"
          />

          {/* Energy Slider */}
          <MoodSlider
            label="Energy"
            value={energy}
            onChange={setEnergy}
            colorClass="bg-green-500"
            emojis={['😴', '🥱', '😐', '⚡', '🔥']}
            description="How energized do you feel today?"
          />

          {/* Stress Slider */}
          <MoodSlider
            label="Stress"
            value={stress}
            onChange={setStress}
            colorClass="bg-red-500"
            emojis={['😌', '🙂', '😐', '😰', '😫']}
            description="How stressed are you feeling? (Higher = more stressed)"
            isInverse={true}
          />
        </div>

        {/* Notes Textarea */}
        <div className="mb-6">
          <label
            htmlFor={notesId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Notes (optional)
          </label>
          <textarea
            id={notesId}
            value={notes}
            onChange={handleNotesChange}
            placeholder="Anything on your mind? Jot it down here..."
            rows={3}
            className={`
              w-full px-4 py-3 rounded-lg border transition-colors duration-200
              resize-none focus:outline-none focus:ring-2 focus:ring-blue-500
              ${isNotesOverLimit
                ? 'border-red-300 bg-red-50 focus:ring-red-500'
                : 'border-gray-200 bg-gray-50 focus:border-blue-500'
              }
            `}
            aria-describedby={`${notesId}-counter`}
          />
          <div
            id={`${notesId}-counter`}
            className={`text-xs mt-1 text-right ${
              isNotesOverLimit ? 'text-red-500 font-medium' : 'text-gray-400'
            }`}
          >
            {notesLength}/{MAX_NOTES_LENGTH}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={buttonDisabled}
          className={`
            w-full py-3 px-6 rounded-xl font-semibold text-white
            transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300
            ${buttonDisabled
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:scale-[1.02]'
            }
          `}
        >
          {isSubmitting || isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </span>
          ) : isEditMode ? (
            'Update Entry'
          ) : (
            'Save Check-in'
          )}
        </button>

        {/* Supportive message */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Your entries are private and help track your wellbeing over time.
        </p>
      </div>
    </form>
  );
}

export default CheckInForm;

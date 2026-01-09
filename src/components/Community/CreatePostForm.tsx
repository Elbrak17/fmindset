'use client';

import { useState } from 'react';

interface CreatePostFormProps {
  odId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'burnout', label: 'Burnout' },
  { value: 'imposter_syndrome', label: 'Imposter Syndrome' },
  { value: 'isolation', label: 'Isolation' },
];

export function CreatePostForm({ odId, onSuccess, onCancel }: CreatePostFormProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('general');
  const [showArchetype, setShowArchetype] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          odId,
          title,
          body,
          category,
          showArchetype,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create post');
      }

      setTitle('');
      setBody('');
      setCategory('general');
      setShowArchetype(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Share with the community</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Title */}
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="What's on your mind?"
        />
        <p className="mt-1 text-xs text-gray-500">{title.length}/100</p>
      </div>

      {/* Category */}
      <div className="mb-4">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Body */}
      <div className="mb-4">
        <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
          Your message
        </label>
        <textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          required
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          placeholder="Share your experience, ask for advice, or offer support..."
        />
        <p className="mt-1 text-xs text-gray-500">{body.length}/2000</p>
      </div>

      {/* Show Archetype Toggle */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={showArchetype}
            onChange={(e) => setShowArchetype(e.target.checked)}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700">
            Show my founder archetype (helps others relate)
          </span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting || !title.trim() || !body.trim()}
          className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Guidelines */}
      <p className="mt-4 text-xs text-gray-500">
        💡 Remember: Be supportive and respectful. This is a safe space for founders.
      </p>
    </form>
  );
}

export default CreatePostForm;

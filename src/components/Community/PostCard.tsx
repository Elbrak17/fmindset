'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  id: string;
  title: string;
  body: string;
  pseudonym: string;
  category: string;
  archetype?: string | null;
  showArchetype: boolean;
  replyCount: number;
  createdAt: string;
  isOwn?: boolean;
  onDelete?: (id: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  burnout: 'bg-red-100 text-red-700',
  imposter_syndrome: 'bg-purple-100 text-purple-700',
  isolation: 'bg-blue-100 text-blue-700',
  general: 'bg-gray-100 text-gray-700',
};

const CATEGORY_LABELS: Record<string, string> = {
  burnout: 'Burnout',
  imposter_syndrome: 'Imposter Syndrome',
  isolation: 'Isolation',
  general: 'General',
};

export function PostCard({
  id,
  title,
  body,
  pseudonym,
  category,
  archetype,
  showArchetype,
  replyCount,
  createdAt,
  isOwn,
  onDelete,
}: PostCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const truncatedBody = body.length > 150 ? body.substring(0, 150) + '...' : body;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      const odId = localStorage.getItem('odId') || localStorage.getItem('fmindset_odId');
      const response = await fetch(`/api/community/posts/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ odId }),
      });

      if (response.ok) {
        onDelete?.(id);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  return (
    <Link href={`/community/post/${id}`}>
      <article
        className={`
          p-5 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer
          ${isOwn ? 'border-indigo-200 bg-indigo-50/30' : 'border-gray-200 bg-white hover:border-indigo-200'}
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">{pseudonym}</span>
            {isOwn && (
              <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                You
              </span>
            )}
            {showArchetype && archetype && (
              <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                {archetype}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </span>
            {isOwn && (
              <div className="flex items-center gap-1">
                {showDeleteConfirm ? (
                  <>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="px-2 py-1 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600 disabled:opacity-50"
                    >
                      {isDeleting ? '...' : 'Confirm'}
                    </button>
                    <button
                      onClick={cancelDelete}
                      className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleDelete}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete post"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Category Badge */}
        <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mb-2 ${CATEGORY_COLORS[category]}`}>
          {CATEGORY_LABELS[category]}
        </span>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {title}
        </h3>

        {/* Body Preview */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {truncatedBody}
        </p>

        {/* Footer */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
          </span>
        </div>
      </article>
    </Link>
  );
}

export default PostCard;

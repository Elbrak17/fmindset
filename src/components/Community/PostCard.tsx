'use client';

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
}: PostCardProps) {
  const truncatedBody = body.length > 150 ? body.substring(0, 150) + '...' : body;

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
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </span>
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

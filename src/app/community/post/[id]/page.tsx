'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: string;
  title: string;
  body: string;
  pseudonym: string;
  category: string;
  archetype: string | null;
  showArchetype: boolean;
  replyCount: number;
  createdAt: string;
  userId: string;
}

interface Reply {
  id: string;
  body: string;
  pseudonym: string;
  parentReplyId: string | null;
  createdAt: string;
  userId: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  burnout: 'bg-red-100 text-red-700',
  imposter_syndrome: 'bg-purple-100 text-purple-700',
  isolation: 'bg-blue-100 text-blue-700',
  general: 'bg-gray-100 text-gray-700',
};

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyBody, setReplyBody] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: 'post' | 'reply'; id: string } | null>(null);
  const [reportReason, setReportReason] = useState('');

  const [odId, setOdId] = useState<string | null>(null);
  const [userPseudonym, setUserPseudonym] = useState<string | null>(null);

  useEffect(() => {
    const storedOdId = localStorage.getItem('odId') || localStorage.getItem('fmindset_odId');
    setOdId(storedOdId);
    const storedPseudonym = localStorage.getItem('fmindset_pseudonym');
    setUserPseudonym(storedPseudonym);
  }, []);

  const fetchPost = useCallback(async () => {
    try {
      const response = await fetch(`/api/community/posts/${postId}`);
      if (!response.ok) {
        router.push('/community');
        return;
      }
      const data = await response.json();
      setPost(data.post);
      setReplies(data.replies || []);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setIsLoading(false);
    }
  }, [postId, router]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!odId || !replyBody.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/community/posts/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          odId,
          body: replyBody,
          parentReplyId: replyingTo,
        }),
      });

      if (response.ok) {
        setReplyBody('');
        setReplyingTo(null);
        fetchPost();
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReport = async () => {
    if (!odId || !reportTarget || !reportReason.trim()) return;

    try {
      await fetch(`/api/community/posts/${postId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          odId,
          reason: reportReason,
          replyId: reportTarget.type === 'reply' ? reportTarget.id : undefined,
        }),
      });
      setShowReportModal(false);
      setReportTarget(null);
      setReportReason('');
    } catch (error) {
      console.error('Error reporting:', error);
    }
  };

  // Organize replies into threads
  const topLevelReplies = replies.filter((r) => !r.parentReplyId);
  const getChildReplies = (parentId: string) => replies.filter((r) => r.parentReplyId === parentId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Post not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href="/community"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Community
        </Link>

        {/* Post */}
        <article className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-gray-900">{post.pseudonym}</span>
              {post.userId === odId && (
                <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                  You
                </span>
              )}
              {post.showArchetype && post.archetype && (
                <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                  {post.archetype}
                </span>
              )}
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${CATEGORY_COLORS[post.category]}`}>
                {post.category.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
              {post.userId !== odId && (
                <button
                  onClick={() => {
                    setReportTarget({ type: 'post', id: post.id });
                    setShowReportModal(true);
                  }}
                  className="text-gray-400 hover:text-red-500"
                  title="Report"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>

          {/* Body */}
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{post.body}</p>
          </div>
        </article>

        {/* Reply Form */}
        {odId && userPseudonym ? (
          <form onSubmit={handleSubmitReply} className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
              <span>Replying as</span>
              <span className="font-semibold text-indigo-600">{userPseudonym}</span>
            </div>
            {replyingTo && (
              <div className="flex items-center justify-between mb-2 text-sm text-gray-600">
                <span>Replying to a comment</span>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="text-indigo-600 hover:underline"
                >
                  Cancel
                </button>
              </div>
            )}
            <textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="Share your thoughts..."
              rows={3}
              maxLength={1000}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">{replyBody.length}/1000</span>
              <button
                type="submit"
                disabled={isSubmitting || !replyBody.trim()}
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Posting...' : 'Reply'}
              </button>
            </div>
          </form>
        ) : odId && !userPseudonym ? (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4 mb-6">
            <p className="text-sm text-indigo-800 mb-3">
              <span className="font-semibold">Create a pseudonym to reply</span> — Your identity stays anonymous
            </p>
            <Link
              href="/community"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <span>🎭</span>
              Set up your pseudonym
            </Link>
          </div>
        ) : null}

        {/* Replies */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
          </h2>

          {topLevelReplies.map((reply) => (
            <div key={reply.id} className="space-y-3">
              {/* Top-level reply */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{reply.pseudonym}</span>
                    {reply.userId === odId && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                    </span>
                    {reply.userId !== odId && (
                      <button
                        onClick={() => {
                          setReportTarget({ type: 'reply', id: reply.id });
                          setShowReportModal(true);
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{reply.body}</p>
                {odId && userPseudonym && (
                  <button
                    onClick={() => setReplyingTo(reply.id)}
                    className="mt-2 text-sm text-indigo-600 hover:underline"
                  >
                    Reply
                  </button>
                )}
              </div>

              {/* Nested replies */}
              {getChildReplies(reply.id).map((childReply) => (
                <div key={childReply.id} className="ml-8 bg-gray-50 rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{childReply.pseudonym}</span>
                      {childReply.userId === odId && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(childReply.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{childReply.body}</p>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Content</h3>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Why are you reporting this?"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none mb-4"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setReportTarget(null);
                    setReportReason('');
                  }}
                  className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReport}
                  disabled={!reportReason.trim()}
                  className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

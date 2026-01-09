'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PostCard, CreatePostForm } from '@/components/Community';

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

const CATEGORIES = [
  { value: '', label: 'All Topics' },
  { value: 'general', label: 'General' },
  { value: 'burnout', label: 'Burnout' },
  { value: 'imposter_syndrome', label: 'Imposter Syndrome' },
  { value: 'isolation', label: 'Isolation' },
];

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Get odId from localStorage
  const [odId, setOdId] = useState<string | null>(null);

  useEffect(() => {
    const storedOdId = localStorage.getItem('odId');
    setOdId(storedOdId);
  }, []);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        sort: sortBy,
        ...(category && { category }),
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/community/posts?${params}`);
      const data = await response.json();
      setPosts(data.posts || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, sortBy, category, searchQuery]);

  const fetchTrending = useCallback(async () => {
    try {
      const response = await fetch('/api/community/posts?trending=true');
      const data = await response.json();
      setTrendingPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching trending:', error);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchTrending();
  }, [fetchPosts, fetchTrending]);

  const handlePostCreated = () => {
    setShowCreateForm(false);
    fetchPosts();
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Founder Community</h1>
          <p className="text-gray-600">
            Connect anonymously with founders who understand your journey
          </p>
        </div>

        {/* Guidelines Banner */}
        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
          <p className="text-sm text-indigo-800">
            🤝 <strong>Community Guidelines:</strong> Be supportive, respectful, and constructive. 
            This is a safe space for founders to share and grow together.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post Button / Form */}
            {odId && (
              showCreateForm ? (
                <CreatePostForm
                  odId={odId}
                  onSuccess={handlePostCreated}
                  onCancel={() => setShowCreateForm(false)}
                />
              ) : (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full p-4 bg-white border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                >
                  + Share something with the community
                </button>
              )
            )}

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border border-gray-200">
              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Category Filter */}
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            {/* Posts List */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-500">No posts yet. Be the first to share!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    {...post}
                    isOwn={post.userId === odId}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Links */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Explore</h3>
              <div className="space-y-2">
                <Link
                  href="/community/peers"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xl">🤝</span>
                  <div>
                    <p className="font-medium text-gray-900">Find Peers</p>
                    <p className="text-sm text-gray-500">Connect with similar founders</p>
                  </div>
                </Link>
                <Link
                  href="/community/compatibility"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xl">⚖️</span>
                  <div>
                    <p className="font-medium text-gray-900">Co-Founder Match</p>
                    <p className="text-sm text-gray-500">Check compatibility</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Trending */}
            {trendingPosts.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">🔥 Trending</h3>
                <div className="space-y-3">
                  {trendingPosts.slice(0, 5).map((post) => (
                    <Link
                      key={post.id}
                      href={`/community/post/${post.id}`}
                      className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <p className="font-medium text-gray-900 text-sm line-clamp-2">
                        {post.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {post.replyCount} replies
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy Note */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <h3 className="font-semibold text-green-800 mb-2">🔒 Your Privacy</h3>
              <p className="text-sm text-green-700">
                All posts are anonymous. Your real identity is never shared. 
                You control whether to show your archetype.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

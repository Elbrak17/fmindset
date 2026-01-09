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
  { value: '', label: 'All Topics', icon: '🌐' },
  { value: 'general', label: 'General', icon: '💬' },
  { value: 'burnout', label: 'Burnout', icon: '🔥' },
  { value: 'imposter_syndrome', label: 'Imposter Syndrome', icon: '🎭' },
  { value: 'isolation', label: 'Isolation', icon: '🏝️' },
];

function getOrCreateOdId(): string {
  if (typeof window === 'undefined') return '';
  
  let odId = localStorage.getItem('odId') || localStorage.getItem('fmindset_odId');
  if (!odId) {
    odId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('odId', odId);
    localStorage.setItem('fmindset_odId', odId);
  }
  return odId;
}

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

  const [odId, setOdId] = useState<string | null>(null);
  const [userPseudonym, setUserPseudonym] = useState<string | null>(null);
  const [showPseudonymSetup, setShowPseudonymSetup] = useState(false);
  const [customPseudonym, setCustomPseudonym] = useState('');
  const [pseudonymError, setPseudonymError] = useState('');

  useEffect(() => {
    const id = getOrCreateOdId();
    setOdId(id);
    const storedPseudonym = localStorage.getItem('fmindset_pseudonym');
    if (storedPseudonym) {
      setUserPseudonym(storedPseudonym);
    }
  }, []);

  const generatePseudonym = useCallback(() => {
    const number = Math.floor(1000 + Math.random() * 9000);
    const newPseudonym = `Founder-${number}`;
    localStorage.setItem('fmindset_pseudonym', newPseudonym);
    setUserPseudonym(newPseudonym);
    setShowPseudonymSetup(false);
    setCustomPseudonym('');
    setPseudonymError('');
  }, []);

  const saveCustomPseudonym = useCallback(() => {
    const trimmed = customPseudonym.trim();
    if (trimmed.length < 3) {
      setPseudonymError('Minimum 3 characters');
      return;
    }
    if (trimmed.length > 20) {
      setPseudonymError('Maximum 20 characters');
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setPseudonymError('Only letters, numbers, - and _');
      return;
    }
    localStorage.setItem('fmindset_pseudonym', trimmed);
    setUserPseudonym(trimmed);
    setShowPseudonymSetup(false);
    setCustomPseudonym('');
    setPseudonymError('');
  }, [customPseudonym]);

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

  const handlePostDeleted = (deletedId: string) => {
    setPosts(posts.filter(p => p.id !== deletedId));
    setTotal(prev => prev - 1);
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent" />
      <div className="fixed top-40 left-[5%] w-80 h-80 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl animate-blob" />
      <div className="fixed bottom-40 right-[5%] w-96 h-96 bg-gradient-to-br from-cyan-200/20 to-indigo-200/20 rounded-full blur-3xl animate-blob animation-delay-2000" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-indigo-100 shadow-sm mb-4">
            <span className="text-lg">👥</span>
            <span className="text-sm font-medium text-gray-600">Anonymous & Safe</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-4">
            Founder <span className="gradient-text">Community</span>
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl">
            Connect anonymously with founders who understand your journey
          </p>
        </div>

        {/* Guidelines Banner */}
        <div className="mb-8 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl animate-fade-in-up animation-delay-100">
          <p className="text-sm text-indigo-800 flex items-center gap-2">
            <span className="text-xl">🤝</span>
            <span><strong>Community Guidelines:</strong> Be supportive, respectful, and constructive. This is a safe space for founders to share and grow together.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post */}
            {odId && (
              showCreateForm ? (
                <div className="animate-scale-in">
                  <CreatePostForm
                    odId={odId}
                    onSuccess={handlePostCreated}
                    onCancel={() => setShowCreateForm(false)}
                  />
                </div>
              ) : (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="group w-full p-6 bg-white/80 backdrop-blur-sm border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-white transition-all duration-300 animate-fade-in-up"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Share something with the community
                  </span>
                </button>
              )
            )}

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-white/50 shadow-lg shadow-gray-100/50 animate-fade-in-up animation-delay-200">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular')}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              >
                <option value="recent">🕐 Most Recent</option>
                <option value="popular">🔥 Most Popular</option>
              </select>
            </div>

            {/* Posts List */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-6 animate-pulse">
                    <div className="h-4 bg-gray-100 rounded-full w-1/4 mb-4" />
                    <div className="h-6 bg-gray-100 rounded-full w-3/4 mb-3" />
                    <div className="h-4 bg-gray-100 rounded-full w-full" />
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg">
                <span className="text-6xl mb-4 block">💭</span>
                <p className="text-gray-500 text-lg">No posts yet. Be the first to share!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post, index) => (
                  <div key={post.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                    <PostCard
                      {...post}
                      isOwn={post.userId === odId}
                      onDelete={handlePostDeleted}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 pt-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-5 py-2.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl disabled:opacity-50 hover:border-indigo-300 hover:shadow-lg transition-all"
                >
                  ← Previous
                </button>
                <span className="px-4 py-2 text-gray-600 font-medium">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-5 py-2.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl disabled:opacity-50 hover:border-indigo-300 hover:shadow-lg transition-all"
                >
                  Next →
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Anonymous Identity */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg shadow-gray-100/50 p-6 animate-fade-in-up animation-delay-300">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">🎭</span>
                Your Anonymous Identity
              </h3>
              {userPseudonym ? (
                <div>
                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl mb-3">
                    <p className="text-xl font-bold gradient-text">{userPseudonym}</p>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">This is how you appear in the community</p>
                  <button
                    onClick={() => setShowPseudonymSetup(true)}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
                  >
                    Change pseudonym
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-4">Create an anonymous identity to participate</p>
                  
                  <div className="mb-3">
                    <input
                      type="text"
                      value={customPseudonym}
                      onChange={(e) => {
                        setCustomPseudonym(e.target.value);
                        setPseudonymError('');
                      }}
                      placeholder="Enter your pseudonym"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      maxLength={20}
                    />
                    {pseudonymError && (
                      <p className="text-xs text-rose-500 mt-2">{pseudonymError}</p>
                    )}
                  </div>
                  
                  <button
                    onClick={saveCustomPseudonym}
                    disabled={!customPseudonym.trim()}
                    className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Use This Pseudonym
                  </button>
                  
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-xs text-gray-400">or</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>
                  
                  <button
                    onClick={generatePseudonym}
                    className="w-full px-4 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
                  >
                    🎲 Generate Random
                  </button>
                </div>
              )}
              
              {showPseudonymSetup && userPseudonym && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-600 mb-3">Change your pseudonym:</p>
                  
                  <div className="mb-3">
                    <input
                      type="text"
                      value={customPseudonym}
                      onChange={(e) => {
                        setCustomPseudonym(e.target.value);
                        setPseudonymError('');
                      }}
                      placeholder="Enter new pseudonym"
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                      maxLength={20}
                    />
                    {pseudonymError && (
                      <p className="text-xs text-rose-500 mt-2">{pseudonymError}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={saveCustomPseudonym}
                      disabled={!customPseudonym.trim()}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setShowPseudonymSetup(false);
                        setCustomPseudonym('');
                        setPseudonymError('');
                      }}
                      className="px-4 py-2.5 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                  
                  <button
                    onClick={generatePseudonym}
                    className="w-full px-4 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-100"
                  >
                    🎲 Generate random instead
                  </button>
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg shadow-gray-100/50 p-6 animate-fade-in-up animation-delay-400">
              <h3 className="font-bold text-gray-900 mb-4">Explore</h3>
              <div className="space-y-2">
                {[
                  { href: '/community/peers', icon: '🤝', title: 'Find Peers', desc: 'Connect with similar founders' },
                  { href: '/community/compatibility', icon: '⚖️', title: 'Co-Founder Match', desc: 'Check compatibility' },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">{link.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{link.title}</p>
                      <p className="text-sm text-gray-500">{link.desc}</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-300 group-hover:text-indigo-400 ml-auto group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>

            {/* Trending */}
            {trendingPosts.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg shadow-gray-100/50 p-6 animate-fade-in-up animation-delay-500">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">🔥</span>
                  Trending
                </h3>
                <div className="space-y-3">
                  {trendingPosts.slice(0, 5).map((post, i) => (
                    <Link
                      key={post.id}
                      href={`/community/post/${post.id}`}
                      className="group block p-4 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300"
                    >
                      <p className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {post.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <span>💬</span> {post.replyCount} replies
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy Note */}
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100 rounded-2xl p-6 animate-fade-in-up animation-delay-500">
              <h3 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                <span className="text-xl">🔒</span>
                Your Privacy
              </h3>
              <p className="text-sm text-emerald-700 leading-relaxed">
                All posts are anonymous. Your real identity is never shared. You control whether to show your archetype.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

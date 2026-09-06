import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from '../components/Navbar';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import { getPosts } from '../services/api';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPosts: 0,
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'for_you', 'most_liked', 'most_commented'

  // Current logged in user
  const storedUser = localStorage.getItem('user');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError('');

    try {
      const res = await getPosts(pageNum, 10);
      const newPosts = res.data.posts || [];
      const pagInfo = res.data.pagination || {};

      if (append) {
        setPosts((prev) => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }

      setPagination(pagInfo);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setError('Failed to load feed. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(1, false);
  }, [fetchPosts]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
    setPagination((prev) => ({
      ...prev,
      totalPosts: prev.totalPosts + 1
    }));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
    );
  };

  const handleLoadMore = () => {
    if (pagination.hasNextPage && !loadingMore) {
      fetchPosts(page + 1, true);
    }
  };

  // Filter & Search computation
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.content?.toLowerCase().includes(q) ||
          p.user?.username?.toLowerCase().includes(q)
      );
    }

    if (activeFilter === 'most_liked') {
      result.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
    } else if (activeFilter === 'most_commented') {
      result.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
    }

    return result;
  }, [posts, searchQuery, activeFilter]);

  return (
    <div className="tp-feed-page">
      <Navbar username={currentUser?.username} />

      <main className="tp-main-container">
        {/* Search Bar Section */}
        <div className="tp-search-bar-wrap">
          <div className="tp-search-input-box">
            <input
              type="text"
              className="tp-search-input"
              placeholder="Search promotions, users, posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="tp-search-action-btn" title="Search">
              <span>🔍</span>
            </button>
          </div>
          <div className="tp-avatar-search-right">
            <div className="tp-avatar-search-circle">
              {currentUser?.username
                ? currentUser.username.charAt(0).toUpperCase()
                : 'U'}
            </div>
          </div>
        </div>

        {/* Create Post Card */}
        <CreatePost
          username={currentUser?.username || 'User'}
          onPostCreated={handlePostCreated}
        />

        {/* Feed Filter Tabs */}
        <div className="tp-filter-tabs-row">
          <button
            type="button"
            className={`tp-filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All Post
          </button>
          <button
            type="button"
            className={`tp-filter-pill ${activeFilter === 'for_you' ? 'active' : ''}`}
            onClick={() => setActiveFilter('for_you')}
          >
            For You
          </button>
          <button
            type="button"
            className={`tp-filter-pill ${activeFilter === 'most_liked' ? 'active' : ''}`}
            onClick={() => setActiveFilter('most_liked')}
          >
            Most Liked
          </button>
          <button
            type="button"
            className={`tp-filter-pill ${activeFilter === 'most_commented' ? 'active' : ''}`}
            onClick={() => setActiveFilter('most_commented')}
          >
            Most Commented
          </button>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="tp-loading-state">
            <div className="tp-spinner"></div>
            <p>Loading TaskPlanet feed...</p>
          </div>
        )}

        {/* Error Alert */}
        {error && !loading && (
          <div className="alert alert-error">
            {error}
            <button className="btn-retry" onClick={() => fetchPosts(1, false)}>
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredPosts.length === 0 && (
          <div className="tp-empty-card">
            <span className="tp-empty-icon">📭</span>
            <h3>No posts found</h3>
            <p>Be the first to share an update on the TaskPlanet social feed!</p>
          </div>
        )}

        {/* Posts Stream */}
        {!loading && filteredPosts.length > 0 && (
          <div className="tp-posts-stream">
            {filteredPosts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUser={currentUser}
                onPostUpdated={handlePostUpdated}
              />
            ))}

            {pagination.hasNextPage && (
              <div className="tp-pagination-wrap">
                <button
                  className="tp-btn-load-more"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Loading more...' : 'Load More Posts'}
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Create Action Button */}
      <button
        className="tp-fab-btn"
        onClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          document.getElementById('post-content-input')?.focus();
        }}
        title="Create New Post"
      >
        <span>+</span>
      </button>

      {/* TaskPlanet Bottom Navigation Bar */}
      <nav className="tp-bottom-nav">
        <div className="tp-nav-item">
          <span className="tp-nav-icon">🏠</span>
          <span className="tp-nav-label">Home</span>
        </div>
        <div className="tp-nav-item">
          <span className="tp-nav-icon">📋</span>
          <span className="tp-nav-label">Tasks</span>
        </div>
        <div className="tp-nav-item active">
          <span className="tp-nav-icon">🌐</span>
          <span className="tp-nav-label">Social</span>
        </div>
        <div className="tp-nav-item">
          <span className="tp-nav-icon">🏆</span>
          <span className="tp-nav-label">Leader Board</span>
        </div>
        <div className="tp-nav-item">
          <span className="tp-nav-icon">💬</span>
          <span className="tp-nav-label">Chat</span>
        </div>
      </nav>
    </div>
  );
};

export default Feed;

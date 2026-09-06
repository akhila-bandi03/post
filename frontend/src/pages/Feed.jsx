import React, { useState, useEffect, useCallback } from 'react';
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

  // Get current user from localStorage
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
    // Add new post to top of the feed immediately (newest first)
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

  return (
    <div className="feed-layout">
      <Navbar username={currentUser?.username} />

      <main className="feed-container">
        <div className="feed-column">
          {/* Create Post Section */}
          <CreatePost
            username={currentUser?.username || 'User'}
            onPostCreated={handlePostCreated}
          />

          {/* Loading Indicator */}
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading your feed...</p>
            </div>
          )}

          {/* Error Message */}
          {error && !loading && (
            <div className="alert alert-error">
              {error}
              <button
                className="btn-retry"
                onClick={() => fetchPosts(1, false)}
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty Feed State */}
          {!loading && !error && posts.length === 0 && (
            <div className="empty-feed-card">
              <span className="empty-icon">📭</span>
              <h3>No posts yet</h3>
              <p>Be the first one to share an update or photo with the community!</p>
            </div>
          )}

          {/* Posts Stream */}
          {!loading && posts.length > 0 && (
            <div className="posts-stream">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  currentUser={currentUser}
                  onPostUpdated={handlePostUpdated}
                />
              ))}

              {/* Pagination / Load More Button */}
              {pagination.hasNextPage && (
                <div className="pagination-container">
                  <button
                    className="btn-load-more"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? 'Loading more posts...' : 'Load More Posts'}
                  </button>
                </div>
              )}

              {!pagination.hasNextPage && posts.length > 0 && (
                <div className="end-of-feed-msg">
                  <span>🎉 You're all caught up!</span>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Feed;

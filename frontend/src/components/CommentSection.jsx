import React, { useState } from 'react';
import { addComment } from '../services/api';

const CommentSection = ({ postId, comments = [], onCommentAdded, currentUser }) => {
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed || loading) return;

    setError('');
    const previousComments = [...comments];

    // ─── 1. Instant Optimistic UI Update (0ms delay) ─────────
    const optimisticComment = {
      _id: 'temp-' + Date.now(),
      userId: currentUser?._id || currentUser?.id || 'temp-id',
      username: currentUser?.username || 'You',
      text: trimmed,
      createdAt: new Date().toISOString()
    };

    const optimisticList = [...comments, optimisticComment];
    setCommentText('');
    if (onCommentAdded) {
      onCommentAdded(postId, optimisticList);
    }

    // ─── 2. Async Server Sync ────────────────────────────────
    setLoading(true);
    try {
      const res = await addComment(postId, trimmed);
      // Synchronize with server returned comments
      if (onCommentAdded && res.data && res.data.comments) {
        onCommentAdded(postId, res.data.comments);
      }
    } catch (err) {
      console.error('Comment submission error:', err);
      setError(err.response?.data?.message || 'Failed to post comment.');
      // Rollback on error
      if (onCommentAdded) {
        onCommentAdded(postId, previousComments);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Just now';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Just now';
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="comment-section-wrapper">
      {error && <div className="alert alert-error comment-error">{error}</div>}

      {/* Existing Comments List */}
      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="no-comments-msg">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment, index) => (
            <div key={comment._id || index} className="comment-bubble">
              <div className="comment-avatar">
                {comment.username ? comment.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="comment-body">
                <div className="comment-header">
                  <span className="comment-username">@{comment.username}</span>
                  <span className="comment-time">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="comment-text">{comment.text}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleCommentSubmit} className="comment-form">
        <input
          type="text"
          className="comment-input"
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="btn-send-comment"
          disabled={loading || !commentText.trim()}
        >
          {loading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default CommentSection;

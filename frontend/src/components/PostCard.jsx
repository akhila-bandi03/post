import React, { useState } from 'react';
import CommentSection from './CommentSection';
import { toggleLike } from '../services/api';

const PostCard = ({ post, currentUser, onPostUpdated }) => {
  const [showComments, setShowComments] = useState(false);
  const [showLikersModal, setShowLikersModal] = useState(false);
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [likeLoading, setLikeLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if current user has already liked this post
  const isLiked = currentUser
    ? likes.some(
        (like) =>
          like.userId === currentUser._id ||
          like.userId === currentUser.id ||
          like.username === currentUser.username
      )
    : false;

  const handleLike = async () => {
    if (!currentUser || likeLoading) return;

    setLikeLoading(true);
    const prevLikes = [...likes];

    // ─── 1. Instant Optimistic UI Update (0ms delay) ─────────
    let updatedLikes;
    if (isLiked) {
      // Unlike
      updatedLikes = likes.filter(
        (l) =>
          l.userId !== (currentUser._id || currentUser.id) &&
          l.username !== currentUser.username
      );
    } else {
      // Like
      updatedLikes = [
        ...likes,
        {
          userId: currentUser._id || currentUser.id,
          username: currentUser.username
        }
      ];
    }

    setLikes(updatedLikes);
    if (onPostUpdated) {
      onPostUpdated({ ...post, likes: updatedLikes, comments });
    }

    // ─── 2. Async Server Sync ────────────────────────────────
    try {
      const res = await toggleLike(post._id);
      if (res.data && res.data.likes) {
        setLikes(res.data.likes);
        if (onPostUpdated) {
          onPostUpdated({ ...post, likes: res.data.likes, comments });
        }
      }
    } catch (err) {
      console.error('Like toggle failed:', err);
      // Revert on error
      setLikes(prevLikes);
      if (onPostUpdated) {
        onPostUpdated({ ...post, likes: prevLikes, comments });
      }
    } finally {
      setLikeLoading(false);
    }
  };

  const handleCommentAdded = (postId, updatedComments) => {
    setComments(updatedComments);
    if (onPostUpdated) {
      onPostUpdated({ ...post, comments: updatedComments, likes });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <article className="post-card">
        {/* Post Author Header */}
        <div className="post-header">
          <div className="post-author-info">
            <div className="avatar-circle">
              {post.user?.username
                ? post.user.username.charAt(0).toUpperCase()
                : 'U'}
            </div>
            <div>
              <h4 className="post-author-name">
                👤 {post.user?.username || 'Anonymous'}
              </h4>
              <span className="post-timestamp">{formatDate(post.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Post Content */}
        {post.content && <p className="post-text">{post.content}</p>}

        {/* Post Image */}
        {post.image && (
          <div
            className="post-image-wrapper clickable-image"
            onClick={() => setIsModalOpen(true)}
            title="Click to view full image"
          >
            <img
              src={post.image}
              alt="Post attachment"
              className="post-image"
              loading="lazy"
            />
          </div>
        )}

        {/* Stats Counter Bar */}
        <div className="post-stats-bar">
          <span
            className={`stat-item ${likes.length > 0 ? 'clickable' : ''}`}
            onClick={() => {
              if (likes.length > 0) setShowLikersModal(true);
            }}
            title={likes.length > 0 ? 'Click to see who liked this post' : ''}
          >
            ❤️ {likes.length} {likes.length === 1 ? 'Like' : 'Likes'}
          </span>
          <span
            className="stat-item clickable"
            onClick={() => setShowComments(!showComments)}
          >
            💬 {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
          </span>
        </div>

        <hr className="post-divider" />

        {/* Action Buttons */}
        <div className="post-actions-bar">
          <button
            className={`btn-action-like ${isLiked ? 'liked' : ''}`}
            onClick={handleLike}
            disabled={likeLoading}
          >
            <span className="like-icon">{isLiked ? '❤️' : '🤍'}</span>
            <span>{isLiked ? 'Liked' : 'Like'}</span>
          </button>

          <button
            className="btn-action-comment"
            onClick={() => setShowComments(!showComments)}
          >
            <span className="comment-icon">💬</span>
            <span>Comment</span>
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <CommentSection
            postId={post._id}
            comments={comments}
            onCommentAdded={handleCommentAdded}
            currentUser={currentUser}
          />
        )}
      </article>

      {/* Likers List Modal */}
      {showLikersModal && (
        <div
          className="likers-modal-backdrop"
          onClick={() => setShowLikersModal(false)}
        >
          <div
            className="likers-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="likers-modal-header">
              <h3>❤️ Liked by ({likes.length})</h3>
              <button
                className="btn-modal-close"
                onClick={() => setShowLikersModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="likers-list">
              {likes.map((like, i) => (
                <div key={like.userId || i} className="liker-row">
                  <div className="liker-avatar">
                    {like.username ? like.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="liker-name">@{like.username}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Full Size Image Modal / Lightbox */}
      {isModalOpen && (
        <div className="image-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="image-modal-close"
              onClick={() => setIsModalOpen(false)}
              title="Close"
            >
              ✕
            </button>
            <img
              src={post.image}
              alt="Full size view"
              className="image-modal-img"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default PostCard;

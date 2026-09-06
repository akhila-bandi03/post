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
  const [isFollowing, setIsFollowing] = useState(false);

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

    // Optimistic UI Update (0ms delay)
    let updatedLikes;
    if (isLiked) {
      updatedLikes = likes.filter(
        (l) =>
          l.userId !== (currentUser._id || currentUser.id) &&
          l.username !== currentUser.username
      );
    } else {
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
    if (!dateStr) return 'Aug 30';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <article className="tp-post-card">
        {/* Post Author Header */}
        <div className="tp-post-header">
          <div className="tp-post-author-wrap">
            <div className="tp-post-avatar">
              {post.user?.username ? post.user.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="tp-post-meta">
              <div className="tp-name-badge-row">
                <span className="tp-author-name">
                  {post.user?.username || 'TaskPlanet Member'}
                </span>
                <span className="tp-level-badge">
                  <span className="tp-badge-num">7</span>
                  <span className="tp-badge-crown">👑</span>
                  <span className="tp-badge-title">Legend</span>
                </span>
              </div>
              <div className="tp-handle-date-row">
                <span className="tp-author-handle">@{post.user?.username || 'user'}</span>
                <span className="tp-dot-sep">•</span>
                <span className="tp-date-text">{formatDate(post.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="tp-header-actions">
            <button
              type="button"
              className={`tp-btn-follow ${isFollowing ? 'following' : ''}`}
              onClick={() => setIsFollowing(!isFollowing)}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
            <button type="button" className="tp-btn-more-options" title="Options">
              •••
            </button>
          </div>
        </div>

        {/* Post Category Tag */}
        <div className="tp-tag-row">
          <span className="tp-campaign-tag">TaskPlanet Community</span>
        </div>

        {/* Post Content */}
        {post.content && <p className="tp-post-text">{post.content}</p>}

        {/* Post Image */}
        {post.image && (
          <div
            className="tp-post-media-wrap"
            onClick={() => setIsModalOpen(true)}
            title="Click to view full photo"
          >
            <img
              src={post.image}
              alt="Post attachment"
              className="tp-post-img"
              loading="lazy"
            />
          </div>
        )}

        {/* Stats Counter Bar */}
        <div className="tp-stats-bar">
          <span
            className={`tp-stat-item ${likes.length > 0 ? 'clickable' : ''}`}
            onClick={() => {
              if (likes.length > 0) setShowLikersModal(true);
            }}
            title={likes.length > 0 ? 'See who liked this' : ''}
          >
            ❤️ {likes.length} {likes.length === 1 ? 'Like' : 'Likes'}
          </span>
          <span
            className="tp-stat-item clickable"
            onClick={() => setShowComments(!showComments)}
          >
            💬 {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
          </span>
        </div>

        <hr className="tp-post-divider" />

        {/* Interactive Action Bar */}
        <div className="tp-actions-row">
          <button
            className={`tp-btn-action-like ${isLiked ? 'liked' : ''}`}
            onClick={handleLike}
            disabled={likeLoading}
          >
            <span className="tp-action-icon">{isLiked ? '❤️' : '🤍'}</span>
            <span>{isLiked ? 'Liked' : 'Like'}</span>
          </button>

          <button
            className="tp-btn-action-comment"
            onClick={() => setShowComments(!showComments)}
          >
            <span className="tp-action-icon">💬</span>
            <span>Comment</span>
          </button>
        </div>

        {/* Comment Section Thread */}
        {showComments && (
          <CommentSection
            postId={post._id}
            comments={comments}
            onCommentAdded={handleCommentAdded}
            currentUser={currentUser}
          />
        )}
      </article>

      {/* Likers Modal */}
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

      {/* Full-Size Image Modal / Lightbox */}
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

import React, { useState, useRef } from 'react';
import { createPost } from '../services/api';

const CreatePost = ({ onPostCreated, username }) => {
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'promotions'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image file must be less than 10MB.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedContent = content.trim();
    if (!trimmedContent && !imageFile) {
      setError('Please enter some text or attach an image.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      if (trimmedContent) {
        formData.append('content', trimmedContent);
      }
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await createPost(formData);
      setContent('');
      handleRemoveImage();
      if (onPostCreated) {
        onPostCreated(res.data.post);
      }
    } catch (err) {
      console.error('Create post failed:', err);
      setError(
        err.response?.data?.message ||
          'Failed to publish post. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tp-create-card">
      {/* Header with Title & Post Type Tabs */}
      <div className="tp-create-header">
        <h2 className="tp-create-title">Create Post</h2>
        <div className="tp-create-tabs">
          <button
            type="button"
            className={`tp-create-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Posts
          </button>
          <button
            type="button"
            className={`tp-create-tab ${activeTab === 'promotions' ? 'active' : ''}`}
            onClick={() => setActiveTab('promotions')}
          >
            Promotions
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="tp-create-form">
        {error && <div className="alert alert-error">{error}</div>}

        <div className="tp-create-input-wrap">
          <textarea
            id="post-content-input"
            className="tp-create-textarea"
            placeholder="What's on your mind?"
            rows="3"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
          />
        </div>

        {imagePreview && (
          <div className="tp-create-preview-wrap">
            <img
              src={imagePreview}
              alt="Post preview"
              className="tp-create-preview-img"
            />
            <button
              type="button"
              className="tp-btn-remove-preview"
              onClick={handleRemoveImage}
              title="Remove image"
            >
              ✕
            </button>
          </div>
        )}

        {/* Bottom Action Bar */}
        <div className="tp-create-toolbar">
          <div className="tp-toolbar-left">
            <label
              htmlFor="tp-post-image-file"
              className="tp-tool-btn"
              title="Add Photo"
            >
              <span className="tp-tool-icon">📷</span>
            </label>
            <input
              id="tp-post-image-file"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
              disabled={loading}
            />

            <button
              type="button"
              className="tp-tool-btn"
              title="Add Emoji"
              onClick={() => setContent((prev) => prev + ' 😊')}
            >
              <span className="tp-tool-icon">😊</span>
            </button>

            <button
              type="button"
              className="tp-tool-btn"
              title="Format List"
              onClick={() => setContent((prev) => prev + '\n• ')}
            >
              <span className="tp-tool-icon">☰</span>
            </button>

            <button
              type="button"
              className="tp-btn-promote"
              title="Promote Post"
            >
              <span>📢 Promote</span>
            </button>
          </div>

          <button
            id="submit-post-btn"
            type="submit"
            className="tp-btn-post-submit"
            disabled={loading || (!content.trim() && !imageFile)}
          >
            <span className="tp-post-arrow">➤</span>
            <span>{loading ? 'Posting...' : 'Post'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;

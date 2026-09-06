import React, { useState, useRef } from 'react';
import { createPost } from '../services/api';

const CreatePost = ({ onPostCreated, username }) => {
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file must be less than 5MB.');
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
      setError('Please write something or attach an image.');
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
    <div className="create-post-card">
      <div className="create-post-header">
        <div className="avatar-circle">
          {username ? username.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="create-post-prompt">
          <span className="create-post-title">What's on your mind?</span>
          <span className="create-post-author">Posting as @{username}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="create-post-form">
        {error && <div className="alert alert-error">{error}</div>}

        <textarea
          id="post-content-input"
          className="create-post-textarea"
          placeholder="Write something..."
          rows="3"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
        />

        {imagePreview && (
          <div className="create-post-preview-container">
            <img
              src={imagePreview}
              alt="Post preview"
              className="create-post-preview-img"
            />
            <button
              type="button"
              className="btn-remove-preview"
              onClick={handleRemoveImage}
              title="Remove image"
            >
              ✕
            </button>
          </div>
        )}

        <div className="create-post-footer">
          <label htmlFor="post-image-file" className="btn-add-image">
            <span className="icon">📷</span>
            <span>{imageFile ? 'Change Image' : 'Add Image'}</span>
          </label>
          <input
            id="post-image-file"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageChange}
            disabled={loading}
          />

          <button
            id="submit-post-btn"
            type="submit"
            className="btn-primary btn-post"
            disabled={loading || (!content.trim() && !imageFile)}
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;

import React, { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { env } from '../../config/env';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label = 'Upload Photo' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [urlInput, setUrlInput] = useState('');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB');
      return;
    }

    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${env.apiBaseUrl}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      onChange(data.url);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>{label}</span>
      
      {value ? (
        <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden' }}>
          <img src={value} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <button
            type="button"
            onClick={() => onChange('')}
            style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer' }}
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px',
            width: '100px', 
            height: '100px', 
            borderRadius: '8px', 
            border: '2px dashed var(--color-border)',
            background: 'var(--color-surface-2)',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            color: 'var(--color-text-secondary)',
            flexDirection: 'column',
            flexShrink: 0
          }}>
            {isUploading ? <Loader2 size={20} className="spinner" /> : <Upload size={20} />}
            <span style={{ fontSize: '12px' }}>{isUploading ? 'Uploading...' : 'Upload'}</span>
            <input 
              type="file" 
              accept="image/jpeg,image/png,image/webp,image/avif" 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, marginTop: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Or provide an image URL directly:</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="url"
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                style={{ 
                  flex: 1, 
                  padding: '8px 12px', 
                  borderRadius: '6px', 
                  border: '1px solid var(--color-border)', 
                  background: 'var(--color-surface-1)', 
                  color: 'var(--color-text-primary)',
                  fontSize: '13px'
                }}
              />
              <button 
                type="button" 
                onClick={() => { 
                  if (urlInput.trim()) {
                    onChange(urlInput.trim());
                    setUrlInput('');
                  }
                }}
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: '6px', 
                  background: 'var(--color-surface-2)', 
                  border: '1px solid var(--color-border)',
                  cursor: 'pointer', 
                  color: 'var(--color-text-primary)',
                  fontSize: '13px',
                  fontWeight: 500
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
      {error && <span style={{ color: 'var(--color-error)', fontSize: '12px' }}>{error}</span>}
    </div>
  );
}

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
      const token = localStorage.getItem('menvo_auth_token');
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
          flexDirection: 'column'
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
      )}
      {error && <span style={{ color: 'var(--color-error)', fontSize: '12px' }}>{error}</span>}
    </div>
  );
}

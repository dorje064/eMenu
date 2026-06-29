import { useRef, useState, type KeyboardEvent } from 'react';
import { ImageOff, Loader2, Search, Upload, X } from 'lucide-react';
import { Button } from '@org/ui';
import { menuApi } from '../api/menu.api';
import { ApiError } from '../api/client';
import type { ImageSearchResult } from '../api/types';
import './ImagePicker.css';

interface ImagePickerProps {
  /** Current image URL (absolute Unsplash URL or app-relative upload path). */
  value: string;
  /** Called with the chosen/uploaded URL. */
  onChange: (url: string) => void;
}

const MAX_UPLOAD_MB = 5;

/**
 * ImagePicker — lets an admin set a food photo two ways:
 * search stock images and click one, or upload a file.
 */
export function ImagePicker({ value, onChange }: ImagePickerProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ImageSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const runSearch = async () => {
    const q = query.trim();
    if (!q || searching) return;
    setSearching(true);
    setMessage(null);
    try {
      const res = await menuApi.searchImages(q);
      setResults(res);
      if (res.length === 0)
        setMessage('No images found — try a different search.');
    } catch (err) {
      setMessage(
        err instanceof ApiError
          ? err.message
          : 'Image search failed. Try again.',
      );
    } finally {
      setSearching(false);
    }
  };

  const onSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      runSearch();
    }
  };

  const handleFile = async (file: File) => {
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setMessage(`Image must be ${MAX_UPLOAD_MB} MB or smaller.`);
      return;
    }
    setUploading(true);
    setMessage(null);
    try {
      const { imageUrl } = await menuApi.uploadImage(file);
      onChange(imageUrl);
      setResults([]);
    } catch (err) {
      setMessage(
        err instanceof ApiError ? err.message : 'Upload failed. Try again.',
      );
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const select = (img: ImageSearchResult) => {
    onChange(img.fullUrl);
    setMessage(null);
  };

  return (
    <div className="image-picker">
      <span className="image-picker__label">Image</span>

      {/* Full-width selected preview. */}
      <div className="image-picker__preview">
        {value ? (
          <>
            <img src={value} alt="Selected food" />
            <Button
              type="button"
              variant="tertiary"
              shape="icon"
              aria-label="Clear image"
              className="image-picker__clear"
              onClick={() => onChange('')}
              leadingIcon={<X size={16} />}
            />
          </>
        ) : (
          <div className="image-picker__placeholder">
            <ImageOff size={28} aria-hidden="true" />
            <span>No image selected</span>
          </div>
        )}
      </div>

      {/* Input group: search field with appended Search + Upload buttons. */}
      <div className="image-picker__input-group">
        <Search
          className="image-picker__group-icon"
          size={16}
          aria-hidden="true"
        />
        <input
          type="text"
          className="image-picker__group-field"
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          onKeyDown={onSearchKeyDown}
          placeholder="Search for an image, e.g. margherita pizza"
          aria-label="Search stock photos"
        />
        <button
          type="button"
          className="image-picker__group-btn"
          onClick={runSearch}
          disabled={!query.trim() || searching}
        >
          {searching ? (
            <Loader2
              className="image-picker__spinner"
              size={16}
              aria-hidden="true"
            />
          ) : (
            <Search size={16} aria-hidden="true" />
          )}
          Search
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          hidden
          onChange={(e) => {
            const file = e.currentTarget.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <button
          type="button"
          className="image-picker__group-btn"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2
              className="image-picker__spinner"
              size={16}
              aria-hidden="true"
            />
          ) : (
            <Upload size={16} aria-hidden="true" />
          )}
          Upload
        </button>
      </div>

      {message && <p className="image-picker__message">{message}</p>}

      {/* Results grid. */}
      {searching ? (
        <div className="image-picker__loading">
          <Loader2
            className="image-picker__spinner"
            size={20}
            aria-hidden="true"
          />
          Searching images…
        </div>
      ) : results.length > 0 ? (
        <ul className="image-picker__grid" aria-label="Image search results">
          {results.map((img) => {
            const selected = value === img.fullUrl;
            return (
              <li key={img.id}>
                <button
                  type="button"
                  className={`image-picker__thumb${
                    selected ? ' image-picker__thumb--selected' : ''
                  }`}
                  onClick={() => select(img)}
                  title={img.credit ? `Photo by ${img.credit}` : undefined}
                  aria-pressed={selected}
                >
                  <img src={img.thumbUrl} alt={img.alt ?? 'Search result'} />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

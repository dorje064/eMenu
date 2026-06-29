import { useRef, useState, type KeyboardEvent } from 'react';
import { ImageOff, Loader2, Search, Upload, X } from 'lucide-react';
import { Button, Input } from '@org/ui';
import { menuApi } from '../api/menu.api';
import { ApiError } from '../api/client';
import type { ImageSearchResult } from '../api/types';
import './ImagePicker.css';

interface ImagePickerProps {
  /** Current image URL (absolute Unsplash URL or app-relative upload path). */
  value: string;
  /** Called with the chosen/uploaded/typed URL. */
  onChange: (url: string) => void;
  /** External error to surface (e.g. server validation). */
  error?: string;
}

const MAX_UPLOAD_MB = 5;

/**
 * ImagePicker — lets an admin set a food photo three ways:
 * search stock images and click one, upload a file, or paste a URL.
 */
export function ImagePicker({ value, onChange, error }: ImagePickerProps) {
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
      if (res.length === 0) setMessage('No images found — try a different search.');
    } catch (err) {
      setMessage(
        err instanceof ApiError ? err.message : 'Image search failed. Try again.'
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
      setMessage(err instanceof ApiError ? err.message : 'Upload failed. Try again.');
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

      {/* Selected preview + current URL (editable / pasteable). */}
      <div className="image-picker__current">
        <div className="image-picker__preview">
          {value ? (
            <img src={value} alt="Selected food" />
          ) : (
            <ImageOff size={20} aria-hidden="true" />
          )}
        </div>
        <div className="image-picker__url">
          <Input
            label="Image URL"
            value={value}
            onChange={(e) => onChange(e.currentTarget.value)}
            placeholder="https://… or pick / upload below"
            error={error}
          />
        </div>
        {value && (
          <Button
            type="button"
            variant="tertiary"
            shape="icon"
            aria-label="Clear image"
            onClick={() => onChange('')}
            leadingIcon={<X size={16} />}
          />
        )}
      </div>

      {/* Search row. */}
      <div className="image-picker__search">
        <Input
          label="Search stock photos"
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          onKeyDown={onSearchKeyDown}
          placeholder="e.g. margherita pizza"
          leadingIcon={<Search size={16} />}
        />
        <Button
          type="button"
          variant="secondary"
          onClick={runSearch}
          loading={searching}
          disabled={!query.trim()}
        >
          Search
        </Button>
        <div className="image-picker__upload">
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
          <Button
            type="button"
            variant="tertiary"
            onClick={() => fileRef.current?.click()}
            loading={uploading}
            leadingIcon={<Upload size={16} />}
          >
            Upload
          </Button>
        </div>
      </div>

      {message && <p className="image-picker__message">{message}</p>}

      {/* Results grid. */}
      {searching ? (
        <div className="image-picker__loading">
          <Loader2 className="image-picker__spinner" size={20} aria-hidden="true" />
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

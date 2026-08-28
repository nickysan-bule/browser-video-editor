import React from 'react';
import { validateClipFile } from '../utils/validation';
import styles from '../App.module.css';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  error?: string;
  onErrorDismiss?: () => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFilesSelected,
  disabled = false,
  error,
  onErrorDismiss,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const validFiles: File[] = [];

    // Validate each file
    for (const file of files) {
      const validation = validateClipFile(file);
      if (!validation.valid) {
        console.warn(validation.error);
        // In a real app, you'd show this error to the user
        // For now, we skip invalid files
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }

    // Reset input so same file can be selected again
    e.target.value = '';
  };

  return (
    <div>
      {error && (
        <div className={styles.errorBox}>
          {error}
          {onErrorDismiss && (
            <button
              className={styles.errorClose}
              onClick={onErrorDismiss}
              aria-label="Dismiss error"
            >
              ✕
            </button>
          )}
        </div>
      )}

      <div className={`${styles.uploadSection} ${disabled ? styles.disabled : ''}`}>
        <label className={styles.uploadLabel}>Upload video clips</label>
        <input
          type="file"
          multiple
          accept="video/mp4,video/quicktime,video/x-msvideo"
          onChange={handleFileChange}
          disabled={disabled}
          className={styles.fileInput}
          aria-describedby="upload-help"
        />
        <p id="upload-help" style={{ fontSize: '12px', color: '#999', margin: '8px 0 0' }}>
          MP4, MOV, or AVI • Max 100MB per clip • Max 500MB total
        </p>
      </div>
    </div>
  );
};

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// Individual clip limits
const MAX_CLIP_SIZE = 100 * 1024 * 1024; // 100MB per clip
const TOTAL_MAX_SIZE = 500 * 1024 * 1024; // 500MB total
const ALLOWED_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];

export const validateClipFile = (file: File): ValidationResult => {
  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `${file.name} is not a supported video format. Use MP4, MOV, or AVI.`,
    };
  }

  // Check file size
  if (file.size > MAX_CLIP_SIZE) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(0);
    return {
      valid: false,
      error: `${file.name} is ${sizeMB}MB. Max size is 100MB per clip.`,
    };
  }

  return { valid: true };
};

export const validateTotalSize = (files: File[]): ValidationResult => {
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  if (totalSize > TOTAL_MAX_SIZE) {
    const totalMB = (totalSize / 1024 / 1024).toFixed(0);
    return {
      valid: false,
      error: `Total video size (${totalMB}MB) exceeds 500MB limit. Remove or replace some clips.`,
    };
  }

  return { valid: true };
};

export const validateCaption = (text: string): ValidationResult => {
  const maxLength = 200; // SRT subtitle line limit

  if (text.length > maxLength) {
    return {
      valid: false,
      error: `Caption too long (${text.length}/${maxLength} chars). Keep it under 200 characters.`,
    };
  }

  return { valid: true };
};

export const validateExport = (
  clips: Array<{ file: File }>,
  hasContent: boolean
): ValidationResult => {
  if (clips.length === 0) {
    return {
      valid: false,
      error: 'Add at least one video clip to export.',
    };
  }

  if (!hasContent) {
    return {
      valid: false,
      error: 'No clips to process. Check that all files are valid videos.',
    };
  }

  return { valid: true };
};

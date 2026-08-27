import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { VideoClip } from '../utils/videoUtils';
import styles from './SortableClip.module.css';

interface SortableClipProps {
  clip: VideoClip;
  onCaptionChange: (id: string, text: string) => void;
  onRemove: (id: string) => void;
}

export const SortableClip: React.FC<SortableClipProps> = ({
  clip,
  onCaptionChange,
  onRemove,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: clip.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.clip} ${isDragging ? styles.dragging : ''}`}
    >
      <div className={styles.header}>
        <span
          {...attributes}
          {...listeners}
          className={styles.dragHandle}
          title="Drag to reorder"
        >
          ⋮⋮
        </span>
        <div className={styles.clipInfo}>
          <span className={styles.clipName}>{clip.name}</span>
          <span className={styles.clipDuration}>{clip.duration.toFixed(1)}s</span>
        </div>
        <button
          onClick={() => onRemove(clip.id)}
          className={styles.removeButton}
          aria-label={`Remove ${clip.name}`}
          title="Remove clip"
        >
          ✕
        </button>
      </div>

      <input
        type="text"
        placeholder="Add caption (optional)"
        value={clip.caption}
        onChange={(e) => onCaptionChange(clip.id, e.target.value)}
        maxLength={200}
        className={styles.captionInput}
        aria-label={`Caption for ${clip.name}`}
      />

      {clip.caption && (
        <p className={styles.charCount}>
          {clip.caption.length} / 200 characters
        </p>
      )}
    </div>
  );
};

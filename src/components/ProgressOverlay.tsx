import React from 'react';
import { formatTime, getStepEstimate } from '../utils/timing';
import styles from './ProgressOverlay.module.css';

interface ProgressOverlayProps {
  isVisible: boolean;
  currentStep: number; // 1, 2, 3
  totalSteps: number; // 3
  status: string;
  estimatedTotalSeconds: number;
  elapsedSeconds: number;
  onCancel?: () => void;
}

export const ProgressOverlay: React.FC<ProgressOverlayProps> = ({
  isVisible,
  currentStep,
  totalSteps,
  status,
  estimatedTotalSeconds,
  elapsedSeconds,
  onCancel,
}) => {
  if (!isVisible) return null;

  const progressPercent = Math.min(
    (elapsedSeconds / estimatedTotalSeconds) * 100,
    95
  ); // cap at 95% until done

  const stepInfo = getStepEstimate(currentStep, estimatedTotalSeconds);
  const timeRemaining = Math.max(0, estimatedTotalSeconds - elapsedSeconds);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Processing video...</h2>

        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className={styles.stepInfo}>
          <div className={styles.stepLabel}>
            Step {currentStep} of {totalSteps}
          </div>
          <div className={styles.stepDescription}>{stepInfo.label}</div>
        </div>

        <div className={styles.timing}>
          <div className={styles.timingRow}>
            <span className={styles.timingLabel}>Elapsed:</span>
            <span className={styles.timingValue}>{formatTime(elapsedSeconds)}</span>
          </div>
          <div className={styles.timingRow}>
            <span className={styles.timingLabel}>Remaining:</span>
            <span className={styles.timingValue}>{formatTime(timeRemaining)}</span>
          </div>
        </div>

        <p className={styles.status}>{status}</p>

        {onCancel && (
          <button onClick={onCancel} className={styles.cancelButton}>
            Cancel
          </button>
        )}

        <div className={styles.spinner} />
      </div>
    </div>
  );
};

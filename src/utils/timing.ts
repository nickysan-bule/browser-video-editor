export interface ProgressStep {
  label: string;
  percentComplete: number; // 0-100 for this step
  estimatedSeconds: number;
}

/**
 * Estimate processing time based on total video duration.
 * FFmpeg processing is roughly 1 second of video ≈ 0.5-1s of processing time
 * Plus overhead for format conversion and codec selection.
 */
export const estimateProcessingTime = (totalDurationSeconds: number): number => {
  const baseProcessingMultiplier = 0.8; // processing speed multiplier
  const overheadSeconds = 10; // constant overhead for setup/teardown

  return Math.ceil(totalDurationSeconds * baseProcessingMultiplier + overheadSeconds);
};

export const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}m ${secs}s`;
};

/**
 * Return the progress steps and their timing.
 * Used by ProgressOverlay to show which step we're on.
 */
export const getProcessingSteps = (
  totalEstimate: number
): Array<ProgressStep & { step: number }> => {
  return [
    {
      step: 1,
      label: 'Loading video files',
      estimatedSeconds: Math.ceil(totalEstimate * 0.2),
      percentComplete: 20,
    },
    {
      step: 2,
      label: 'Rendering with captions',
      estimatedSeconds: Math.ceil(totalEstimate * 0.7),
      percentComplete: 70,
    },
    {
      step: 3,
      label: 'Finalizing export',
      estimatedSeconds: Math.ceil(totalEstimate * 0.1),
      percentComplete: 100,
    },
  ];
};

export const getStepEstimate = (
  currentStep: number,
  totalEstimate: number
): { label: string; timeRemaining: string } => {
  const steps = getProcessingSteps(totalEstimate);
  const step = steps.find((s) => s.step === currentStep);

  return {
    label: step?.label || 'Processing',
    timeRemaining: step ? formatTime(step.estimatedSeconds) : 'calculating...',
  };
};

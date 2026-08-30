import { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { VideoClip, CaptionStyle, getClipDuration, buildSRTManifest, buildFFmpegStyleParam } from './utils/videoUtils';
import { validateClipFile, validateTotalSize, validateExport } from './utils/validation';
import { checkBrowserCapabilities } from './utils/browserCheck';
import { estimateProcessingTime } from './utils/timing';

import { UploadZone } from './components/UploadZone';
import { StyleControls } from './components/StyleControls';
import { SortableClip } from './components/SortableClip';
import { ProgressOverlay } from './components/ProgressOverlay';

import styles from './App.module.css';

interface ProcessingState {
  isLoading: boolean;
  currentStep: number;
  status: string;
  progress: number;
  startTime: number;
  canCancel: boolean;
}

export default function App() {
  const [clips, setClips] = useState<VideoClip[]>([]);
  const [style, setStyle] = useState<CaptionStyle>({
    fontSize: 24,
    primaryColor: '#FFFF00',
    position: 'bottom',
  });
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [browserError, setBrowserError] = useState<string>('');
  const [processing, setProcessing] = useState<ProcessingState>({
    isLoading: false,
    currentStep: 0,
    status: 'Idle',
    progress: 0,
    startTime: 0,
    canCancel: false,
  });

  const ffmpegRef = useRef<FFmpeg | null>(null);
  const processingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const capabilities = checkBrowserCapabilities();
    if (!capabilities.canProcessVideo) {
      setBrowserError(capabilities.message || 'Your browser is not supported.');
    }
  }, []);

  useEffect(() => {
    return () => {
      if (processingTimerRef.current) {
        clearInterval(processingTimerRef.current);
      }
    };
  }, []);

  const handleFileUpload = async (files: File[]) => {
    setError('');

    const validatedFiles: File[] = [];
    for (const file of files) {
      const validation = validateClipFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        return;
      }
      validatedFiles.push(file);
    }

    const allFiles = [...clips.map((c) => c.file), ...validatedFiles];
    const sizeValidation = validateTotalSize(allFiles);
    if (!sizeValidation.valid) {
      setError(sizeValidation.error || 'Total size exceeded');
      return;
    }

    for (const file of validatedFiles) {
      try {
        const duration = await getClipDuration(file);
        const newClip: VideoClip = {
          id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          name: file.name,
          duration,
          caption: '',
        };
        setClips((prev) => [...prev, newClip]);
      } catch (err) {
        setError(`Failed to read ${file.name}. Make sure it's a valid video file.`);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setClips((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleCaptionChange = (id: string, text: string) => {
    setClips((cs) =>
      cs.map((c) => (c.id === id ? { ...c, caption: text } : c))
    );
  };

  const handleRemoveClip = (id: string) => {
    setClips((cs) => cs.filter((c) => c.id !== id));
  };

  const updateProgress = (step: number, status: string) => {
    setProcessing((prev) => ({
      ...prev,
      currentStep: step,
      status,
      progress: (step / 3) * 100,
    }));
  };

  const initFFmpeg = async (): Promise<FFmpeg> => {
    if (ffmpegRef.current) {
      return ffmpegRef.current;
    }

    const ffmpeg = new FFmpeg();
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';

    try {
      updateProgress(0, 'Loading video processor...');
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      ffmpegRef.current = ffmpeg;
      return ffmpeg;
    } catch (err) {
      throw new Error('Failed to load video processor. Try a different browser.');
    }
  };

  const prepareClips = async (ffmpeg: FFmpeg) => {
    let concatManifest = '';
    const totalClips = clips.length;

    for (let i = 0; i < totalClips; i++) {
      updateProgress(1, `Loading clip ${i + 1} of ${totalClips}...`);
      const filename = `input_${i}.mp4`;

      try {
        await ffmpeg.writeFile(filename, await fetchFile(clips[i].file));
        concatManifest += `file '${filename}'\n`;
      } catch (err) {
        throw new Error(`Failed to process ${clips[i].name}`);
      }
    }

    return concatManifest;
  };

  const renderVideo = async (ffmpeg: FFmpeg, concatManifest: string) => {
    updateProgress(2, 'Rendering with captions...');

    const srtData = buildSRTManifest(clips);
    await ffmpeg.writeFile('concat.txt', concatManifest);
    await ffmpeg.writeFile('subtitles.srt', srtData);

    const styleFilter = buildFFmpegStyleParam(style);

    try {
      await ffmpeg.exec([
        '-f', 'concat',
        '-safe', '0',
        '-i', 'concat.txt',
        '-vf', styleFilter,
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-c:a', 'aac',
        'render_output.mp4',
      ]);
    } catch (err) {
      throw new Error('Rendering failed. Check file format and try again.');
    }

    updateProgress(3, 'Finalizing...');

    const data = await ffmpeg.readFile('render_output.mp4');
    const videoData = data instanceof ArrayBuffer ? data : data.buffer;
    const url = URL.createObjectURL(
      new Blob([videoData], { type: 'video/mp4' })
    );

    return url;
  };

  const processVideo = async () => {
    const validation = validateExport(clips, clips.length > 0);
    if (!validation.valid) {
      setError(validation.error || 'Cannot export');
      return;
    }

    if (browserError) {
      setError(
        'Your browser does not support this feature. Please use a modern browser.'
      );
      return;
    }

    if (processing.isLoading) return;

    setError('');
    setOutputUrl(null);

    const totalDuration = clips.reduce((sum, c) => sum + c.duration, 0);
    const estimatedSeconds = estimateProcessingTime(totalDuration);

    setProcessing({
      isLoading: true,
      currentStep: 1,
      status: 'Initializing...',
      progress: 0,
      startTime: Date.now(),
      canCancel: true,
    });

    processingTimerRef.current = setInterval(() => {
      setProcessing((prev) => {
        if (!prev.isLoading) return prev;
        return { ...prev };
      });
    }, 100);

    try {
      const ffmpeg = await initFFmpeg();
      const concatManifest = await prepareClips(ffmpeg);
      const url = await renderVideo(ffmpeg, concatManifest);

      setOutputUrl(url);
      updateProgress(3, 'Complete!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      updateProgress(0, 'Error');
    } finally {
      if (processingTimerRef.current) {
        clearInterval(processingTimerRef.current);
      }
      setProcessing((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleCancel = () => {
    setProcessing((prev) => ({ ...prev, isLoading: false }));
    setError('Cancelled by user');
  };

  const isProcessing = processing.isLoading;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Video Editor</h1>
        <p className={styles.subtitle}>
          Upload clips, add captions, and download your video
        </p>
      </div>

      {browserError && (
        <div className={styles.errorBox}>
          {browserError}
          <button
            className={styles.errorClose}
            onClick={() => setBrowserError('')}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      <UploadZone
        onFilesSelected={handleFileUpload}
        disabled={isProcessing}
        error={error}
        onErrorDismiss={() => setError('')}
      />

      {clips.length > 0 && (
        <>
          <StyleControls style={style} onChange={setStyle} disabled={isProcessing} />

          <div className={styles.clipList}>
            {clips.length === 0 ? (
              <div className={styles.clipListEmpty}>No clips yet</div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={clips.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {clips.map((clip) => (
                    <SortableClip
                      key={clip.id}
                      clip={clip}
                      onCaptionChange={handleCaptionChange}
                      onRemove={handleRemoveClip}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>

          <button
            onClick={processVideo}
            disabled={isProcessing || clips.length === 0}
            className={styles.buttonPrimary}
          >
            {isProcessing ? 'Processing...' : 'Export Video'}
          </button>

          {processing.status && processing.status !== 'Idle' && (
            <div className={styles.statusBox}>{processing.status}</div>
          )}
        </>
      )}

      {outputUrl && (
        <div className={styles.resultSection}>
          <h2 className={styles.resultTitle}>Your video is ready</h2>
          <video src={outputUrl} controls className={styles.videoPlayer} />
          <a href={outputUrl} download="video.mp4" className={styles.downloadButton}>
            Download video
          </a>
        </div>
      )}

      <ProgressOverlay
        isVisible={isProcessing}
        currentStep={processing.currentStep}
        totalSteps={3}
        status={processing.status}
        estimatedTotalSeconds={estimateProcessingTime(
          clips.reduce((sum, c) => sum + c.duration, 0)
        )}
        elapsedSeconds={(Date.now() - processing.startTime) / 1000}
        onCancel={handleCancel}
      />
    </div>
  );
}

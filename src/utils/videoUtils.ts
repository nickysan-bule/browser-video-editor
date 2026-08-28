export interface VideoClip {
  id: string;
  file: File;
  name: string;
  duration: number;
  caption: string;
}

export interface CaptionStyle {
  fontSize: number;
  primaryColor: string;
  position: 'bottom' | 'top' | 'middle';
}

export const getClipDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = (err) => reject(err);
  });
};

const formatSRTTime = (seconds: number): string => {
  const pad = (n: number, z = 2) => ('00' + n).slice(-z);
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)},${pad(ms, 3)}`;
};

export const buildSRTManifest = (clips: VideoClip[]): string => {
  let srt = '';
  let currentTime = 0;

  clips.forEach((clip, index) => {
    if (clip.caption.trim().length > 0) {
      const startTime = formatSRTTime(currentTime);
      const endTime = formatSRTTime(currentTime + clip.duration);
      srt += `${index + 1}\n${startTime} --> ${endTime}\n${clip.caption}\n\n`;
    }
    currentTime += clip.duration;
  });

  return srt;
};

export const buildFFmpegStyleParam = (style: CaptionStyle): string => {
  const hex = style.primaryColor.replace('#', '');
  const r = hex.substring(0, 2);
  const g = hex.substring(2, 4);
  const b = hex.substring(4, 6);
  const ffmpegColor = `&H00${b}${g}${r}`;

  const alignments = { bottom: 2, middle: 10, top: 6 };

  return `subtitles=subtitles.srt:force_style='FontSize=${style.fontSize},PrimaryColour=${ffmpegColor},Alignment=${alignments[style.position]},Outline=2,BorderStyle=1'`;
};

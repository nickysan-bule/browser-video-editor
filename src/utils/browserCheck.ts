export interface BrowserCapabilities {
  supportsWasm: boolean;
  supportsSharedArrayBuffer: boolean;
  canProcessVideo: boolean;
  message?: string;
}

export const checkBrowserCapabilities = (): BrowserCapabilities => {
  const supportsWasm =
    typeof WebAssembly !== 'undefined' && 
    typeof WebAssembly.validate === 'function';

  const supportsSharedArrayBuffer =
    typeof SharedArrayBuffer !== 'undefined';

  if (!supportsWasm || !supportsSharedArrayBuffer) {
    return {
      supportsWasm,
      supportsSharedArrayBuffer,
      canProcessVideo: false,
      message: `Your browser doesn't support video editing. This feature requires WebAssembly and SharedArrayBuffer support. 
        Please use Chrome 91+, Edge 91+, or Firefox 79+. Safari support is limited.`,
    };
  }

  return {
    supportsWasm: true,
    supportsSharedArrayBuffer: true,
    canProcessVideo: true,
  };
};

export const getBrowserName = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Edge')) return 'Edge';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  return 'Unknown browser';
};

import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { type Message } from '../types';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: NonNullable<Message['file']>) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const modalRoot = typeof document !== 'undefined' ? document.getElementById('modal-root') : null;

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setError(null);
    setIsStarting(true);

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera capture is not supported in this browser.');
      setIsStarting(false);
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsStarting(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError('Unable to access camera. Please allow camera permissions in your browser or Settings.');
          setIsStarting(false);
        }
      });

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const base64Data = dataUrl.split(',')[1];
    if (!base64Data) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    onCapture({
      name: `document-scan-${timestamp}.jpg`,
      type: 'image/jpeg',
      data: base64Data,
    });
    onClose();
  };

  if (!isOpen || !modalRoot) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Scan Legal Document
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full"
            aria-label="Close camera"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 bg-gray-950 flex items-center justify-center min-h-[260px]">
          {error ? (
            <p className="text-sm text-red-400 text-center px-4">{error}</p>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-h-[55vh] rounded object-contain bg-black"
            />
          )}
        </div>

        <div className="px-4 py-3 bg-gray-50 dark:bg-slate-800/80 border-t border-gray-200 dark:border-slate-700 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 rounded-lg transition-colors whitespace-nowrap"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCapture}
            disabled={isStarting || Boolean(error)}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap"
          >
            {isStarting ? 'Starting camera...' : 'Capture Photo'}
          </button>
        </div>
      </div>
    </div>,
    modalRoot
  );
};

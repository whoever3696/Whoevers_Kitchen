import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { processReceiptImage, preprocessImage, OCRProgress } from '../../utils/ocrProcessor';

interface ReceiptProcessingModalProps {
  imageFile: File;
  onComplete: (text: string, confidence: number) => void;
  onError: (error: string) => void;
  onClose: () => void;
}

export default function ReceiptProcessingModal({
  imageFile,
  onComplete,
  onError,
  onClose,
}: ReceiptProcessingModalProps) {
  const [progress, setProgress] = useState<OCRProgress>({ status: 'initializing', progress: 0 });
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);

    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  useEffect(() => {
    let cancelled = false;

    async function processImage() {
      try {
        setProgress({ status: 'preprocessing', progress: 10 });

        const processedImage = await preprocessImage(imageFile);

        if (cancelled) return;

        setProgress({ status: 'recognizing text', progress: 20 });

        const result = await processReceiptImage(processedImage, (p) => {
          if (!cancelled) {
            setProgress(p);
          }
        });

        if (cancelled) return;

        if (result.text.trim().length === 0) {
          onError('No text detected on receipt. Please try a clearer photo.');
          return;
        }

        onComplete(result.text, result.confidence);
      } catch (err) {
        if (!cancelled) {
          console.error('OCR processing error:', err);
          onError('Failed to process receipt. Please try again.');
        }
      }
    }

    processImage();

    return () => {
      cancelled = true;
    };
  }, [imageFile, onComplete, onError]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Processing Receipt</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {imagePreview && (
            <div className="mb-6 rounded-lg overflow-hidden border border-gray-200">
              <img
                src={imagePreview}
                alt="Receipt preview"
                className="w-full h-48 object-contain bg-gray-50"
              />
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 capitalize">{progress.status}</span>
              <span className="font-semibold text-gray-900">{progress.progress}%</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress.progress}%` }}
              />
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 pt-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>This may take a few moments...</span>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <p className="text-xs text-blue-800">
                The text recognition is happening directly in your browser. Your receipt image is
                never uploaded to any server.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

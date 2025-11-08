
import React, { useCallback, useState } from 'react';

interface ImageUploaderProps {
  onImageUpload: (base64: string) => void;
  disabled: boolean;
}

// Simple client-side check for a blank (all white or all black) image.
const isImageBlank = (imageData: ImageData): boolean => {
    const data = imageData.data;
    const firstPixel = [data[0], data[1], data[2]];
    for (let i = 0; i < data.length; i += 4) {
        if (data[i] !== firstPixel[0] || data[i + 1] !== firstPixel[1] || data[i + 2] !== firstPixel[2]) {
            // Found a different pixel, not blank
            return false;
        }
    }
    return true;
};

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      setError(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                setError('Could not process image.');
                return;
            }
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            if(isImageBlank(imageData)) {
                setError('Image appears to be blank. Please upload a valid UI screenshot.');
            } else {
                const base64 = (e.target?.result as string).split(',')[1];
                onImageUpload(base64);
            }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please upload a valid image file.');
    }
  }, [onImageUpload]);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [disabled, handleFile]);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);
  
  const baseClasses = "border-2 border-dashed rounded-lg p-8 text-center transition-colors";
  const disabledClasses = "bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed";
  const enabledClasses = isDragging 
    ? "bg-cyan-900 border-cyan-400" 
    : "bg-gray-700 border-gray-500 hover:border-cyan-500";

  return (
    <div>
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`${baseClasses} ${disabled ? disabledClasses : enabledClasses}`}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={onFileChange}
          accept="image/*"
          disabled={disabled}
        />
        <label htmlFor="file-upload" className={disabled ? 'cursor-not-allowed' : 'cursor-pointer'}>
          <p className="font-semibold">
            {isDragging ? 'Drop image here' : 'Drag & drop a screenshot or click to upload'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {disabled ? 'Connect to VS Code to enable upload' : 'Upload a UI screenshot or Figma design.'}
          </p>
        </label>
      </div>
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default ImageUploader;

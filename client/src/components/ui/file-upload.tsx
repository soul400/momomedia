import { useState, useRef } from 'react';
import { Upload, X, FileText, Image, PlaySquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in bytes
  onChange: (file: File | null) => void;
  value?: File | null;
  label?: string;
  className?: string;
  fileType?: 'any' | 'image' | 'video';
}

export function FileUpload({
  accept,
  maxSize = 50 * 1024 * 1024, // 50MB default
  onChange,
  value,
  label = 'اختر ملف أو اسحبه هنا',
  className = '',
  fileType = 'any',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Determine accept attribute based on fileType
  const getAccept = () => {
    if (accept) return accept;
    
    switch (fileType) {
      case 'image': return 'image/*';
      case 'video': return 'video/*';
      default: return 'image/*,video/*';
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize) {
      setError(`حجم الملف كبير جدًا. الحد الأقصى هو ${Math.round(maxSize / (1024 * 1024))} ميجابايت.`);
      return false;
    }
    
    // Validate file type
    if (fileType === 'image' && !file.type.startsWith('image/')) {
      setError('يرجى اختيار ملف صورة فقط.');
      return false;
    }
    
    if (fileType === 'video' && !file.type.startsWith('video/')) {
      setError('يرجى اختيار ملف فيديو فقط.');
      return false;
    }
    
    setError(null);
    return true;
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        simulateUploadProgress(() => {
          onChange(file);
        });
      }
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        simulateUploadProgress(() => {
          onChange(file);
        });
      } else {
        // Reset the input value if validation fails
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      }
    }
  };
  
  const simulateUploadProgress = (callback: () => void) => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 20;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(callback, 300);
          return 100;
        }
        return newProgress;
      });
    }, 200);
  };
  
  const handleButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };
  
  const handleRemoveFile = () => {
    onChange(null);
    setProgress(0);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };
  
  // Get file icon based on mime type
  const getFileIcon = () => {
    if (!value) return <Upload className="h-8 w-8 text-muted-foreground" />;
    
    if (value.type.startsWith('image/')) {
      return <Image className="h-8 w-8 text-primary" />;
    } else if (value.type.startsWith('video/')) {
      return <PlaySquare className="h-8 w-8 text-primary" />;
    } else {
      return <FileText className="h-8 w-8 text-primary" />;
    }
  };
  
  // Format file size to human readable
  const formatFileSize = (size: number): string => {
    if (size < 1024) {
      return `${size} بايت`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} كيلوبايت`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(1)} ميجابايت`;
    }
  };
  
  return (
    <div className={`w-full ${className}`}>
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 transition-colors
          ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}
          ${error ? 'border-destructive bg-destructive/5' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={inputRef}
          onChange={handleFileChange}
          accept={getAccept()}
          className="hidden"
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          {value ? (
            // File selected state
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {getFileIcon()}
                  <div className="ms-3 rtl">
                    <p className="text-sm font-medium truncate max-w-[200px]">{value.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(value.size)}</p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFile}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {progress < 100 && (
                <Progress value={progress} className="h-1 mb-2" />
              )}
            </div>
          ) : (
            // Empty state
            <>
              <div className="rounded-full p-3 bg-muted">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  أقصى حجم للملف: {Math.round(maxSize / (1024 * 1024))} ميجابايت
                </p>
              </div>
            </>
          )}
          
          {!value && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleButtonClick}
              className="mt-2"
            >
              اختر ملف
            </Button>
          )}
          
          {error && (
            <p className="text-sm text-destructive mt-2">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}

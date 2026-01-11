'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, File, X, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onUploadComplete: (fileKey: string, fileName: string, fileSize: number) => void;
  accept?: string;
  maxSize?: number; // in MB
}

export function FileUpload({ onUploadComplete, accept, maxSize = 100 }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file size
    const fileSizeMB = selectedFile.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setError(`El archivo no puede superar ${maxSize}MB`);
      return;
    }

    setFile(selectedFile);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError('');
    setProgress(0);

    try {
      // Step 1: Get presigned upload URL
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
        }),
      });

      if (!uploadResponse.ok) {
        const data = await uploadResponse.json() as { error?: string };
        throw new Error(data.error || 'Failed to get upload URL');
      }

      const { uploadUrl, fileKey } = await uploadResponse.json() as { uploadUrl: string; fileKey: string };

      // Step 2: Upload file to R2 using presigned URL
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          onUploadComplete(fileKey, file.name, file.size);
          setFile(null);
          setProgress(100);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } else {
          setError('Error al subir el archivo');
        }
        setUploading(false);
      });

      xhr.addEventListener('error', () => {
        setError('Error al subir el archivo');
        setUploading(false);
      });

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir el archivo');
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError('');
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file-upload">Archivo digital</Label>
        <Input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={uploading}
        />
        <p className="text-xs text-muted-foreground">
          Máximo {maxSize}MB. Formatos permitidos: PDF, ZIP, imágenes, videos, etc.
        </p>
      </div>

      {file && (
        <div className="flex items-center gap-2 rounded-md border p-3">
          <File className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
          {!uploading && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={clearFile}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="text-sm text-muted-foreground">
              Subiendo... {Math.round(progress)}%
            </p>
          </div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {file && !uploading && (
        <Button
          type="button"
          onClick={handleUpload}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          Subir archivo
        </Button>
      )}
    </div>
  );
}

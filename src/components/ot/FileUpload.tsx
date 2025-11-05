import { useState } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onUploadComplete: (urls: string[]) => void;
  onRemove: (index: number) => void;
  currentFiles?: string[];
  maxFiles?: number;
}

interface UploadedFile {
  name: string;
  url: string;
}

export function FileUpload({ 
  onUploadComplete, 
  onRemove, 
  currentFiles = [], 
  maxFiles = 5 
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Check total file count
    const totalFiles = currentFiles.length + files.length;
    if (totalFiles > maxFiles) {
      toast({
        title: 'Too many files',
        description: `Maximum ${maxFiles} files allowed. You can upload ${maxFiles - currentFiles.length} more file(s).`,
        variant: 'destructive',
      });
      return;
    }

    // Validate each file
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxSize = 3 * 1024 * 1024; // 3MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: `${file.name}: Only PDF, JPG, and PNG files are allowed`,
          variant: 'destructive',
        });
        return;
      }

      if (file.size > maxSize) {
        toast({
          title: 'File too large',
          description: `${file.name}: File size must be less than 3MB`,
          variant: 'destructive',
        });
        return;
      }
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const uploadedUrls: string[] = [];
      const uploadedFileData: UploadedFile[] = [];

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('ot-attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('ot-attachments')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
        uploadedFileData.push({ name: file.name, url: publicUrl });
      }

      const allUrls = [...currentFiles, ...uploadedUrls];
      setUploadedFiles([...uploadedFiles, ...uploadedFileData]);
      onUploadComplete(allUrls);

      toast({
        title: 'Success',
        description: `${files.length} file(s) uploaded successfully`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const handleRemove = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onRemove(index);
  };

  const getFileName = (url: string, index: number): string => {
    const uploadedFile = uploadedFiles.find(f => f.url === url);
    if (uploadedFile) return uploadedFile.name;
    
    // Try to extract filename from URL
    try {
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1];
      return decodeURIComponent(filename);
    } catch {
      return `Attachment ${index + 1}`;
    }
  };

  return (
    <div className="space-y-3">
      {/* Display uploaded files */}
      {currentFiles.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            {currentFiles.length}/{maxFiles} file(s) uploaded
          </div>
          {currentFiles.map((url, index) => (
            <div 
              key={index} 
              className="flex items-center gap-2 p-3 border border-border rounded-md bg-muted/50"
            >
              <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <span className="text-sm flex-1 truncate">
                {getFileName(url, index)}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(index)}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload area - only show if under max files */}
      {currentFiles.length < maxFiles && (
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            disabled={uploading}
            multiple
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {uploading ? 'Uploading...' : 'Click to upload attachments'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PDF, JPG, PNG (Max 3MB each)
            </p>
            <p className="text-xs text-muted-foreground">
              Maximum {maxFiles} files total
            </p>
          </label>
        </div>
      )}
    </div>
  );
}

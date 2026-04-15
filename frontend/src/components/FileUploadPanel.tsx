import { useRef, useState, DragEvent } from 'react';
import { Upload, X, FileText, Image, ExternalLink, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface Document { name: string; url: string; uploadedAt: string }

interface Props {
  entityId: string;
  images: string[];
  documents: Document[];
  onUpload: (id: string, formData: FormData) => Promise<unknown>;
  onDeleteFile: (id: string, fileUrl: string, type: 'image' | 'document') => Promise<unknown>;
  onRefresh: () => void;
}

export default function FileUploadPanel({ entityId, images, documents, onUpload, onDeleteFile, onRefresh }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append('files', f));
    try {
      await onUpload(entityId, formData);
      toast.success(`${files.length} file(s) uploaded!`);
      onRefresh();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Upload failed';
      toast.error(msg);
    }
    setUploading(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDelete = async (fileUrl: string, type: 'image' | 'document') => {
    setDeletingUrl(fileUrl);
    try {
      await onDeleteFile(entityId, fileUrl, type);
      toast.success('File removed');
      onRefresh();
    } catch { toast.error('Failed to remove file'); }
    setDeletingUrl(null);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={clsx(
          'border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all select-none',
          dragging
            ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
            : 'border-gray-300 dark:border-white/10 hover:border-cyan-400/60 hover:bg-cyan-500/5'
        )}
      >
        {uploading ? (
          <Loader2 size={28} className="text-cyan-400 animate-spin" />
        ) : (
          <Upload size={28} className={clsx('transition-colors', dragging ? 'text-cyan-400' : 'text-gray-400')} />
        )}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {uploading ? 'Uploading…' : 'Drop files here or click to browse'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
            Images (JPG, PNG, GIF, WebP, SVG) · PDFs · max 20 MB each
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Image Gallery */}
      {images.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Image size={12} /> Images ({images.length})
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {images.map((url) => (
              <div key={url} className="group relative rounded-lg overflow-hidden border border-gray-200 dark:border-white/10 aspect-video bg-gray-100 dark:bg-gray-800">
                <img src={url} alt="upload" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <a href={url} target="_blank" rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all"
                    onClick={(e) => e.stopPropagation()}>
                    <ExternalLink size={13} />
                  </a>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(url, 'image'); }}
                    disabled={deletingUrl === url}
                    className="p-1.5 rounded-lg bg-red-500/70 hover:bg-red-500 text-white transition-all disabled:opacity-50">
                    {deletingUrl === url ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document List */}
      {documents.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileText size={12} /> Documents ({documents.length})
          </p>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.url} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-800/40 group">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                  <FileText size={15} className="text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{doc.name}</p>
                  <p className="text-xs text-gray-400">{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Uploaded'}</p>
                </div>
                <a href={doc.url} target="_blank" rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all shrink-0">
                  <ExternalLink size={14} />
                </a>
                <button
                  onClick={() => handleDelete(doc.url, 'document')}
                  disabled={deletingUrl === doc.url}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0 disabled:opacity-50">
                  {deletingUrl === doc.url ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length === 0 && documents.length === 0 && (
        <p className="text-center text-xs text-gray-400 dark:text-gray-600 py-2">No files uploaded yet</p>
      )}
    </div>
  );
}

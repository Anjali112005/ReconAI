import React, { useRef, useState } from 'react';
import { UploadCloud, FileCheck, Trash2, FileSpreadsheet } from 'lucide-react';

export const UploadCard = ({ title, subtitle, icon: Icon, acceptedType = '.csv', file, onFileSelect, onFileRemove }) => {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border shadow-soft flex flex-col justify-between transition-colors">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-recon-light-soft dark:bg-recon-dark-cardHover flex items-center justify-center text-recon-forest dark:text-recon-dark-accent">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-recon-light-text dark:text-recon-dark-text tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-recon-light-muted dark:text-recon-dark-muted font-medium">
              {subtitle}
            </p>
          </div>
        </div>

        {file ? (
          /* File Uploaded Preview State */
          <div className="p-4 rounded-xl bg-recon-light-soft/70 dark:bg-recon-dark-cardHover/70 border border-recon-forest/20 dark:border-recon-dark-accent/30 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-recon-light-text dark:text-recon-dark-text truncate">
                  {file.name}
                </p>
                <p className="text-[10px] text-recon-light-muted dark:text-recon-dark-muted">
                  {(file.size / 1024).toFixed(1)} KB • CSV Format Verified
                </p>
              </div>
            </div>
            <button
              onClick={onFileRemove}
              className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
              title="Remove file"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Dropzone Upload UI */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-recon-forest dark:border-recon-dark-accent bg-recon-light-soft/50 dark:bg-recon-dark-cardHover/50'
                : 'border-recon-light-border dark:border-recon-dark-border hover:border-recon-forest/40 dark:hover:border-recon-dark-accent/40 bg-gray-50/50 dark:bg-recon-dark-bg/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedType}
              onChange={handleInputChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-recon-light-soft dark:bg-recon-dark-cardHover text-recon-forest dark:text-recon-dark-accent flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-xs font-extrabold text-recon-light-text dark:text-recon-dark-text">
              Click to browse or drag and drop
            </p>
            <p className="text-[11px] text-recon-light-muted dark:text-recon-dark-muted mt-1 font-medium">
              Supported file extensions: .CSV, .TXT (UTF-8 encoded)
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-recon-light-border/40 dark:border-recon-dark-border/40 flex items-center justify-between text-[11px] text-recon-light-muted dark:text-recon-dark-muted">
        <span className="flex items-center gap-1 font-medium">
          <FileSpreadsheet className="w-3.5 h-3.5" />
          Auto-schema detection enabled
        </span>
        <span className="font-semibold text-recon-forest dark:text-recon-dark-accent">
          Max file size: 50MB
        </span>
      </div>
    </div>
  );
};

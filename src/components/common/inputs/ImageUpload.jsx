import React, { useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { SelectButton } from 'primereact/selectbutton';
import apiService from '@/services/apiService.js';
import { useToast } from '@/contexts/ToastContext';

const MODES = [
  { label: 'Subir archivo', value: 'upload' },
  { label: 'URL externa', value: 'url' },
];

function looksLikeCloudinaryUrl(url) {
  if (!url) return false;
  return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
}

const ImageUpload = ({ value, onChange, label = 'Imagen', disabled = false }) => {
  const [mode, setMode] = useState(() => {
    if (!value) return 'upload';
    return looksLikeCloudinaryUrl(value) ? 'upload' : 'url';
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { showError, showSuccess } = useToast();

  const handleModeChange = (e) => {
    const newMode = e.value;
    if (!newMode) return;
    setMode(newMode);
    if (newMode === 'upload' && value && !looksLikeCloudinaryUrl(value)) {
      onChange('');
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('El archivo debe ser una imagen');
      return;
    }

    setUploading(true);
    const result = await apiService.uploadImage(file);
    setUploading(false);

    if (result.error) {
      showError(result.error);
      return;
    }

    showSuccess('Imagen subida correctamente');
    onChange(result.url);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div>
      <label className="block mb-2 font-medium">{label}</label>
      <div className="mb-2">
        <SelectButton
          value={mode}
          options={MODES}
          onChange={handleModeChange}
          disabled={disabled}
        />
      </div>

      {mode === 'upload' ? (
        <div className="flex align-items-center gap-2">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <Button
            type="button"
            icon={uploading ? 'pi pi-spin pi-spinner' : 'pi pi-upload'}
            label={uploading ? 'Subiendo...' : 'Subir imagen'}
            onClick={triggerFileInput}
            disabled={uploading || disabled}
            className="p-button-secondary"
          />
          {value && (
            <Button
              type="button"
              icon="pi pi-times"
              className="p-button-danger p-button-text"
              onClick={clearImage}
              tooltip="Quitar imagen"
              disabled={disabled}
            />
          )}
        </div>
      ) : (
        <div>
          <InputText
            value={value || ''}
            onChange={handleUrlChange}
            placeholder="https://..."
            className="w-full"
            disabled={disabled}
          />
        </div>
      )}

      {value && (
        <div className="mt-2">
          <img
            src={value}
            alt="Preview"
            style={{ maxWidth: '200px', maxHeight: '120px', objectFit: 'contain' }}
            className="border-round shadow-2"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

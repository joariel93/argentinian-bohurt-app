import React, { useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import apiService from '@/services/apiService.js';
import { useToast } from '@/contexts/ToastContext';

const ImageUpload = ({ value, onChange, label = 'Imagen' }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { showError, showSuccess } = useToast();

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

  return (
    <div>
      <label className="block mb-2 font-medium">{label}</label>
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
          disabled={uploading}
          className="p-button-secondary"
        />
        {value && (
          <Button
            type="button"
            icon="pi pi-times"
            className="p-button-danger p-button-text"
            onClick={clearImage}
            tooltip="Quitar imagen"
          />
        )}
      </div>
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

import { useState, useRef, useEffect } from 'react';
import {
  PhotoIcon,
  VideoCameraIcon,
  XMarkIcon,
  Bars3Icon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import { useMutation } from '@tanstack/react-query';
import { Modal } from '../ui/Modal';
import { uploadImage, uploadVideo } from '../../services/uploadService';
import type { CreateProductVariantMediaDto } from '../../types/models/productVariantMedia';
import { ImageType, MediaType } from '../../types/enums';
import apiClient from '../../services/apiClient';
import {
  getMediaUrl,
  getProductImageUrl,
  getVideoUrl,
} from '../../utils/cloudinaryHelpers';

interface MediaFile {
  id: string;
  file?: File;
  preview: string;
  isMain: boolean;
  timestamp: Date;
  displayOrder: number;
  uploadStatus: 'pending' | 'uploading' | 'success' | 'error';
  uploadedData?: CreateProductVariantMediaDto;
  errorMessage?: string;
}

interface VariantMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (files: CreateProductVariantMediaDto[]) => void;
  initialFiles?: CreateProductVariantMediaDto[];
}

const MAX_FILES = 9;

export const VariantMediaModal = ({
  isOpen,
  onClose,
  onSave,
  initialFiles = [],
}: VariantMediaModalProps) => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [error, setError] = useState<string>('');
  const [draggedMediaIndex, setDraggedMediaIndex] = useState<number | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete media mutation
  const deleteMutation = useMutation({
    mutationFn: async (publicId: string) => {
      await apiClient.delete(`/Upload/media/${encodeURIComponent(publicId)}`);
    },
  });

  // Upload mutations for image and video
  const uploadImageMutation = useMutation({
    mutationFn: async (params: { file: File; mediaId: string }) => {
      const result = await uploadImage(
        params.file,
        'products/variants',
        ImageType.Product,
      );
      return { result, mediaId: params.mediaId };
    },
  });

  const uploadVideoMutation = useMutation({
    mutationFn: async (params: { file: File; mediaId: string }) => {
      const result = await uploadVideo(params.file, 'products/variants');
      return { result, mediaId: params.mediaId };
    },
  });

  // Track mediaFiles in a ref for cleanup without adding to effect deps
  const mediaFilesRef = useRef<MediaFile[]>([]);
  mediaFilesRef.current = mediaFiles;

  // Convert CreateProductVariantMediaDto to MediaFile for display
  useEffect(() => {
    if (isOpen) {
      setError('');

      if (initialFiles.length > 0) {
        // Convert existing uploaded media to MediaFile format
        const existingMedia: MediaFile[] = initialFiles.map((dto) => {
          const preview = getMediaUrl(dto.mediaPublicId, dto.mediaType, 'card');

          return {
            id: `existing-${dto.mediaPublicId}`,
            preview,
            isMain: dto.isMain,
            timestamp: new Date(),
            displayOrder: dto.displayOrder,
            uploadStatus: 'success' as const,
            uploadedData: dto,
          };
        });
        setMediaFiles(existingMedia);
      } else {
        setMediaFiles([]);
      }
    } else {
      mediaFilesRef.current.forEach((media) => {
        if (media.file && media.preview) {
          URL.revokeObjectURL(media.preview);
        }
      });
    }
  }, [isOpen, initialFiles]);

  // Auto-upload when file is added
  const uploadFile = async (media: MediaFile) => {
    if (!media.file) return;

    const isVideo = media.file.type.startsWith('video/');

    // Mark as uploading
    setMediaFiles((prev) =>
      prev.map((m) =>
        m.id === media.id ? { ...m, uploadStatus: 'uploading' } : m,
      ),
    );

    try {
      const mutation = isVideo ? uploadVideoMutation : uploadImageMutation;
      const response = await mutation.mutateAsync({
        file: media.file,
        mediaId: media.id,
      });

      if (!response.result.data) {
        throw new Error('Upload failed: No data returned');
      }

      // Build DTO
      const dto: CreateProductVariantMediaDto = {
        mediaPublicId: response.result.data.publicId,
        fileName: response.result.data.fileName,
        fileExtension: response.result.data.fileExtension,
        fileSizeInBytes: response.result.data.fileSizeInBytes,
        displayOrder: media.displayOrder,
        isMain: media.isMain,
        mediaType: isVideo ? MediaType.Video : MediaType.Image,
      };

      // Mark as success
      setMediaFiles((prev) =>
        prev.map((m) =>
          m.id === media.id
            ? { ...m, uploadStatus: 'success', uploadedData: dto }
            : m,
        ),
      );
    } catch (err) {
      console.error('Upload failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';

      setMediaFiles((prev) =>
        prev.map((m) =>
          m.id === media.id ? { ...m, uploadStatus: 'error', errorMessage } : m,
        ),
      );
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFilesCount = files.length;
    const currentCount = mediaFiles.length;

    if (currentCount + newFilesCount > MAX_FILES) {
      setError(`You can only upload up to ${MAX_FILES} files`);
      return;
    }

    // Validate video count
    const currentVideoCount = mediaFiles.filter(
      (m) =>
        m.file?.type.startsWith('video/') ||
        m.uploadedData?.mediaType === MediaType.Video,
    ).length;
    const newVideoCount = Array.from(files).filter((f) =>
      f.type.startsWith('video/'),
    ).length;

    if (currentVideoCount + newVideoCount > 1) {
      setError('Maximum 1 video per variant');
      return;
    }

    setError('');

    const newMediaFiles: MediaFile[] = [];

    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) return;

      const preview = URL.createObjectURL(file);
      const mediaFile: MediaFile = {
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview,
        isMain: mediaFiles.length === 0 && newMediaFiles.length === 0,
        timestamp: new Date(),
        displayOrder: mediaFiles.length + newMediaFiles.length,
        uploadStatus: 'pending',
      };

      newMediaFiles.push(mediaFile);
    });

    setMediaFiles([...mediaFiles, ...newMediaFiles]);

    // Start uploading immediately
    newMediaFiles.forEach((media) => {
      uploadFile(media);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemoveFile = async (media: MediaFile) => {
    // If file was uploaded, delete from Cloudinary
    if (media.uploadedData?.mediaPublicId) {
      try {
        await deleteMutation.mutateAsync(media.uploadedData.mediaPublicId);
      } catch (err) {
        console.error('Failed to delete media from Cloudinary:', err);
        setError('Failed to delete media. Please try again.');
        return;
      }
    }

    if (media.file && media.preview) {
      URL.revokeObjectURL(media.preview);
    }

    const updatedFiles = mediaFiles.filter((f) => f.id !== media.id);

    // If removed file was main, set first file as main
    if (updatedFiles.length > 0) {
      const hadMain = updatedFiles.some((f) => f.isMain);
      if (!hadMain) {
        updatedFiles[0].isMain = true;
      }
    }

    setMediaFiles(updatedFiles);
  };

  const handleSetMain = (id: string) => {
    setMediaFiles(
      mediaFiles.map((f) => ({
        ...f,
        isMain: f.id === id,
      })),
    );
  };

  const handleMediaDragStart = (index: number) => {
    setDraggedMediaIndex(index);
  };

  const handleMediaDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleMediaDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedMediaIndex === null || draggedMediaIndex === targetIndex) return;

    const reordered = [...mediaFiles];
    const [draggedMedia] = reordered.splice(draggedMediaIndex, 1);
    reordered.splice(targetIndex, 0, draggedMedia);

    // Update displayOrder for all items
    const updatedWithOrder = reordered.map((media, index) => ({
      ...media,
      displayOrder: index,
    }));

    setMediaFiles(updatedWithOrder);
    setDraggedMediaIndex(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDone = () => {
    // Check if all uploads are complete
    const pendingOrUploading = mediaFiles.filter(
      (m) => m.uploadStatus === 'pending' || m.uploadStatus === 'uploading',
    );

    if (pendingOrUploading.length > 0) {
      setError('Please wait for all uploads to complete');
      return;
    }

    // Check for failed uploads
    const failedUploads = mediaFiles.filter((m) => m.uploadStatus === 'error');
    if (failedUploads.length > 0) {
      setError('Please remove failed uploads before saving');
      return;
    }

    // Get successfully uploaded media
    const uploadedMedia = mediaFiles
      .filter((m) => m.uploadStatus === 'success' && m.uploadedData)
      .map((m) => ({
        ...m.uploadedData!,
        displayOrder: m.displayOrder,
        isMain: m.isMain,
      }));

    onSave(uploadedMedia);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const isUploading = mediaFiles.some(
    (m) => m.uploadStatus === 'uploading' || m.uploadStatus === 'pending',
  );
  const canSave =
    mediaFiles.length === 0 ||
    mediaFiles.every((m) => m.uploadStatus === 'success');

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      onDone={handleDone}
      title='Upload media'
      doneLabel='Done'
      doneDisabled={!canSave}
    >
      <div className='space-y-6'>
        {/* Upload Area */}
        <div>
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed border-neutral-300 rounded-lg p-12 text-center hover:border-neutral-400 hover:bg-neutral-50 transition-colors ${
              isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <div className='flex flex-col items-center gap-3'>
              <div className='flex items-center gap-2'>
                <PhotoIcon className='w-10 h-10 text-neutral-400' />
                <VideoCameraIcon className='w-10 h-10 text-neutral-400' />
              </div>
              <div>
                <p className='text-sm font-medium text-neutral-700'>
                  Drag and drop images or videos here
                </p>
                <p className='text-xs text-neutral-500 mt-1'>
                  or click to upload
                </p>
              </div>
              <p className='text-xs text-neutral-400 mt-2'>
                Maximum {MAX_FILES} files • Max 1 video
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type='file'
            multiple
            accept='image/*,video/*'
            onChange={(e) => handleFileSelect(e.target.files)}
            className='hidden'
            disabled={isUploading}
          />

          {error && (
            <p className='mt-2 text-sm text-red-600 text-center'>{error}</p>
          )}
        </div>

        {/* Media List */}
        {mediaFiles.length > 0 && (
          <div className='border border-neutral-200 rounded-lg overflow-hidden'>
            <div className='divide-y divide-neutral-100'>
              {mediaFiles.map((media, index) => {
                const isVideo =
                  media.file?.type.startsWith('video/') ||
                  media.uploadedData?.mediaType === MediaType.Video;
                const extension =
                  media.file?.name.split('.').pop() ||
                  media.uploadedData?.fileExtension ||
                  '';
                const fileSize =
                  media.file?.size || media.uploadedData?.fileSizeInBytes || 0;

                return (
                  <div
                    key={media.id}
                    draggable={media.uploadStatus === 'success'}
                    onDragStart={() => handleMediaDragStart(index)}
                    onDragOver={handleMediaDragOver}
                    onDrop={(e) => handleMediaDrop(e, index)}
                    className={`flex items-center gap-4 p-3 hover:bg-neutral-50 transition-colors ${
                      media.uploadStatus === 'success' ? 'cursor-move' : ''
                    }`}
                  >
                    {/* Drag Handle */}
                    <Bars3Icon className='w-4 h-4 text-neutral-400 shrink-0' />

                    {/* Status Icon */}
                    <div className='shrink-0 w-5 h-5'>
                      {media.uploadStatus === 'uploading' && (
                        <div className='w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin' />
                      )}
                      {media.uploadStatus === 'success' && (
                        <CheckCircleIcon className='w-5 h-5 text-green-600' />
                      )}
                      {media.uploadStatus === 'error' && (
                        <ExclamationCircleIcon className='w-5 h-5 text-red-600' />
                      )}
                    </div>

                    {/* Thumbnail */}
                    <div className='w-16 h-16 rounded-md overflow-hidden bg-neutral-100 shrink-0 flex items-center justify-center relative'>
                      {isVideo ? (
                        <>
                          <img
                            src={media.preview}
                            alt={media.file?.name || 'video thumbnail'}
                            className='w-full h-full object-contain'
                          />
                          {media.uploadStatus === 'success' &&
                            media.uploadedData?.mediaPublicId && (
                              <button
                                type='button'
                                onClick={() => {
                                  const videoUrl = getVideoUrl(
                                    media.uploadedData!.mediaPublicId,
                                  );
                                  window.open(videoUrl, '_blank');
                                }}
                                className='cursor-pointer absolute inset-0 bg-black/40 hover:bg-black/60 transition-colors flex items-center justify-center group'
                                title='Play video'
                              >
                                <PlayIcon className='w-8 h-8 text-white group-hover:scale-110 transition-transform' />
                              </button>
                            )}
                        </>
                      ) : (
                        <img
                          src={media.preview}
                          alt={media.file?.name || 'media'}
                          className='cursor-pointer w-full h-full object-contain'
                          onClick={() => {
                            const imgUrl = getProductImageUrl(
                              media.uploadedData!.mediaPublicId,
                            );
                            window.open(imgUrl, '_blank');
                          }}
                        />
                      )}
                    </div>

                    {/* File Info */}
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-neutral-900 truncate'>
                        {media.file?.name ||
                          media.uploadedData?.fileName ||
                          'Unknown'}
                      </p>
                      <div className='flex items-center gap-3 mt-1'>
                        <span className='text-xs text-neutral-500 uppercase'>
                          {extension}
                        </span>
                        <span className='text-xs text-neutral-500'>
                          {formatFileSize(fileSize)}
                        </span>
                        {media.uploadStatus === 'uploading' && (
                          <span className='text-xs text-primary-600 font-medium'>
                            Uploading...
                          </span>
                        )}
                        {media.uploadStatus === 'error' && (
                          <span className='text-xs text-red-600 font-medium'>
                            {media.errorMessage || 'Upload failed'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Main Toggle */}
                    {media.uploadStatus === 'success' && (
                      <div className='flex items-center gap-2 shrink-0'>
                        <label className='flex items-center gap-2 cursor-pointer'>
                          <span className='text-xs text-neutral-600'>Main</span>
                          <div className='relative'>
                            <input
                              type='checkbox'
                              checked={media.isMain}
                              onChange={() => handleSetMain(media.id)}
                              className='sr-only peer'
                            />
                            <div className='w-9 h-5 bg-neutral-200 rounded-full peer peer-checked:bg-primary-600 transition-colors'></div>
                            <div className='absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4'></div>
                          </div>
                        </label>
                      </div>
                    )}

                    {/* Remove Button */}
                    <button
                      type='button'
                      onClick={() => handleRemoveFile(media)}
                      disabled={
                        media.uploadStatus === 'uploading' ||
                        deleteMutation.isPending
                      }
                      className='cursor-pointer p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      <XMarkIcon className='w-5 h-5' />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

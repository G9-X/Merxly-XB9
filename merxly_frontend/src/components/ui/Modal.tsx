import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from './button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDone?: () => void;
  title: string;
  children: React.ReactNode;
  doneLabel?: string;
  cancelLabel?: string;
  doneDisabled?: boolean;
}

export const Modal = ({
  isOpen,
  onClose,
  onDone,
  title,
  children,
  doneLabel = 'Done',
  cancelLabel = 'Cancel',
  doneDisabled = false,
}: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      {/* Overlay */}
      <div className='fixed inset-0 bg-black/50 transition-opacity' />

      {/* Modal Container */}
      <div
        className='relative min-h-screen flex items-center justify-center p-4'
        onClick={onClose}
      >
        <div
          className='relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col'
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className='flex items-center justify-between px-6 py-4 border-b border-neutral-200'>
            <h2 className='text-lg font-semibold text-neutral-900'>{title}</h2>
            <button
              type='button'
              onClick={onClose}
              className='cursor-pointer p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors'
            >
              <XMarkIcon className='w-5 h-5' />
            </button>
          </div>

          {/* Body */}
          <div className='flex-1 modal-scrollbar-hide px-6 py-4'>
            {children}
          </div>

          {/* Footer */}
          <div className='flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200'>
            <Button variant='outline' onClick={onClose}>
              {cancelLabel}
            </Button>
            <Button
              variant='primary'
              onClick={onDone || onClose}
              disabled={doneDisabled}
            >
              {doneLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

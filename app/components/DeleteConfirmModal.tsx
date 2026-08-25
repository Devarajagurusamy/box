'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden text-zinc-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-950/60 text-red-400 border border-red-800/60">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">{message}</p>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

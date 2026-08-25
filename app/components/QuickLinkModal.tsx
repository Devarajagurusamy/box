'use client';

import React, { useState, useEffect } from 'react';
import { X, Globe } from 'lucide-react';
import { QuickToolLink } from '../types';

interface QuickLinkModalProps {
  isOpen: boolean;
  linkToEdit: QuickToolLink | null;
  onClose: () => void;
  onSave: (link: QuickToolLink) => void;
}

export const QuickLinkModal: React.FC<QuickLinkModalProps> = ({
  isOpen,
  linkToEdit,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (linkToEdit) {
      setName(linkToEdit.name);
      setUrl(linkToEdit.url);
    } else {
      setName('');
      setUrl('');
    }
    setError('');
  }, [linkToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!url.trim()) {
      setError('URL is required.');
      return;
    }

    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const savedLink: QuickToolLink = {
      id: linkToEdit ? linkToEdit.id : `tool-${Date.now()}`,
      name: name.trim(),
      url: formattedUrl,
      iconName: 'Globe',
      category: 'General',
      description: '',
    };

    onSave(savedLink);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden text-zinc-100 p-5 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-800 text-zinc-200">
              <Globe className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-white">
              {linkToEdit ? 'Edit Web Link' : 'Add Web Link'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && (
            <div className="p-2.5 text-xs text-red-300 bg-red-950/60 border border-red-800/60 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-1">
              Link Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. ChatGPT, Perplexity, Docs"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-xs focus:outline-none focus:border-zinc-400"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-1">
              URL
            </label>
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-xs focus:outline-none focus:border-zinc-400"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-medium text-zinc-950 bg-zinc-100 hover:bg-white rounded-lg transition"
            >
              {linkToEdit ? 'Save Link' : 'Add Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

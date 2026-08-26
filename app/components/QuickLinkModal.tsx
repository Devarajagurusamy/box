'use client';

import React, { useState, useEffect } from 'react';
import { X, Globe, Globe2, Lock } from 'lucide-react';
import { QuickToolLink, VaultSpace } from '../types';

interface QuickLinkModalProps {
  isOpen: boolean;
  linkToEdit: QuickToolLink | null;
  activeSpace?: VaultSpace;
  isSignedIn?: boolean;
  onClose: () => void;
  onSave: (link: QuickToolLink) => void;
}

export const QuickLinkModal: React.FC<QuickLinkModalProps> = ({
  isOpen,
  linkToEdit,
  activeSpace = 'public',
  isSignedIn = false,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (linkToEdit) {
      setName(linkToEdit.name);
      setUrl(linkToEdit.url);
      setIsPublic(linkToEdit.isPublic !== false);
    } else {
      setName('');
      setUrl('');
      setIsPublic(activeSpace === 'public');
    }
    setError('');
  }, [linkToEdit, isOpen, activeSpace]);

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
      isPublic,
      authorName: 'Community',
    };

    onSave(savedLink);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden text-zinc-100 p-5 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-800 text-zinc-200">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-white">
                {linkToEdit ? 'Edit Web Link' : 'Add Web Link'}
              </h3>
              <p className="text-[11px] text-zinc-400">
                {isPublic ? 'Publicly accessible link' : 'Private link in Personal Space'}
              </p>
            </div>
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

          {/* Visibility toggle */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              Destination
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-medium transition ${
                  isPublic
                    ? 'bg-blue-950/40 border-blue-600 text-blue-200 shadow-xs'
                    : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Globe2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Public Vault</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-medium transition ${
                  !isPublic
                    ? 'bg-amber-950/40 border-amber-600 text-amber-200 shadow-xs'
                    : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Personal Space</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-1">
              Link Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. ChatGPT, Perplexity, Cursor Docs"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-xs focus:outline-none focus:border-zinc-400"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-1">
              URL <span className="text-rose-400">*</span>
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
              {linkToEdit ? 'Save Link' : isPublic ? 'Add Public Link' : 'Add to Personal Space'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

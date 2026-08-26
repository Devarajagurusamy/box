'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Tag,
  Globe,
  Code,
  Info,
  FolderPlus,
  Globe2,
  Lock,
  User
} from 'lucide-react';
import { Prompt, Category, PromptLink, VaultSpace } from '../types';
import { CategoryIcon } from './CategoryIcon';

interface PromptModalProps {
  isOpen: boolean;
  promptToEdit: Prompt | null;
  categories: Category[];
  initialCategoryId?: string | null;
  activeSpace?: VaultSpace;
  isSignedIn?: boolean;
  onClose: () => void;
  onSave: (prompt: Prompt) => void;
  onOpenCreateCategory: () => void;
}

export const PromptModal: React.FC<PromptModalProps> = ({
  isOpen,
  promptToEdit,
  categories,
  initialCategoryId,
  activeSpace = 'public',
  isSignedIn = false,
  onClose,
  onSave,
  onOpenCreateCategory,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [authorName, setAuthorName] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [links, setLinks] = useState<PromptLink[]>([]);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [error, setError] = useState('');

  const detectedVariables = Array.from(
    new Set((content.match(/\{\{([a-zA-Z0-9_-]+)\}\}/g) || []).map((v) => v.replace(/[{}]/g, '')))
  );

  useEffect(() => {
    if (promptToEdit) {
      setTitle(promptToEdit.title);
      setDescription(promptToEdit.description || '');
      setContent(promptToEdit.content);
      setCategoryId(promptToEdit.categoryId);
      setIsPublic(promptToEdit.isPublic !== false);
      setAuthorName(promptToEdit.authorName || '');
      setTags(promptToEdit.tags || []);
      setLinks(promptToEdit.links || []);
    } else {
      setTitle('');
      setDescription('');
      setContent('');
      setCategoryId(initialCategoryId || (categories[0]?.id ?? ''));
      setIsPublic(activeSpace === 'public');
      setAuthorName('');
      setTags([]);
      setLinks([]);
    }
    setTagInput('');
    setNewLinkTitle('');
    setNewLinkUrl('');
    setError('');
  }, [promptToEdit, isOpen, initialCategoryId, categories, activeSpace]);

  if (!isOpen) return null;

  const handleAddTag = (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e && 'key' in e && e.key !== 'Enter' && e.key !== ',') return;
    if (e && 'preventDefault' in e) e.preventDefault();

    const clean = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddLink = () => {
    if (!newLinkUrl.trim()) return;
    let formattedUrl = newLinkUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const title = newLinkTitle.trim() || new URL(formattedUrl).hostname.replace('www.', '');
    setLinks([
      ...links,
      {
        id: `link-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title,
        url: formattedUrl,
      },
    ]);
    setNewLinkTitle('');
    setNewLinkUrl('');
  };

  const handleRemoveLink = (id: string) => {
    setLinks(links.filter((l) => l.id !== id));
  };

  const handleInsertVariable = (varName: string) => {
    setContent((prev) => `${prev} {{${varName}}}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Prompt title is required.');
      return;
    }
    if (!content.trim()) {
      setError('Prompt content is required.');
      return;
    }

    const savedPrompt: Prompt = {
      id: promptToEdit ? promptToEdit.id : `prompt-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      content: content.trim(),
      categoryId: categoryId || (categories[0]?.id ?? 'general'),
      tags,
      links,
      isPublic,
      authorName: authorName.trim() || 'Community',
      isFavorite: promptToEdit ? promptToEdit.isFavorite : false,
      copyCount: promptToEdit ? promptToEdit.copyCount : 0,
      createdAt: promptToEdit ? promptToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(savedPrompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl my-auto bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden text-zinc-100 max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-zinc-800 bg-zinc-900 sticky top-0 z-10">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-white">
              {promptToEdit ? 'Edit Prompt' : 'Create New Prompt'}
            </h2>
            <p className="text-[11px] text-zinc-400">
              {isPublic ? 'Publishing to Public Community Vault' : 'Saving to Personal Space'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1 custom-scrollbar">
          {error && (
            <div className="p-2.5 text-xs text-red-300 bg-red-950/60 border border-red-800/60 rounded-lg flex items-center gap-2">
              <Info className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Visibility Switcher (Public vs Personal) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider">
              Visibility & Destination
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition ${
                  isPublic
                    ? 'bg-blue-950/40 border-blue-600 text-blue-200 shadow-xs'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <Globe2 className="w-4 h-4 text-blue-400" />
                <div className="text-left">
                  <div className="font-semibold text-white">Public Vault</div>
                  <div className="text-[10px] text-zinc-400">Open to everyone, no login needed</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition ${
                  !isPublic
                    ? 'bg-amber-950/40 border-amber-600 text-amber-200 shadow-xs'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <Lock className="w-4 h-4 text-amber-400" />
                <div className="text-left">
                  <div className="font-semibold text-white">Personal Space</div>
                  <div className="text-[10px] text-zinc-400">
                    {isSignedIn ? 'Only visible to you' : 'Requires sign in'}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Title & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-1">
                Prompt Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Next.js 15 Fullstack Architecture Generator"
                className="w-full px-3 py-2 bg-zinc-800/80 border border-zinc-700 focus:border-zinc-500 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-1">
                Author / Handle
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Alex (or Community)"
                className="w-full px-3 py-2 bg-zinc-800/80 border border-zinc-700 focus:border-zinc-500 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider">
                Category
              </label>
              <button
                type="button"
                onClick={onOpenCreateCategory}
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>New Category</span>
              </button>
            </div>
            {categories.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {categories.map((cat) => {
                  const isSelected = categoryId === cat.id;
                  const colorClass = cat.color?.startsWith('bg-') ? cat.color : 'bg-zinc-700';

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition ${
                        isSelected
                          ? 'bg-zinc-800 border-zinc-500 text-white ring-1 ring-zinc-500'
                          : 'bg-zinc-800/40 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      <div className={`p-1 rounded ${colorClass} text-white shrink-0`}>
                        <CategoryIcon name={cat.icon} className="w-3 h-3" />
                      </div>
                      <span className="truncate font-medium">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 bg-zinc-800/30 border border-zinc-800 rounded-lg text-xs text-zinc-400 flex items-center justify-between">
                <span>No categories created yet.</span>
                <button
                  type="button"
                  onClick={onOpenCreateCategory}
                  className="text-xs text-white hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Category</span>
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief summary of what this prompt produces..."
              className="w-full px-3 py-2 bg-zinc-800/80 border border-zinc-700 focus:border-zinc-500 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none transition"
            />
          </div>

          {/* Prompt Content */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider">
                Prompt Content / Template <span className="text-rose-400">*</span>
              </label>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="font-mono text-[11px]">{content.length} chars</span>
              </div>
            </div>

            <textarea
              required
              rows={7}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your prompt text here... Use {{variable_name}} for dynamic inputs like {{language}} or {{framework}}"
              className="w-full p-3 bg-zinc-950 border border-zinc-700 focus:border-zinc-500 rounded-lg font-mono text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none transition resize-none leading-relaxed"
            />

            {/* Variable tags helper */}
            <div className="mt-1.5 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                <Code className="w-3 h-3 text-zinc-400" />
                <span>Tip: Insert dynamic variables with</span>
                <code className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono text-[10px]">
                  {'{{variable}}'}
                </code>
              </div>

              {detectedVariables.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[11px] text-zinc-500">Detected:</span>
                  {detectedVariables.map((v) => (
                    <span
                      key={v}
                      className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[10px]"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Attached Website Links */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-zinc-400" />
              <span>Attached Links / Resources</span>
            </label>

            {/* Existing links */}
            {links.length > 0 && (
              <div className="space-y-1.5 mb-2.5">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/60 border border-zinc-700/60 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-medium text-white truncate">{link.title}</span>
                      <span className="text-zinc-500 text-[11px] truncate">({link.url})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(link.id)}
                      className="text-zinc-400 hover:text-red-400 p-1 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new link form */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newLinkTitle}
                onChange={(e) => setNewLinkTitle(e.target.value)}
                placeholder="Link Title (e.g. Official Docs)"
                className="flex-1 px-3 py-1.5 bg-zinc-800/80 border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
              />
              <input
                type="text"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                placeholder="URL (e.g. https://nextjs.org)"
                className="flex-1 px-3 py-1.5 bg-zinc-800/80 border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
              />
              <button
                type="button"
                onClick={handleAddLink}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs font-medium text-zinc-200 transition shrink-0 flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Attach</span>
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-zinc-400" />
              <span>Tags</span>
            </label>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 text-zinc-200 border border-zinc-700"
                  >
                    <span>#{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="text-zinc-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type tag and press Enter (e.g. coding, nextjs, marketing)"
                className="flex-1 px-3 py-1.5 bg-zinc-800/80 border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
              />
              <button
                type="button"
                onClick={() => handleAddTag()}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs font-medium text-zinc-200 transition shrink-0"
              >
                Add Tag
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-zinc-800 bg-zinc-900 sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 text-xs font-semibold text-zinc-950 bg-zinc-100 hover:bg-white active:scale-95 rounded-lg transition shadow-sm"
          >
            {promptToEdit ? 'Save Changes' : isPublic ? 'Publish Public Prompt' : 'Save to Personal Space'}
          </button>
        </div>
      </div>
    </div>
  );
};

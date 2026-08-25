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
  FolderPlus
} from 'lucide-react';
import { Prompt, Category, AIModelType, PromptLink } from '../types';
import { CategoryIcon } from './CategoryIcon';

const AI_MODELS: AIModelType[] = [
  'General',
  'ChatGPT',
  'Claude',
  'Gemini',
  'DeepSeek',
  'Midjourney',
  'Cursor'
];

interface PromptModalProps {
  isOpen: boolean;
  promptToEdit: Prompt | null;
  categories: Category[];
  initialCategoryId?: string | null;
  onClose: () => void;
  onSave: (prompt: Prompt) => void;
  onOpenCreateCategory: () => void;
}

export const PromptModal: React.FC<PromptModalProps> = ({
  isOpen,
  promptToEdit,
  categories,
  initialCategoryId,
  onClose,
  onSave,
  onOpenCreateCategory,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [model, setModel] = useState<AIModelType>('General');
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
      setModel(promptToEdit.model || 'General');
      setTags(promptToEdit.tags || []);
      setLinks(promptToEdit.links || []);
    } else {
      setTitle('');
      setDescription('');
      setContent('');
      setCategoryId(initialCategoryId || (categories[0]?.id ?? ''));
      setModel('General');
      setTags([]);
      setLinks([]);
    }
    setTagInput('');
    setNewLinkTitle('');
    setNewLinkUrl('');
    setError('');
  }, [promptToEdit, isOpen, initialCategoryId, categories]);

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
    if (!categoryId && categories.length > 0) {
      setError('Please select a category.');
      return;
    }

    const savedPrompt: Prompt = {
      id: promptToEdit ? promptToEdit.id : `prompt-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      content: content.trim(),
      categoryId: categoryId || 'general',
      model,
      tags,
      links,
      isFavorite: promptToEdit ? promptToEdit.isFavorite : false,
      copyCount: promptToEdit ? promptToEdit.copyCount : 0,
      createdAt: promptToEdit ? promptToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(savedPrompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden text-zinc-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900 sticky top-0 z-10">
          <div>
            <h2 className="text-base font-semibold text-white">
              {promptToEdit ? 'Edit Prompt' : 'Create New Prompt'}
            </h2>
            <p className="text-xs text-zinc-400">Configure prompt content, dynamic variables, and attached links</p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {error && (
            <div className="p-3 text-xs text-red-300 bg-red-950/60 border border-red-800/60 rounded-lg flex items-center gap-2">
              <Info className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title & AI Model */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-1.5">
                Prompt Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Software Architect Code Reviewer"
                className="w-full px-3.5 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition text-sm"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-1.5">
                Target Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value as AIModelType)}
                className="w-full px-3.5 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-400 transition text-sm cursor-pointer"
              >
                {AI_MODELS.map((m) => (
                  <option key={m} value={m} className="bg-zinc-900 text-white">
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider">
                Category
              </label>
              <button
                type="button"
                onClick={onOpenCreateCategory}
                className="text-xs text-zinc-400 hover:text-white font-medium flex items-center gap-1 transition"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>+ Create Category</span>
              </button>
            </div>

            {categories.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.map((cat) => {
                  const isSelected = categoryId === cat.id;
                  const colorClass = cat.color?.startsWith('bg-') ? cat.color : 'bg-zinc-700';

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-xs transition ${
                        isSelected
                          ? 'bg-zinc-800 border-zinc-400 text-white'
                          : 'bg-zinc-800/40 border-zinc-700 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800'
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
              <div className="p-3 rounded-lg bg-zinc-800/40 border border-zinc-700 flex items-center justify-between">
                <span className="text-xs text-zinc-400">No categories created yet.</span>
                <button
                  type="button"
                  onClick={onOpenCreateCategory}
                  className="px-3 py-1 text-xs font-medium bg-zinc-700 hover:bg-zinc-600 text-white rounded-md transition"
                >
                  Create First Category
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the prompt use case..."
              className="w-full px-3.5 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition text-sm"
            />
          </div>

          {/* Prompt Content */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider">
                Prompt Content
              </label>
              <span className="text-[11px] text-zinc-400">
                Use <code className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-300 font-mono">{"{{variable}}"}</code> for placeholders
              </span>
            </div>

            <textarea
              rows={8}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your prompt instructions. Use {{variable_name}} for dynamic inputs..."
              className="w-full px-3.5 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 font-mono text-sm leading-relaxed transition resize-y"
            />

            {/* Variable Pills */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs text-zinc-400 flex items-center gap-1">
                <Code className="w-3.5 h-3.5 text-zinc-400" />
                {detectedVariables.length > 0 ? 'Detected variables:' : 'Insert placeholder:'}
              </span>
              {detectedVariables.length > 0 ? (
                detectedVariables.map((v) => (
                  <span
                    key={v}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-zinc-800 text-zinc-200 border border-zinc-700"
                  >
                    {`{{${v}}}`}
                  </span>
                ))
              ) : (
                ['topic', 'audience', 'language', 'context', 'tone'].map((quickVar) => (
                  <button
                    key={quickVar}
                    type="button"
                    onClick={() => handleInsertVariable(quickVar)}
                    className="text-xs px-2 py-0.5 rounded font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition"
                  >
                    + {`{{${quickVar}}}`}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Website Links Section */}
          <div className="p-3.5 rounded-lg bg-zinc-800/40 border border-zinc-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 uppercase tracking-wider">
                <Globe className="w-3.5 h-3.5 text-zinc-400" />
                Attached Website Links
              </label>
              <span className="text-[11px] text-zinc-400">
                Documentation, source URLs, or tool links
              </span>
            </div>

            {/* Existing Links */}
            {links.length > 0 && (
              <div className="space-y-1.5">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between gap-3 p-2 rounded-lg bg-zinc-900 border border-zinc-700/60 text-xs"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="font-semibold text-zinc-200">{link.title}:</span>
                      <span className="text-zinc-400 truncate">{link.url}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(link.id)}
                      className="text-zinc-400 hover:text-red-400 p-1 transition"
                      title="Remove link"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Link */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                value={newLinkTitle}
                onChange={(e) => setNewLinkTitle(e.target.value)}
                placeholder="Link Title (e.g. Claude Chat)"
                className="w-full sm:w-1/3 px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-400"
              />
              <input
                type="text"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                placeholder="URL (e.g. https://claude.ai)"
                className="w-full sm:flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-400"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddLink();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddLink}
                className="w-full sm:w-auto px-3 py-1.5 text-xs font-medium text-white bg-zinc-700 hover:bg-zinc-600 rounded-lg transition flex items-center justify-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Link
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 uppercase tracking-wider mb-1.5">
              <Tag className="w-3.5 h-3.5 text-zinc-400" />
              Tags
            </label>
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-zinc-800 border border-zinc-700 rounded-lg">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-zinc-900 text-zinc-200 border border-zinc-700"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-zinc-500 hover:text-zinc-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={tags.length === 0 ? "Type tag and press Enter" : "Add tag..."}
                className="flex-1 min-w-[120px] bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none px-1"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800 sticky bottom-0 bg-zinc-900 py-2">
            <div className="text-xs text-zinc-500 font-mono">
              {content.length} chars • {content.trim().split(/\s+/).filter(Boolean).length} words
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-medium text-zinc-950 bg-zinc-100 hover:bg-white rounded-lg transition"
              >
                {promptToEdit ? 'Save Changes' : 'Create Prompt'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

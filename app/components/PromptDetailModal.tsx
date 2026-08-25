'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Globe,
  ExternalLink,
  Sliders,
  Heart,
  Edit3
} from 'lucide-react';
import { Prompt, Category } from '../types';
import { CategoryIcon } from './CategoryIcon';

interface PromptDetailModalProps {
  isOpen: boolean;
  prompt: Prompt | null;
  category?: Category;
  onClose: () => void;
  onCopy: (text: string, title: string) => void;
  onEdit: (prompt: Prompt) => void;
  onToggleFavorite: (id: string) => void;
}

export const PromptDetailModal: React.FC<PromptDetailModalProps> = ({
  isOpen,
  prompt,
  category,
  onClose,
  onCopy,
  onEdit,
  onToggleFavorite,
}) => {
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const detectedVariables = Array.from(
    new Set((prompt?.content.match(/\{\{([a-zA-Z0-9_-]+)\}\}/g) || []).map((v) => v.replace(/[{}]/g, '')))
  );

  useEffect(() => {
    if (prompt) {
      const initialVars: Record<string, string> = {};
      detectedVariables.forEach((v) => {
        initialVars[v] = '';
      });
      setVariableValues(initialVars);
      setCopied(false);
    }
  }, [prompt]);

  if (!isOpen || !prompt) return null;

  let interpolatedContent = prompt.content;
  detectedVariables.forEach((v) => {
    const val = variableValues[v] || `{{${v}}}`;
    interpolatedContent = interpolatedContent.split(`{{${v}}}`).join(val);
  });

  const handleCopyClick = () => {
    onCopy(interpolatedContent, prompt.title);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchWithCopy = (url: string) => {
    onCopy(interpolatedContent, prompt.title);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const categoryColor = category?.color?.startsWith('bg-') ? category.color : 'bg-zinc-700';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden text-zinc-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${categoryColor} text-white shrink-0`}>
              <CategoryIcon name={category?.icon || 'Folder'} className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  {category?.name || 'General'}
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  {prompt.model}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">{prompt.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(prompt.id)}
              className={`p-2 rounded-lg border transition ${
                prompt.isFavorite
                  ? 'bg-red-950/40 text-red-400 border-red-800/60'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-red-400'
              }`}
              title={prompt.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-4 h-4 ${prompt.isFavorite ? 'fill-red-400' : ''}`} />
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(prompt);
              }}
              className="p-2 bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 rounded-lg hover:bg-zinc-700 transition"
              title="Edit Prompt"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* Description */}
          {prompt.description && (
            <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-800/50 p-3 rounded-lg border border-zinc-800">
              {prompt.description}
            </p>
          )}

          {/* Dynamic Variable Playground */}
          {detectedVariables.length > 0 && (
            <div className="p-4 rounded-lg bg-zinc-800/40 border border-zinc-700/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                <Sliders className="w-3.5 h-3.5 text-zinc-400" />
                Variable Inputs ({detectedVariables.length})
              </div>
              <p className="text-xs text-zinc-400">
                Enter values below to customize the prompt text in real time.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {detectedVariables.map((v) => (
                  <div key={v}>
                    <label className="block text-xs font-mono font-medium text-zinc-300 mb-1">
                      {`{{${v}}}`}
                    </label>
                    <input
                      type="text"
                      value={variableValues[v] || ''}
                      onChange={(e) =>
                        setVariableValues({ ...variableValues, [v]: e.target.value })
                      }
                      placeholder={`Enter ${v}...`}
                      className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prompt Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                {detectedVariables.length > 0 ? 'Interpolated Output' : 'Prompt Template'}
              </span>
              <span className="text-xs text-zinc-500 font-mono">
                {interpolatedContent.length} chars • Copied {prompt.copyCount} times
              </span>
            </div>

            <pre className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono text-xs leading-relaxed whitespace-pre-wrap select-all max-h-72 overflow-y-auto custom-scrollbar">
              {interpolatedContent}
            </pre>
          </div>

          {/* Attached Website Links */}
          {prompt.links && prompt.links.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-zinc-400" />
                Attached Website Links
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {prompt.links.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-800/60 border border-zinc-700/60 transition"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Globe className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-medium text-white truncate">{link.title}</p>
                        <p className="text-[11px] text-zinc-400 truncate">{link.url}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLaunchWithCopy(link.url)}
                      className="px-2.5 py-1 text-xs font-medium text-zinc-200 bg-zinc-700 hover:bg-zinc-600 rounded-md transition shrink-0 flex items-center gap-1"
                      title="Copy prompt and open link"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {prompt.tags && prompt.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {prompt.tags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-900 sticky bottom-0">
          <div className="text-xs text-zinc-500 font-mono">
            Created: {new Date(prompt.createdAt).toLocaleDateString()}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
            >
              Close
            </button>
            <button
              onClick={handleCopyClick}
              className="px-5 py-2 text-xs font-medium text-zinc-950 bg-zinc-100 hover:bg-white rounded-lg transition flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Prompt'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

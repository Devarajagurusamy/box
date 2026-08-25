'use client';

import React, { useState } from 'react';
import {
  Copy,
  Check,
  Heart,
  ExternalLink,
  Sliders,
  MoreVertical,
  Edit2,
  CopyPlus,
  Trash2,
  Globe
} from 'lucide-react';
import { Prompt, Category } from '../types';
import { CategoryIcon } from './CategoryIcon';

interface PromptCardProps {
  prompt: Prompt;
  category?: Category;
  viewMode: 'grid' | 'list';
  onCopy: (text: string, title: string) => void;
  onOpenDetail: (prompt: Prompt) => void;
  onEdit: (prompt: Prompt) => void;
  onDuplicate: (prompt: Prompt) => void;
  onDelete: (prompt: Prompt) => void;
  onToggleFavorite: (id: string) => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  category,
  viewMode,
  onCopy,
  onOpenDetail,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleFavorite,
}) => {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const variables = Array.from(
    new Set((prompt.content.match(/\{\{([a-zA-Z0-9_-]+)\}\}/g) || []).map((v) => v.replace(/[{}]/g, '')))
  );

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy(prompt.content, prompt.title);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchLink = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const categoryColor = category?.color?.startsWith('bg-') ? category.color : 'bg-zinc-700';

  if (viewMode === 'list') {
    return (
      <div
        onClick={() => onOpenDetail(prompt)}
        className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition cursor-pointer"
      >
        <div className="flex items-start gap-2.5 flex-1 min-w-0 w-full">
          <div className={`p-1.5 sm:p-2 rounded-lg ${categoryColor} text-white shrink-0 mt-0.5`}>
            <CategoryIcon name={category?.icon || 'Folder'} className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                {category?.name || 'General'}
              </span>
              {variables.length > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  {variables.length} vars
                </span>
              )}
            </div>

            <h3 className="text-xs sm:text-sm font-semibold text-white group-hover:text-zinc-200 transition truncate">
              {prompt.title}
            </h3>

            {prompt.description && (
              <p className="text-xs text-zinc-400 truncate mt-0.5">{prompt.description}</p>
            )}

            {/* Attached Links in list view */}
            {prompt.links && prompt.links.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {prompt.links.map((link) => (
                  <button
                    key={link.id}
                    onClick={(e) => handleLaunchLink(e, link.url)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition max-w-[160px] truncate"
                    title={link.url}
                  >
                    <Globe className="w-3 h-3 text-zinc-400 shrink-0" />
                    <span className="truncate">{link.title}</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60 shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t border-zinc-800/60 sm:border-0">
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(prompt.id);
              }}
              className={`p-1.5 rounded-lg transition ${
                prompt.isFavorite
                  ? 'text-red-400 bg-red-950/40'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
              title="Favorite"
            >
              <Heart className={`w-4 h-4 ${prompt.isFavorite ? 'fill-red-400' : ''}`} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail(prompt);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
            >
              <Sliders className="w-3 h-3" />
              <span>Fill</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-zinc-950 bg-zinc-100 hover:bg-white rounded-lg transition"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {/* Menu */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                    }}
                  />
                  <div className="absolute right-0 top-full mt-1 w-32 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl py-1 z-30">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onEdit(prompt);
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs text-zinc-300 hover:bg-zinc-800 flex items-center gap-2"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onDuplicate(prompt);
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs text-zinc-300 hover:bg-zinc-800 flex items-center gap-2"
                    >
                      <CopyPlus className="w-3 h-3" />
                      Duplicate
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onDelete(prompt);
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs text-red-400 hover:bg-red-950/40 flex items-center gap-2"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View Mode
  return (
    <div
      onClick={() => onOpenDetail(prompt)}
      className="group relative flex flex-col justify-between p-3.5 sm:p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition cursor-pointer"
    >
      <div>
        {/* Top bar: Category + Favorite + Menu */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <div className={`p-1 rounded ${categoryColor} text-white shrink-0`}>
              <CategoryIcon name={category?.icon || 'Folder'} className="w-3 h-3" />
            </div>
            <span className="text-xs font-medium text-zinc-300 truncate">
              {category?.name || 'General'}
            </span>
          </div>

          <div className="flex items-center gap-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(prompt.id);
              }}
              className={`p-1.5 rounded-md transition ${
                prompt.isFavorite
                  ? 'text-red-400 bg-red-950/40'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
              title="Favorite"
            >
              <Heart className={`w-3.5 h-3.5 ${prompt.isFavorite ? 'fill-red-400' : ''}`} />
            </button>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="p-1.5 text-zinc-500 hover:text-white rounded-md hover:bg-zinc-800 transition"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                    }}
                  />
                  <div className="absolute right-0 top-full mt-1 w-32 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl py-1 z-30">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onEdit(prompt);
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs text-zinc-300 hover:bg-zinc-800 flex items-center gap-2"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onDuplicate(prompt);
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs text-zinc-300 hover:bg-zinc-800 flex items-center gap-2"
                    >
                      <CopyPlus className="w-3 h-3" />
                      Duplicate
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onDelete(prompt);
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs text-red-400 hover:bg-red-950/40 flex items-center gap-2"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xs sm:text-sm font-semibold text-white group-hover:text-zinc-200 transition line-clamp-1 mb-1">
          {prompt.title}
        </h3>

        {/* Description */}
        {prompt.description && (
          <p className="text-xs text-zinc-400 line-clamp-2 mb-2 leading-relaxed">
            {prompt.description}
          </p>
        )}

        {/* Content Snippet */}
        <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 font-mono text-[11px] text-zinc-300 leading-relaxed line-clamp-3 select-none mb-2.5">
          {prompt.content}
        </div>

        {/* Attached Website Links */}
        {prompt.links && prompt.links.length > 0 && (
          <div className="mb-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              {prompt.links.slice(0, 2).map((link) => (
                <button
                  key={link.id}
                  onClick={(e) => handleLaunchLink(e, link.url)}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition truncate max-w-[140px]"
                  title={link.url}
                >
                  <Globe className="w-2.5 h-2.5 text-zinc-400 shrink-0" />
                  <span className="truncate">{link.title}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Variables badge */}
        {variables.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 mb-2.5">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
              {variables.length} vars
            </span>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
        <span className="text-[10px] text-zinc-500 font-mono">
          {prompt.copyCount} {prompt.copyCount === 1 ? 'copy' : 'copies'}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail(prompt);
            }}
            className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 rounded-lg transition"
            title="Open Variable Playground"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-950 bg-zinc-100 hover:bg-white rounded-lg transition"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

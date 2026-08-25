'use client';

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Category } from '../types';
import { AVAILABLE_ICON_NAMES, CategoryIcon } from './CategoryIcon';

const SOLID_COLORS = [
  { label: 'Blue', value: 'bg-blue-600' },
  { label: 'Indigo', value: 'bg-indigo-600' },
  { label: 'Violet', value: 'bg-violet-600' },
  { label: 'Purple', value: 'bg-purple-600' },
  { label: 'Emerald', value: 'bg-emerald-600' },
  { label: 'Teal', value: 'bg-teal-600' },
  { label: 'Cyan', value: 'bg-cyan-600' },
  { label: 'Amber', value: 'bg-amber-600' },
  { label: 'Rose', value: 'bg-rose-600' },
  { label: 'Slate', value: 'bg-slate-600' },
];

interface CategoryModalProps {
  isOpen: boolean;
  categoryToEdit: Category | null;
  onClose: () => void;
  onSave: (category: Category) => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  categoryToEdit,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Folder');
  const [color, setColor] = useState(SOLID_COLORS[0].value);
  const [error, setError] = useState('');

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setDescription(categoryToEdit.description || '');
      setIcon(categoryToEdit.icon || 'Folder');
      // If previous color was a gradient, map to solid color or default
      const currentColor = categoryToEdit.color?.startsWith('bg-')
        ? categoryToEdit.color
        : SOLID_COLORS[0].value;
      setColor(currentColor);
    } else {
      setName('');
      setDescription('');
      setIcon('Folder');
      setColor(SOLID_COLORS[0].value);
    }
    setError('');
  }, [categoryToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }

    const savedCategory: Category = {
      id: categoryToEdit ? categoryToEdit.id : `cat-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      icon,
      color,
    };

    onSave(savedCategory);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${color} text-white`}>
              <CategoryIcon name={icon} className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                {categoryToEdit ? 'Edit Category' : 'Create Category'}
              </h2>
              <p className="text-xs text-zinc-400">Organize prompts into structured groups</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs text-red-300 bg-red-950/60 border border-red-800/60 rounded-lg">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-1.5">
              Category Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. System Architecture, Copywriting"
              className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition text-sm"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of prompts in this category..."
              className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition text-sm resize-none"
            />
          </div>

          {/* Solid Color Selector */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-2">
              Color Tag
            </label>
            <div className="grid grid-cols-5 gap-2">
              {SOLID_COLORS.map((solid) => {
                const isSelected = color === solid.value;
                return (
                  <button
                    key={solid.value}
                    type="button"
                    onClick={() => setColor(solid.value)}
                    className={`h-8 rounded-lg ${solid.value} transition-all relative flex items-center justify-center ${
                      isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-105' : 'opacity-80 hover:opacity-100'
                    }`}
                    title={solid.label}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-2">
              Icon
            </label>
            <div className="grid grid-cols-8 gap-2 p-2 max-h-32 overflow-y-auto bg-zinc-800/60 rounded-lg border border-zinc-700 custom-scrollbar">
              {AVAILABLE_ICON_NAMES.map((iconName) => {
                const isSelected = icon === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className={`p-2 rounded-lg flex items-center justify-center transition ${
                      isSelected
                        ? 'bg-zinc-700 text-white ring-1 ring-zinc-400'
                        : 'text-zinc-400 hover:bg-zinc-700/60 hover:text-zinc-100'
                    }`}
                    title={iconName}
                  >
                    <CategoryIcon name={iconName} className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-zinc-100 text-zinc-950 hover:bg-white rounded-lg transition"
            >
              {categoryToEdit ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

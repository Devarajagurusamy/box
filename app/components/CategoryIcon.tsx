import React from 'react';
import {
  Code2,
  PenTool,
  TrendingUp,
  Sparkles,
  Zap,
  Lightbulb,
  Bot,
  Folder,
  Box,
  Terminal,
  Bookmark,
  Database,
  Brain,
  Cpu,
  Layers,
  Palette,
  MessageSquare,
  Search,
  Layout,
  Globe,
  FileText,
  Workflow,
  Rocket
} from 'lucide-react';

export const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Code2,
  PenTool,
  TrendingUp,
  Sparkles,
  Zap,
  Lightbulb,
  Bot,
  Folder,
  Box,
  Terminal,
  Bookmark,
  Database,
  Brain,
  Cpu,
  Layers,
  Palette,
  MessageSquare,
  Search,
  Layout,
  Globe,
  FileText,
  Workflow,
  Rocket
};

export const AVAILABLE_ICON_NAMES = Object.keys(ICON_MAP);

interface CategoryIconProps {
  name: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-4 h-4' }) => {
  const IconComponent = ICON_MAP[name] || Folder;
  return <IconComponent className={className} />;
};

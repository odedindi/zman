'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from '@/i18n/context';
import { useEntities } from '@/hooks/useEntities';
import { Plus, X, Trash2, Edit, Palette, User, Image, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Entity, ScheduleEntry, HolidayEntry, ExceptionEntry } from '@/store/entities';

const ENTITY_COLORS = [
  '#f59e0b', '#ef4444', '#3b82f6', '#22c55e', '#a855f7',
  '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#6366f1',
  '#14b8a6', '#f43f5e', '#8b5cf6', '#eab308', '#22d3ee',
];

const ENTITY_AVATARS = [
  '👶', '🧒', '👦', '👧', '🧑',
  '👨', '👩', '👴', '👵', '👨‍🍼',
  '👩‍🍼', '👨‍🏫', '👩‍🏫', '👨‍⚕️', '👩‍🏫',
  '🏫', '🏥', '🏠', '🏢', '🏪',
  '🚌', '🚗', '🚲', '🛴', '🛹',
  '⚽', '🏀', '🏈', '⚾', '🎾',
  '🏐', '🏉', '🥊', '🥋', '💃',
  '🧘', '🤸', '🏃', '🚶', '🏔️',
  '🧗', '🏄', '⛵', '🛶', '🎣',
  '🏕️', '📸', '🎨', '✏️', '🗿',
  '🍳', '🍰', '🌱', '🪚', '🔩',
  '💻', '📝', '📚', '🎮', '🎵',
  '🎭', '🎬', '🏛️', '📚', '🏞️',
  '🦁', '🐠', '🎡', '🌊', '🎢',
  '🏟️', '🏟️', '🏋️', '🏊', '🧖',
  '💇', '🏥', '💊', '🦷', '👁️',
  '🐕', '🏫', '🎓', '📚', '🔬',
  '🔧', '🎨', '💼', '🏭', '📦',
  '🏪', '🛒', '🏪', '🍔', '☕',
  '🍺', '🎉', '🏨', '🏠', '🏡',
  '🌾', '🐎', '🍇', '🌳', '🌻',
  '🌲', '🏖️', '🏞️', '🏔️', '🌄',
  '⛲', '🗿', '🏛️', '🕍', '⛪',
  '🕌', '🛕', '⛩️', '🛐', '⚱️',
  '🗣️', '🎹', '👑', '🪑', '🏺',
  '🌍', '🏴', '🛡️', '👑', '🪄',
  '🌐', '🏰', '🏯', '🗼', '🏙️',
  '⛪', '🏛️', '🕌', '🕍', '⛩️',
  '🏟️', '🏟️', '🏋️', '🏊', '🧖',
  '💇', '🏥', '💊', '🦷', '👁️',
  '🐕', '🏫', '🎓', '📚', '🔬',
  '🔧', '🎨', '💼', '🏭', '📦',
  '🏪', '🛒', '🏪', '🍔', '☕',
  '🍺', '🎉', '🏨', '🏠', '🏡',
  '🌾', '🐎', '🍇', '🌳', '🌻',
  '🌲', '🏖️', '🏞️', '🏔️', '🌄',
  '⛲', '🗿', '🏛️', '🕍', '⛪',
  '🕌', '🛕', '⛩️', '🛐', '⚱️',
  '🗣️', '🎹', '👑', '🪑', '🏺',
  '🌍', '🏴', '🛡️', '👑', '🪄',
];

interface EntityFormData {
  name: string;
  color: string;
  avatar: string;
}

export function EntityForm({ initialEntity, onSubmit, onCancel, isLoading }: {
  initialEntity?: Entity;
  onSubmit: (data: EntityFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<EntityFormData>({
    name: initialEntity?.name || '',
    color: initialEntity?.color || ENTITY_COLORS[0],
    avatar: initialEntity?.avatar || ENTITY_AVATARS[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          {initialEntity ? 'ערוך שם' : 'שם הישות'}
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder={initialEntity ? '' : 'למשל: גן ילדים, בית ספר, חוג כדורגל'}
          autoFocus
          required
          maxLength={50}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">צבע</label>
        <div className="grid grid-cols-5 gap-2">
          {ENTITY_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setFormData({ ...formData, color })}
              className={cn(
                'w-10 h-10 rounded-lg border-2 transition-all',
                formData.color === color
                  ? 'border-primary ring-2 ring-primary ring-offset-2 scale-105'
                  : 'border-transparent hover:border-muted/50'
              )}
              style={{ backgroundColor: color }}
              aria-label={`צבע ${color}`}
              aria-pressed={formData.color === color}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">סמל (אמוג'י)</label>
        <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto">
          {ENTITY_AVATARS.map((avatar,i) => (
            <button
              key={i}
              type="button"
              onClick={() => setFormData({ ...formData, avatar })}
              className={cn(
                'w-10 h-10 rounded-lg border-2 text-2xl flex items-center justify-center transition-all',
                formData.avatar === avatar
                  ? 'border-primary ring-2 ring-primary ring-offset-2 scale-105 bg-primary/10'
                  : 'border-transparent hover:border-muted/50 hover:scale-105'
              )}
              aria-label={`סמל ${avatar}`}
              aria-pressed={formData.avatar === avatar}
            >
              {avatar}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground font-medium hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4 inline mr-2" />
          ביטול
        </button>
        <button
          type="submit"
          disabled={isLoading || !formData.name.trim()}
          className="flex-1 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          <Save className="h-4 w-4" />
          {initialEntity ? 'שמור שינויים' : 'צור ישות'}
        </button>
      </div>
    </form>
  );
}
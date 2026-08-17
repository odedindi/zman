'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from '@/i18n/context';
import { useEntities } from '@/hooks/useEntities';
import { Plus, Trash2, Edit, ChevronDown, User, Building2, Calendar, Music, Heart, Star, BookOpen, Globe, Briefcase, Car } from 'lucide-react';
import { cn } from '@/lib/utils';

const ENTITY_ICONS = {
  child: User,
  school: Building2,
  activity: Calendar,
  music: Music,
  sport: Heart,
  art: Star,
  reading: BookOpen,
  language: Globe,
  work: Briefcase,
  transport: Car,
  custom: Plus,
} as const;

type EntityIconKey = keyof typeof ENTITY_ICONS;

export function EntitySwitcher() {
  const t = useTranslations();
  const locale = useLocale();
  const { entities, activeEntityId, setActiveEntity, allEntities } = useEntities();
  const activeEntity = activeEntityId ? entities[activeEntityId] : null;
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (id: string) => {
    setActiveEntity(id);
    setIsOpen(false);
  };

  const handleAdd = () => {
    window.location.href = `/${locale}/entities/new`;
  };

  const handleManage = () => {
    window.location.href = `/${locale}/entities`;
  };

  if (allEntities.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href={`/${locale}/entities/new`}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t('entities.addFirst')}
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background',
          'hover:bg-muted transition-colors',
          'text-sm font-medium'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
          style={{ backgroundColor: activeEntity?.color || '#f59e0b' }}
        >
          {activeEntity?.avatar || '?'}
        </div>
        <span className="hidden sm:block truncate max-w-[150px]">
          {activeEntity?.name || t('entities.select')}
        </span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-full mt-1 w-64 z-50 bg-white dark:bg-gray-800 rounded-lg border border-border shadow-lg py-1 animate-slide-down">
            {allEntities.map((entity) => (
              <button
                key={entity.id}
                onClick={() => handleSelect(entity.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors',
                  activeEntityId === entity.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ backgroundColor: entity.color }}
                >
                  {entity.avatar}
                </div>
                <span className="truncate">{entity.name}</span>
              </button>
            ))}
            <hr className="my-1 border-border" />
            <button
              onClick={handleAdd}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-primary hover:bg-primary/10 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {t('entities.addNew')}
            </button>
            <button
              onClick={handleManage}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Edit className="h-4 w-4" />
              {t('entities.manage')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
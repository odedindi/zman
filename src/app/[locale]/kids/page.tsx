'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from '@/i18n/context';
import { useEntities } from '@/hooks/useEntities';
import { EntityForm } from '@/components/kids/EntityForm';
import { Plus, Trash2, Edit, X, Loader2, Calendar, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function KidsPage() {
  const t = useTranslations('kids');
  const locale = useLocale();
  const { entities, activeEntityId, setActiveEntity, addEntity, updateEntity, deleteEntity, isLoading, allEntities } = useEntities();
  const [showForm, setShowForm] = useState(false);
  const [editingEntity, setEditingEntity] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const handleAdd = (data: { name: string; color: string; avatar: string }) => {
    const id = addEntity(data);
    setShowForm(false);
    setActiveEntity(id);
  };

  const handleEdit = (data: { name: string; color: string; avatar: string }) => {
    if (editingEntity) {
      updateEntity(editingEntity, data);
      setEditingEntity(null);
      setShowForm(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEntity(null);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('confirmDelete'))) {
      deleteEntity(id);
    }
  };

  const handleStartEdit = (id: string) => {
    setEditingEntity(id);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingEntity(null);
    setShowForm(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="text-2xl">←</span>
            {t('backToHome')}
          </Link>
          <h1 className="text-xl font-bold">{t('title')}</h1>
          {activeEntityId && (
            <nav className="flex items-center gap-2">
              <Link
                href={`/${locale}/calendar/schedule`}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">{t('nav.schedule')}</span>
              </Link>
              <Link
                href={`/${locale}/calendar/week/${format(new Date(), 'yyyy-\'W\'ww')}`}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">{t('nav.week')}</span>
              </Link>
              <Link
                href={`/${locale}/calendar/month/${format(new Date(), 'yyyy-MM')}`}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">{t('nav.month')}</span>
              </Link>
            </nav>
          )}
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {allEntities.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-6">
              <Plus className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{t('empty.title')}</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">{t('empty.description')}</p>
            <button
              onClick={handleNew}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-5 w-5" />
              {t('addFirst')}
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">{t('yourEntities')}</h2>
              <button
                onClick={handleNew}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                {t('addNew')}
              </button>
            </div>

            <div className="space-y-3">
              {allEntities.map((entity) => (
                <article
                  key={entity.id}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-border',
                    'transition-all hover:shadow-md hover:border-primary/50',
                    activeEntityId === entity.id && 'border-primary bg-primary/5'
                  )}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                    style={{ backgroundColor: entity.color }}
                  >
                    {entity.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{entity.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('createdAt', { date: new Date(entity.createdAt).toLocaleDateString(locale) })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveEntity(entity.id)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                        activeEntityId === entity.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      )}
                    >
                      {activeEntityId === entity.id ? t('active') : t('select')}
                    </button>
                    <button
                      onClick={() => handleStartEdit(entity.id)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      aria-label={t('edit')}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(entity.id)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      aria-label={t('delete')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {editingEntity ? t('editEntity') : t('addEntity')}
                </h2>
                <button
                  onClick={handleCancel}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <EntityForm
                initialEntity={editingEntity ? { ...entities[editingEntity] } : undefined}
                onSubmit={editingEntity ? handleEdit : handleAdd}
                onCancel={handleCancel}
                isLoading={formSubmitting}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
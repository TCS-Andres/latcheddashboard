import { useCallback, useEffect, useState } from 'react';
import { activeClient } from '@/config/clients';

const NOTES_KEY = `lb.${activeClient.slug}.notes`;

export type NoteTag =
  | 'campaign'
  | 'channel'
  | 'decision'
  | 'experiment'
  | 'referral'
  | 'provider-coaching'
  | 'content';

export const NOTE_TAGS: NoteTag[] = [
  'campaign',
  'channel',
  'decision',
  'experiment',
  'referral',
  'provider-coaching',
  'content',
];

export interface Note {
  id: string;
  date: string;            // YYYY-MM-DD
  title: string;
  body: string;            // markdown-ish, plain string for now
  tags: NoteTag[];
  createdAt: number;
  updatedAt: number;
}

function readNotes(): Note[] {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    return raw ? (JSON.parse(raw) as Note[]) : [];
  } catch {
    return [];
  }
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(() => readNotes());

  useEffect(() => {
    try {
      localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    } catch {
      /* ignore */
    }
  }, [notes]);

  const addNote = useCallback((draft: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    setNotes(prev => [
      {
        id: `n_${now}_${Math.random().toString(36).slice(2, 8)}`,
        ...draft,
        createdAt: now,
        updatedAt: now,
      },
      ...prev,
    ]);
  }, []);

  const updateNote = useCallback((id: string, patch: Partial<Note>) => {
    setNotes(prev =>
      prev.map(n => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n))
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  }, []);

  return { notes, addNote, updateNote, deleteNote };
}

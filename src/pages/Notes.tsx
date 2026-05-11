import { useMemo, useState } from 'react';
import { Plus, Trash2, Tag, Lock } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionCard } from '@/components/SectionCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { NOTE_TAGS, useNotes, type Note, type NoteTag } from '@/lib/store/notes';
import { cn } from '@/lib/utils';

export function Notes() {
  const { notes, addNote, deleteNote } = useNotes();
  const [filter, setFilter] = useState<NoteTag | 'all'>('all');
  const [draft, setDraft] = useState({
    title: '',
    body: '',
    tags: [] as NoteTag[],
    date: new Date().toISOString().slice(0, 10),
  });

  const filtered = useMemo(
    () => (filter === 'all' ? notes : notes.filter(n => n.tags.includes(filter))),
    [filter, notes]
  );

  const toggleDraftTag = (t: NoteTag) =>
    setDraft(d => ({
      ...d,
      tags: d.tags.includes(t) ? d.tags.filter(x => x !== t) : [...d.tags, t],
    }));

  const submit = () => {
    if (!draft.title.trim() && !draft.body.trim()) return;
    addNote({
      title: draft.title.trim() || 'Untitled',
      body: draft.body.trim(),
      tags: draft.tags,
      date: draft.date,
    });
    setDraft({ title: '', body: '', tags: [], date: new Date().toISOString().slice(0, 10) });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Strategy & Notes"
        description="Marketing journal — decisions, experiments, campaign context."
        actions={
          <Badge variant="muted" className="gap-1">
            <Lock className="h-3 w-3" />
            Local only · not PHI
          </Badge>
        }
      />

      <SectionCard title="New note" description="Saved to this browser only">
        <div className="grid gap-3">
          <div className="grid gap-2 sm:grid-cols-[1fr_180px]">
            <Input
              placeholder="Title (e.g. ‘Quiz funnel A/B test’)"
              value={draft.title}
              onChange={e => setDraft({ ...draft, title: e.target.value })}
            />
            <Input
              type="date"
              value={draft.date}
              onChange={e => setDraft({ ...draft, date: e.target.value })}
            />
          </div>
          <textarea
            placeholder="What happened, what's the hypothesis, what did you learn?"
            value={draft.body}
            onChange={e => setDraft({ ...draft, body: e.target.value })}
            rows={4}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            {NOTE_TAGS.map(t => (
              <button
                key={t}
                onClick={() => toggleDraftTag(t)}
                className={cn(
                  'rounded-full border px-2.5 py-0.5 text-xs transition-colors',
                  draft.tags.includes(t)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'bg-card text-muted-foreground hover:bg-accent'
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            <Button onClick={submit} size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Add note
            </Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title={`Journal · ${filtered.length} ${filtered.length === 1 ? 'entry' : 'entries'}`}
        actions={
          <select
            value={filter}
            onChange={e => setFilter(e.target.value as NoteTag | 'all')}
            className="h-8 rounded-md border bg-background px-2 text-xs"
          >
            <option value="all">All tags</option>
            {NOTE_TAGS.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        }
      >
        {filtered.length === 0 ? (
          <div className="rounded-md border border-dashed py-12 text-center text-sm text-muted-foreground">
            No notes yet. Capture a campaign decision, an experiment, or a meeting takeaway.
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map(note => (
              <NoteItem key={note.id} note={note} onDelete={() => deleteNote(note.id)} />
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

function NoteItem({ note, onDelete }: { note: Note; onDelete: () => void }) {
  return (
    <li className="rounded-lg border bg-card/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-medium leading-snug">{note.title}</h4>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {new Date(note.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Delete note">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {note.body && (
        <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/90">{note.body}</p>
      )}
      {note.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {note.tags.map(t => (
            <Badge key={t} variant="muted">
              {t}
            </Badge>
          ))}
        </div>
      )}
    </li>
  );
}

'use client';

// Internal, unlinked QA scratch page for manually exercising every toast
// feature end-to-end (positions, limit/queue, duplicate toastId, drag,
// pause on hover/blur, promise, update, keyboard Escape, theming). Safe to
// delete once verification is complete.

import { toast, useToast } from '@/src/components/ui/Toast';
import { setLimit } from '@/src/components/ui/toast/store';

const POSITIONS = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'];

export default function ToastPreviewPage() {
  const hookToast = useToast();

  return (
    <div className="min-h-screen bg-canvas p-8 space-y-10">
      <header>
        <h1 className="text-2xl font-bold text-text-primary">Toast System — QA Preview</h1>
        <p className="text-sm text-text-muted mt-1">
          Internal, unlinked route for manually exercising every toast feature. Safe to delete after verification.
        </p>
      </header>

      <Section title="Types (backward-compatible useToast() signature)">
        <ButtonRow>
          <QAButton onClick={() => hookToast.success('Saved', 'Your changes were saved.')}>success</QAButton>
          <QAButton onClick={() => hookToast.error('Failed', 'Something went wrong.')}>error</QAButton>
          <QAButton onClick={() => hookToast.warning('Careful', 'This action needs review.')}>warning</QAButton>
          <QAButton onClick={() => hookToast.info('FYI', 'Here is some info.')}>info</QAButton>
          <QAButton onClick={() => hookToast.sparkle('New', 'A shiny new feature.')}>sparkle</QAButton>
          <QAButton onClick={() => hookToast.loading('Working…', 'Please wait.')}>loading</QAButton>
        </ButtonRow>
      </Section>

      <Section title="Positions (imperative import, not the hook)">
        <ButtonRow>
          {POSITIONS.map((position) => (
            <QAButton key={position} onClick={() => toast.info(position, 'Positioned toast', { position })}>
              {position}
            </QAButton>
          ))}
        </ButtonRow>
      </Section>

      <Section title="Duration / sticky">
        <ButtonRow>
          <QAButton onClick={() => toast.info('Quick', '1s auto-dismiss', 1000)}>1s (legacy number arg)</QAButton>
          <QAButton onClick={() => toast.info('Sticky', 'Never auto-dismisses', { duration: Infinity })}>sticky</QAButton>
        </ButtonRow>
      </Section>

      <Section title="Duplicate prevention & update()">
        <ButtonRow>
          <QAButton onClick={() => toast.info('Duplicate test', 'Click again — same card', { toastId: 'dup-demo' })}>
            fire toastId=dup-demo
          </QAButton>
          <QAButton
            onClick={() =>
              toast.update('dup-demo', { type: 'success', title: 'Updated!', description: 'Same card, new content.' })
            }
          >
            update dup-demo
          </QAButton>
        </ButtonRow>
      </Section>

      <Section title="Promise-based">
        <ButtonRow>
          <QAButton
            onClick={() =>
              toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
                pending: 'Uploading…',
                success: 'Uploaded!',
                error: 'Upload failed',
              })
            }
          >
            promise (resolves in 2s)
          </QAButton>
          <QAButton
            onClick={() =>
              toast.promise(
                new Promise((_resolve, reject) => setTimeout(() => reject(new Error('Network error')), 2000)),
                { pending: 'Uploading…', success: 'Uploaded!', error: (err) => err.message }
              )
            }
          >
            promise (rejects in 2s)
          </QAButton>
        </ButtonRow>
      </Section>

      <Section title="Action button & custom icon">
        <ButtonRow>
          <QAButton
            onClick={() =>
              toast.info('Item removed', 'You can undo this.', {
                action: { label: 'Undo', onClick: () => toast.success('Restored', '') },
              })
            }
          >
            with action
          </QAButton>
          <QAButton onClick={() => toast.success('No icon', '', { icon: false })}>icon: false</QAButton>
        </ButtonRow>
      </Section>

      <Section title="Limit / queue">
        <ButtonRow>
          <QAButton
            onClick={() => {
              setLimit(3);
              for (let i = 1; i <= 8; i += 1) {
                toast.info(`Queued #${i}`, 'Only 3 should be visible at once.', { position: 'top-right' });
              }
            }}
          >
            set limit=3, fire 8 at top-right
          </QAButton>
          <QAButton onClick={() => setLimit(Infinity)}>reset limit (unlimited)</QAButton>
        </ButtonRow>
      </Section>

      <Section title="Dismiss all">
        <ButtonRow>
          <QAButton onClick={() => toast.dismissAll()}>dismiss all</QAButton>
        </ButtonRow>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">{title}</h2>
      {children}
    </section>
  );
}

function ButtonRow({ children }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

function QAButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-2 rounded-lg border border-border bg-surface text-text-primary text-sm font-medium hover:bg-surface-2 transition-colors cursor-pointer"
    >
      {children}
    </button>
  );
}

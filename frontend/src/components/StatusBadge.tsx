import clsx from 'clsx';

type Status = 'Interested' | 'Applied' | 'Submitted' | 'Accepted' | 'Rejected' | 'active' | 'pending' | 'suspended' | 'graduated';

const config: Record<Status | string, { label: string; className: string }> = {
  Interested: { label: 'Interested', className: 'badge-interested' },
  Applied:    { label: 'Applied',    className: 'badge-applied' },
  Submitted:  { label: 'Submitted',  className: 'badge-submitted' },
  Accepted:   { label: '✓ Accepted', className: 'badge-accepted' },
  Rejected:   { label: '✗ Rejected', className: 'badge-rejected' },
  'In Progress': { label: '⟳ In Progress', className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30' },
  Resolved:   { label: '⚡ Resolved', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' },
  active:     { label: 'Active',     className: 'badge-active' },
  pending:    { label: 'Pending',    className: 'badge-pending' },
  suspended:  { label: 'Suspended',  className: 'badge-suspended' },
  graduated:  { label: 'Graduated',  className: 'badge-graduated' },
};

export default function StatusBadge({ status }: { status: string }) {
  const cfg = config[status] ?? { label: status, className: 'badge-interested' };
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold', cfg.className)}>
      {cfg.label}
    </span>
  );
}

import clsx from 'clsx';

type Status = 'Interested' | 'Applied' | 'Submitted' | 'Accepted' | 'Rejected' | 'active' | 'pending' | 'suspended' | 'graduated';

const config: Record<Status | string, { label: string; className: string }> = {
  Interested: { label: 'Interested', className: 'badge-interested' },
  Applied:    { label: 'Applied',    className: 'badge-applied' },
  Submitted:  { label: 'Submitted',  className: 'badge-submitted' },
  Accepted:   { label: '✓ Accepted', className: 'badge-accepted' },
  Rejected:   { label: '✗ Rejected', className: 'badge-rejected' },
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

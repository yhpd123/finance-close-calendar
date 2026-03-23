import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  tone?: 'default' | 'accent' | 'warning';
  meta?: ReactNode;
  onClick?: () => void;
}

export function StatCard({ label, value, tone = 'default', meta, onClick }: StatCardProps) {
  const className = `stat-card stat-card-${tone}${onClick ? ' stat-card-button' : ''}`;

  if (onClick) {
    return (
      <button type="button" className={className} onClick={onClick}>
        <span className="eyebrow">{label}</span>
        <strong>{value}</strong>
        {meta ? <div className="stat-meta">{meta}</div> : null}
      </button>
    );
  }

  return (
    <article className={className}>
      <span className="eyebrow">{label}</span>
      <strong>{value}</strong>
      {meta ? <div className="stat-meta">{meta}</div> : null}
    </article>
  );
}

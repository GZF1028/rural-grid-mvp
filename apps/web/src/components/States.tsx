import type { ReactNode } from "react";

export function SkeletonRows({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-control bg-line/40" />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-card border border-dashed border-line bg-white/70 px-6 py-14 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl">
        🌿
      </div>
      <p className="text-body font-medium text-ink">{title}</p>
      {hint && <p className="mt-1 text-caption text-ink-secondary">{hint}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-card border border-risk-high/30 bg-risk-high/5 px-6 py-10 text-center">
      <p className="text-body font-medium text-risk-high">加载失败</p>
      <p className="mt-1 text-caption text-ink-secondary">{message}</p>
      <button onClick={onRetry} className="btn-secondary mt-4">
        重试
      </button>
    </div>
  );
}

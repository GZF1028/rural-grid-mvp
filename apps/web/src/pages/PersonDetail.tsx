import { useCallback, useEffect, useState } from "react";
import type { Person } from "../types";
import { api, ApiError } from "../api";
import {
  age,
  formatDate,
  formatTime,
  maskPhone,
  METHOD_LABEL,
} from "../lib/format";
import { CategoryTag, RiskBadge, StatusBadge } from "../components/Badges";
import { EmptyState, ErrorState, SkeletonRows } from "../components/States";
import { VisitModal } from "../components/VisitModal";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="shrink-0 text-ink-secondary">{label}</dt>
      <dd className="break-all text-right text-ink">{value}</dd>
    </div>
  );
}

export function PersonDetail({
  id,
  onBack,
  onEdit,
}: {
  id: string;
  onBack: () => void;
  onEdit: () => void;
}) {
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVisit, setShowVisit] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPerson(await api.getPerson(id));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "加载失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <SkeletonRows rows={5} />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!person) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <button className="btn-secondary" onClick={onBack}>
            ← 返回
          </button>
          <h1 className="text-page-title">档案详情</h1>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={onEdit}>
            编辑档案
          </button>
          <button className="btn-primary" onClick={() => setShowVisit(true)}>
            + 新增走访
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="rounded-card border border-line bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl text-primary">
              {person.name.slice(0, 1)}
            </span>
            <div>
              <div className="text-card-title">{person.name}</div>
              <div className="text-caption text-ink-secondary">
                {person.gender === "MALE" ? "男" : "女"} · {age(person.birthDate) ?? "—"}岁
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <CategoryTag category={person.category} />
            <RiskBadge level={person.riskLevel} />
            <StatusBadge status={person.status} />
          </div>

          <dl className="mt-4 space-y-2 text-body">
            <Row label="所属网格" value={person.grid?.name ?? "—"} />
            <Row label="手机号" value={maskPhone(person.phone)} />
            {person.guardianName && <Row label="监护人" value={person.guardianName} />}
            <Row label="地址" value={person.address ?? "—"} />
            <Row label="最近走访" value={formatDate(person.lastVisitAt)} />
          </dl>

          {person.notes && (
            <p className="mt-4 rounded-control bg-paper p-3 text-caption text-ink-secondary">
              {person.notes}
            </p>
          )}
        </div>

        <div className="rounded-card border border-line bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-card-title">走访记录</h2>
            <span className="text-caption text-ink-secondary">
              {person.visits?.length ?? 0} 条
            </span>
          </div>

          {!person.visits || person.visits.length === 0 ? (
            <EmptyState title="暂无走访记录" hint="点击右上角「新增走访」开始记录" />
          ) : (
            <ol className="relative space-y-5 border-l border-line pl-5">
              {person.visits.map((v) => (
                <li key={v.id} className="relative">
                  <span className="absolute -left-[26px] top-1 h-2.5 w-2.5 rounded-full border-2 border-primary bg-white" />
                  <div className="text-body font-medium text-ink">
                    {METHOD_LABEL[v.method]}走访 · {v.visitor}
                  </div>
                  <div className="text-caption text-ink-secondary">
                    {formatDate(v.visitedAt)} {formatTime(v.visitedAt)}
                  </div>
                  <div className="mt-1 text-body text-ink-secondary">情况摘要：{v.summary}</div>
                  {v.nextStep && (
                    <div className="text-body text-ink-secondary">下一步：{v.nextStep}</div>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {showVisit && (
        <VisitModal
          personId={person.id}
          onClose={() => setShowVisit(false)}
          onSaved={() => {
            setShowVisit(false);
            void load();
          }}
        />
      )}
    </div>
  );
}

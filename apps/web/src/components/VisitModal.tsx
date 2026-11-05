import { useState } from "react";
import type { VisitMethod } from "../types";
import { api, ApiError } from "../api";
import { METHOD_OPTIONS, toDateTimeInputValue } from "../lib/format";
import { Modal } from "../components/Modal";

export function VisitModal({
  personId,
  onClose,
  onSaved,
}: {
  personId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    visitedAt: toDateTimeInputValue(new Date().toISOString()),
    method: "ON_SITE" as VisitMethod,
    visitor: "张网格员",
    summary: "",
    nextStep: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!form.summary.trim()) {
      setError("请填写情况摘要");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.createVisit(personId, {
        visitedAt: new Date(form.visitedAt).toISOString(),
        method: form.method,
        visitor: form.visitor.trim() || "张网格员",
        summary: form.summary.trim(),
        nextStep: form.nextStep.trim() || null,
      });
      onSaved();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="新增走访记录"
      onClose={onClose}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} disabled={saving}>
            取消
          </button>
          <button className="btn-primary" onClick={submit} disabled={saving}>
            {saving ? "保存中…" : "保存"}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-caption text-ink-secondary">走访时间 *</span>
          <input
            type="datetime-local"
            className="input"
            value={form.visitedAt}
            onChange={(e) => setForm({ ...form, visitedAt: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-caption text-ink-secondary">走访方式 *</span>
          <select
            className="select w-full"
            value={form.method}
            onChange={(e) => setForm({ ...form, method: e.target.value as VisitMethod })}
          >
            {METHOD_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-caption text-ink-secondary">走访人 *</span>
          <input
            className="input"
            value={form.visitor}
            onChange={(e) => setForm({ ...form, visitor: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-caption text-ink-secondary">情况摘要 *</span>
          <textarea
            className="input min-h-[72px]"
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-caption text-ink-secondary">下一步</span>
          <input
            className="input"
            value={form.nextStep}
            onChange={(e) => setForm({ ...form, nextStep: e.target.value })}
          />
        </label>
        {error && <p className="text-caption text-risk-high">{error}</p>}
      </div>
    </Modal>
  );
}

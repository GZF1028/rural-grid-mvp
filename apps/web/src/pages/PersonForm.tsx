import type { ChangeEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import type { Grid, PersonInput } from "../types";
import { api, ApiError } from "../api";
import {
  age,
  birthDateFromAge,
  CATEGORY_OPTIONS,
  RISK_OPTIONS,
  STATUS_OPTIONS,
  toDateInputValue,
} from "../lib/format";

interface FormState {
  name: string;
  gender: string;
  birthDate: string;
  category: string;
  gridId: string;
  phone: string;
  guardianName: string;
  address: string;
  riskLevel: string;
  status: string;
  notes: string;
}

const todayStr = toDateInputValue(new Date().toISOString());

const EMPTY_FORM: FormState = {
  name: "",
  gender: "MALE",
  birthDate: todayStr,
  category: "ELDERLY_LIVING_ALONE",
  gridId: "",
  phone: "",
  guardianName: "",
  address: "",
  riskLevel: "LOW",
  status: "NORMAL",
  notes: "",
};

export function PersonForm({
  id,
  onDone,
  onCancel,
}: {
  id?: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [grids, setGrids] = useState<Grid[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [ageText, setAgeText] = useState(() => {
    const a = age(todayStr);
    return a != null ? String(a) : "";
  });
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    api.listGrids().then(setGrids).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!id) return;
    api
      .getPerson(id)
      .then((p) => {
        setForm({
          name: p.name,
          gender: p.gender,
          birthDate: toDateInputValue(p.birthDate),
          category: p.category,
          gridId: p.gridId,
          phone: p.phone ?? "",
          guardianName: p.guardianName ?? "",
          address: p.address ?? "",
          riskLevel: p.riskLevel,
          status: p.status,
          notes: p.notes ?? "",
        });
        const a = p.birthDate ? age(p.birthDate) : null;
        setAgeText(a != null ? String(a) : "");
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "加载失败"))
      .finally(() => setLoading(false));
  }, [id]);

  const set =
    (key: keyof FormState) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const onBirthDate = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setForm((prev) => ({ ...prev, birthDate: v }));
    const a = v ? age(v) : null;
    setAgeText(a != null ? String(a) : "");
  };

  const onAge = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setAgeText(v);
    if (v.trim() === "") {
      setForm((prev) => ({ ...prev, birthDate: "" }));
      return;
    }
    const n = Number(v);
    if (Number.isInteger(n) && n >= 0 && n < 150) {
      setForm((prev) => ({ ...prev, birthDate: birthDateFromAge(n) }));
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "请填写姓名";
    if (!form.gridId) errs.gridId = "请选择所属网格";
    if (form.phone && !/^1[3-9]\d{9}$/.test(form.phone)) errs.phone = "手机号格式不正确";
    if (form.category === "LEFT_BEHIND_CHILD" && !form.guardianName.trim()) {
      errs.guardianName = "留守儿童请填写监护人姓名";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        gender: form.gender,
        birthDate: form.birthDate || null,
        category: form.category,
        gridId: form.gridId,
        phone: form.phone || null,
        guardianName: form.guardianName || null,
        address: form.address || null,
        riskLevel: form.riskLevel,
        status: form.status,
        notes: form.notes || null,
      } as unknown as PersonInput;

      if (id) await api.updatePerson(id, payload);
      else await api.createPerson(payload);
      onDone();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const isChild = form.category === "LEFT_BEHIND_CHILD";

  if (loading) {
    return (
      <div className="rounded-card border border-line bg-white p-8 text-center text-ink-secondary">
        加载中…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button className="btn-secondary" onClick={onCancel}>
          ← 返回
        </button>
        <h1 className="text-page-title">{id ? "编辑档案" : "新增档案"}</h1>
      </div>

      <div className="max-w-2xl rounded-card border border-line bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="姓名 *" error={fieldErrors.name}>
            <input className="input" value={form.name} onChange={set("name")} placeholder="请输入姓名" />
          </Field>
          <Field label="性别 *">
            <select className="select w-full" value={form.gender} onChange={set("gender")}>
              <option value="MALE">男</option>
              <option value="FEMALE">女</option>
            </select>
          </Field>
          <Field label="出生日期">
            <input type="date" className="input" value={form.birthDate} onChange={onBirthDate} />
          </Field>
          <Field label="年龄（岁）">
            <input
              type="number"
              className="input"
              value={ageText}
              onChange={onAge}
              placeholder="输入年龄可自动换算出生日期"
              min={0}
              max={149}
            />
          </Field>
          <Field label="人群类型 *">
            <select className="select w-full" value={form.category} onChange={set("category")}>
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="所属网格 *" error={fieldErrors.gridId}>
            <select className="select w-full" value={form.gridId} onChange={set("gridId")}>
              <option value="">请选择网格</option>
              {grids.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="风险等级 *">
            <select className="select w-full" value={form.riskLevel} onChange={set("riskLevel")}>
              {RISK_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label={isChild ? "监护人手机号" : "手机号"} error={fieldErrors.phone}>
            <input
              className="input"
              value={form.phone}
              onChange={set("phone")}
              placeholder="11 位手机号"
              maxLength={11}
            />
          </Field>
          {isChild && (
            <Field label="监护人姓名 *" error={fieldErrors.guardianName}>
              <input
                className="input"
                value={form.guardianName}
                onChange={set("guardianName")}
                placeholder="留守儿童必填"
              />
            </Field>
          )}
          <Field label="状态 *">
            <select className="select w-full" value={form.status} onChange={set("status")}>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="地址" className="sm:col-span-2">
            <input className="input" value={form.address} onChange={set("address")} placeholder="组内地址" />
          </Field>
          <Field label="备注" className="sm:col-span-2">
            <textarea
              className="input min-h-[72px]"
              value={form.notes}
              onChange={set("notes")}
              placeholder="其它需要说明的情况"
            />
          </Field>
        </div>

        {error && <p className="mt-3 text-caption text-risk-high">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-secondary" onClick={onCancel} disabled={saving}>
            取消
          </button>
          <button className="btn-primary" onClick={submit} disabled={saving}>
            {saving ? "保存中…" : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-caption text-ink-secondary">{label}</label>
      {children}
      {error && <p className="mt-1 text-caption text-risk-high">{error}</p>}
    </div>
  );
}

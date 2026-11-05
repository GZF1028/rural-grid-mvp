import type { PersonCategory, PersonStatus, RiskLevel, VisitMethod } from "../types";

export const CATEGORY_LABEL: Record<PersonCategory, string> = {
  ELDERLY_LIVING_ALONE: "独居老人",
  EMPTY_NESTER: "空巢老人",
  LEFT_BEHIND_CHILD: "留守儿童",
  DISABLED: "残障人士",
  OTHER: "其他",
};

export const RISK_LABEL: Record<RiskLevel, string> = {
  HIGH: "高风险",
  MID: "中风险",
  LOW: "低风险",
};

export const STATUS_LABEL: Record<PersonStatus, string> = {
  NORMAL: "正常",
  KEY_FOCUS: "重点关注",
  PENDING_VISIT: "待走访",
};

export const METHOD_LABEL: Record<VisitMethod, string> = {
  ON_SITE: "上门",
  PHONE: "电话",
  VIDEO: "视频",
  OTHER: "其他",
};

export const RISK_OPTIONS: { value: RiskLevel; label: string }[] = [
  { value: "HIGH", label: "高风险" },
  { value: "MID", label: "中风险" },
  { value: "LOW", label: "低风险" },
];

export const STATUS_OPTIONS: { value: PersonStatus; label: string }[] = [
  { value: "NORMAL", label: "正常" },
  { value: "KEY_FOCUS", label: "重点关注" },
  { value: "PENDING_VISIT", label: "待走访" },
];

export const CATEGORY_OPTIONS: { value: PersonCategory; label: string }[] = [
  { value: "ELDERLY_LIVING_ALONE", label: "独居老人" },
  { value: "EMPTY_NESTER", label: "空巢老人" },
  { value: "LEFT_BEHIND_CHILD", label: "留守儿童" },
  { value: "DISABLED", label: "残障人士" },
  { value: "OTHER", label: "其他" },
];

export const METHOD_OPTIONS: { value: VisitMethod; label: string }[] = [
  { value: "ON_SITE", label: "上门" },
  { value: "PHONE", label: "电话" },
  { value: "VIDEO", label: "视频" },
  { value: "OTHER", label: "其他" },
];

export const GENDER_LABEL: Record<string, string> = {
  MALE: "男",
  FEMALE: "女",
};

const pad = (n: number) => String(n).padStart(2, "0");

export function maskPhone(phone?: string | null): string {
  if (!phone) return "—";
  return phone.length === 11 ? `${phone.slice(0, 3)}****${phone.slice(7)}` : phone;
}

export function age(birthDate?: string | null): number | null {
  if (!birthDate) return null;
  const d = new Date(birthDate);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000));
}

export function birthDateFromAge(ageYears: number): string {
  const now = new Date();
  const d = new Date(now.getFullYear() - ageYears, now.getMonth(), now.getDate());
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatTime(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function toDateInputValue(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function toDateTimeInputValue(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

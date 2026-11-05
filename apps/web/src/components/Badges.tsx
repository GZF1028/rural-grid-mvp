import type { PersonCategory, PersonStatus, RiskLevel } from "../types";
import { CATEGORY_LABEL, RISK_LABEL, STATUS_LABEL } from "../lib/format";

const riskClass: Record<RiskLevel, string> = {
  HIGH: "bg-risk-high/10 text-risk-high",
  MID: "bg-risk-mid/10 text-risk-mid",
  LOW: "bg-risk-low/10 text-risk-low",
};

const statusClass: Record<PersonStatus, string> = {
  NORMAL: "bg-primary/10 text-primary",
  KEY_FOCUS: "bg-risk-high/10 text-risk-high",
  PENDING_VISIT: "bg-accent/20 text-[#8a6d1f]",
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className={`inline-block rounded-tag px-2 py-0.5 text-caption ${riskClass[level]}`}>
      {RISK_LABEL[level]}
    </span>
  );
}

export function StatusBadge({ status }: { status: PersonStatus }) {
  return (
    <span className={`inline-block rounded-tag px-2 py-0.5 text-caption ${statusClass[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function CategoryTag({ category }: { category: PersonCategory }) {
  return (
    <span className="inline-block rounded-tag border border-primary/20 bg-primary/5 px-2 py-0.5 text-caption text-primary">
      {CATEGORY_LABEL[category]}
    </span>
  );
}

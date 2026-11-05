export type Gender = "MALE" | "FEMALE";

export type PersonCategory =
  | "ELDERLY_LIVING_ALONE"
  | "EMPTY_NESTER"
  | "LEFT_BEHIND_CHILD"
  | "DISABLED"
  | "OTHER";

export type RiskLevel = "HIGH" | "MID" | "LOW";

export type PersonStatus = "NORMAL" | "KEY_FOCUS" | "PENDING_VISIT";

export type VisitMethod = "ON_SITE" | "PHONE" | "VIDEO" | "OTHER";

export interface Grid {
  id: string;
  name: string;
  bounds: unknown;
  color: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: { persons: number };
}

export interface Visit {
  id: string;
  personId: string;
  visitedAt: string;
  method: VisitMethod;
  visitor: string;
  summary: string;
  nextStep: string | null;
  createdAt: string;
}

export interface Person {
  id: string;
  name: string;
  gender: Gender;
  birthDate: string | null;
  category: PersonCategory;
  gridId: string;
  phone: string | null;
  guardianName: string | null;
  address: string | null;
  riskLevel: RiskLevel;
  status: PersonStatus;
  lastVisitAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  grid?: Grid;
  visits?: Visit[];
}

export interface PersonListResult {
  items: Person[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PersonInput {
  name: string;
  gender: Gender;
  birthDate: string | null;
  category: PersonCategory;
  gridId: string;
  phone: string | null;
  guardianName: string | null;
  address: string | null;
  riskLevel: RiskLevel;
  status: PersonStatus;
  notes: string | null;
}

export interface VisitInput {
  visitedAt: string;
  method: VisitMethod;
  visitor: string;
  summary: string;
  nextStep: string | null;
}

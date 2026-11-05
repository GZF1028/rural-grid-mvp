import type {
  Grid,
  Person,
  PersonInput,
  PersonListResult,
  Visit,
  VisitInput,
} from "./types";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }
  if (!res.ok) {
    const err = (body ?? {}) as { error?: string; details?: unknown };
    throw new ApiError(res.status, err.error ?? `请求失败 (${res.status})`, err.details);
  }
  return body as T;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") search.set(k, String(v));
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}

export const api = {
  listGrids: () => request<Grid[]>("/grids"),
  updateGrid: (id: string, data: { bounds?: unknown; color?: string; name?: string }) =>
    request<Grid>(`/grids/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  listPersons: (params: {
    q?: string;
    gridId?: string;
    riskLevel?: string;
    category?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }) => request<PersonListResult>(`/persons${buildQuery(params)}`),

  getPerson: (id: string) => request<Person>(`/persons/${id}`),
  createPerson: (data: PersonInput) =>
    request<Person>("/persons", { method: "POST", body: JSON.stringify(data) }),
  updatePerson: (id: string, data: PersonInput) =>
    request<Person>(`/persons/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  listVisits: (personId: string) => request<Visit[]>(`/persons/${personId}/visits`),
  createVisit: (personId: string, data: VisitInput) =>
    request<Visit>(`/persons/${personId}/visits`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

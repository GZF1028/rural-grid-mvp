import type { ChangeEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import type { Grid, PersonListResult } from "../types";
import { api, ApiError } from "../api";
import { age, CATEGORY_LABEL, formatDate, maskPhone } from "../lib/format";
import { RiskBadge, StatusBadge } from "../components/Badges";
import { EmptyState, ErrorState, SkeletonRows } from "../components/States";

const PAGE_SIZE = 8;

type Filters = {
  q: string;
  gridId: string;
  riskLevel: string;
  category: string;
  status: string;
};

const EMPTY_FILTERS: Filters = { q: "", gridId: "", riskLevel: "", category: "", status: "" };

export function PersonList({
  onOpen,
  onCreate,
}: {
  onOpen: (id: string) => void;
  onCreate: () => void;
}) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PersonListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [grids, setGrids] = useState<Grid[]>([]);

  useEffect(() => {
    api.listGrids().then(setGrids).catch(() => undefined);
  }, []);

  const load = useCallback(async (f: Filters, p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.listPersons({
        q: f.q || undefined,
        gridId: f.gridId || undefined,
        riskLevel: f.riskLevel || undefined,
        category: f.category || undefined,
        status: f.status || undefined,
        page: p,
        pageSize: PAGE_SIZE,
      });
      setData(res);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "加载失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(EMPTY_FILTERS, 1);
  }, [load]);

  const applySearch = () => {
    setPage(1);
    void load(filters, 1);
  };

  const reset = () => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
    void load(EMPTY_FILTERS, 1);
  };

  const goPage = (p: number) => {
    setPage(p);
    void load(filters, p);
  };

  const setFilter =
    (key: keyof Filters) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setFilters((prev) => ({ ...prev, [key]: e.target.value }));

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-page-title">重点人群档案</h1>
          <p className="text-caption text-ink-secondary">
            管理和查看重点人群档案信息，支持多条件筛选与走访管理
          </p>
        </div>
        <button className="btn-primary" onClick={onCreate}>
          + 新增档案
        </button>
      </div>

      <div className="rounded-card border border-line bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="input w-full sm:w-56"
            placeholder="搜索姓名 / 手机号"
            value={filters.q}
            onChange={setFilter("q")}
            onKeyDown={(e) => e.key === "Enter" && applySearch()}
          />
          <select className="select w-full sm:w-auto" value={filters.gridId} onChange={setFilter("gridId")}>
            <option value="">所属网格</option>
            {grids.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <select className="select w-full sm:w-auto" value={filters.riskLevel} onChange={setFilter("riskLevel")}>
            <option value="">风险等级</option>
            <option value="HIGH">高风险</option>
            <option value="MID">中风险</option>
            <option value="LOW">低风险</option>
          </select>
          <select className="select w-full sm:w-auto" value={filters.category} onChange={setFilter("category")}>
            <option value="">人群类型</option>
            <option value="ELDERLY_LIVING_ALONE">独居老人</option>
            <option value="EMPTY_NESTER">空巢老人</option>
            <option value="LEFT_BEHIND_CHILD">留守儿童</option>
            <option value="DISABLED">残障人士</option>
            <option value="OTHER">其他</option>
          </select>
          <select className="select w-full sm:w-auto" value={filters.status} onChange={setFilter("status")}>
            <option value="">状态</option>
            <option value="NORMAL">正常</option>
            <option value="KEY_FOCUS">重点关注</option>
            <option value="PENDING_VISIT">待走访</option>
          </select>
          <div className="ml-auto flex gap-2">
            <button className="btn-secondary" onClick={reset}>
              重置
            </button>
            <button className="btn-primary" onClick={applySearch}>
              查询
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <SkeletonRows />
      ) : error ? (
        <ErrorState message={error} onRetry={() => load(filters, page)} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          title="暂无档案"
          hint="还没有重点人群档案，点击新增开始录入"
          action={
            <button className="btn-primary" onClick={onCreate}>
              + 新增档案
            </button>
          }
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-card border border-line bg-white sm:block">
            <table className="w-full text-left text-body">
              <thead className="bg-paper/70 text-caption text-ink-secondary">
                <tr>
                  <th className="px-4 py-3 font-semibold">姓名</th>
                  <th className="px-4 py-3 font-semibold">所属网格</th>
                  <th className="px-4 py-3 font-semibold">人群类型</th>
                  <th className="px-4 py-3 font-semibold">风险等级</th>
                  <th className="px-4 py-3 font-semibold">手机号</th>
                  <th className="px-4 py-3 font-semibold">状态</th>
                  <th className="px-4 py-3 font-semibold">最近走访</th>
                  <th className="px-4 py-3 text-right font-semibold">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.items.map((p) => (
                  <tr key={p.id} className="transition hover:bg-[#F0F6F1]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-caption text-primary">
                          {p.name.slice(0, 1)}
                        </span>
                        <div>
                          <div className="font-medium text-ink">{p.name}</div>
                          <div className="text-caption text-ink-secondary">
                            {p.gender === "MALE" ? "男" : "女"} · {age(p.birthDate) ?? "—"}岁
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-secondary">{p.grid?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-ink-secondary">{CATEGORY_LABEL[p.category]}</td>
                    <td className="px-4 py-3">
                      <RiskBadge level={p.riskLevel} />
                    </td>
                    <td className="px-4 py-3 text-ink-secondary">{maskPhone(p.phone)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-ink-secondary">{formatDate(p.lastVisitAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-primary hover:underline" onClick={() => onOpen(p.id)}>
                        查看
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 sm:hidden">
            {data.items.map((p) => (
              <button
                key={p.id}
                onClick={() => onOpen(p.id)}
                className="w-full rounded-card border border-line bg-white p-4 text-left transition hover:border-primary/40"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-caption text-primary">
                      {p.name.slice(0, 1)}
                    </span>
                    <span className="font-medium text-ink">{p.name}</span>
                    <span className="text-caption text-ink-secondary">
                      {p.gender === "MALE" ? "男" : "女"} · {age(p.birthDate) ?? "—"}岁
                    </span>
                  </div>
                  <RiskBadge level={p.riskLevel} />
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1 text-caption text-ink-secondary">
                  <span>{p.grid?.name ?? "—"}</span>
                  <span>{CATEGORY_LABEL[p.category]}</span>
                  <span>{maskPhone(p.phone)}</span>
                  <span>{formatDate(p.lastVisitAt)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <StatusBadge status={p.status} />
                  <span className="text-caption text-primary">查看详情 →</span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-caption text-ink-secondary">共 {data.total} 条</span>
            <div className="flex items-center gap-1">
              <button
                className="btn-secondary px-3 py-1 text-caption"
                disabled={page <= 1}
                onClick={() => goPage(page - 1)}
              >
                上一页
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => goPage(i + 1)}
                  className={`h-8 w-8 rounded-control text-caption transition ${
                    page === i + 1
                      ? "bg-primary text-white"
                      : "border border-line bg-white text-ink-secondary hover:bg-paper"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="btn-secondary px-3 py-1 text-caption"
                disabled={page >= totalPages}
                onClick={() => goPage(page + 1)}
              >
                下一页
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

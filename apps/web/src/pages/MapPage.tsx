import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import type { Grid } from "../types";
import { api, ApiError } from "../api";
import { SkeletonRows } from "../components/States";

type GeoPolygon = { type: "Polygon"; coordinates: number[][][] };

function toLatLngs(bounds: unknown): L.LatLngExpression[] {
  const ring = (bounds as any)?.coordinates?.[0] as [number, number][] | undefined;
  if (!ring) return [];
  return ring.map(([lng, lat]) => [lat, lng] as [number, number]);
}

function getGeoJson(poly: L.Polygon): GeoPolygon {
  const ll = poly.getLatLngs() as any;
  const first = Array.isArray(ll[0]) ? ll[0] : ll;
  const ring = first as L.LatLng[];
  return {
    type: "Polygon",
    coordinates: [ring.map((p) => [p.lng, p.lat])],
  };
}

function ringAreaKm2(ring: [number, number][]): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  let sum = 0;
  for (let i = 0; i < ring.length; i++) {
    const [lng1, lat1] = ring[i];
    const [lng2, lat2] = ring[(i + 1) % ring.length];
    sum += toRad(lng2 - lng1) * (2 + Math.sin(toRad(lat1)) + Math.sin(toRad(lat2)));
  }
  return Math.abs((sum * R * R) / 2);
}

function gridAreaKm2(bounds: unknown): number {
  const ring = (bounds as any)?.coordinates?.[0] as [number, number][] | undefined;
  return ring ? ringAreaKm2(ring) : 0;
}

export function MapPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const polygonsRef = useRef<Record<string, L.Polygon>>({});
  const originalRef = useRef<Record<string, GeoPolygon>>({});
  const normalTileRef = useRef<L.TileLayer | null>(null);
  const satelliteTileRef = useRef<L.TileLayer | null>(null);
  const didFitRef = useRef(false);
  const editingRef = useRef(false);
  const toastTimer = useRef<number | null>(null);

  const [grids, setGrids] = useState<Grid[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [search, setSearch] = useState("");
  const [basemap, setBasemap] = useState<"normal" | "satellite">("normal");

  useEffect(() => {
    editingRef.current = editing;
  }, [editing]);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  };

  // 初始化地图（底图：普通 + 卫星两套，供右下角切换）
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: false });
    map.setView([22.718, 114.255], 15);
    L.control.zoom({ position: "bottomleft" }).addTo(map);

    normalTileRef.current = L.tileLayer(
      "https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
      {
        subdomains: ["1", "2", "3", "4"],
        attribution: "&copy; 高德地图",
        maxZoom: 18,
        className: "amap-tile",
      },
    ).addTo(map);

    satelliteTileRef.current = L.tileLayer(
      "https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
      {
        subdomains: ["1", "2", "3", "4"],
        attribution: "&copy; 高德地图",
        maxZoom: 18,
        className: "amap-tile",
      },
    );

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      normalTileRef.current = null;
      satelliteTileRef.current = null;
    };
  }, [loading]);

  // 底图切换
  useEffect(() => {
    const map = mapRef.current;
    const normal = normalTileRef.current;
    const satellite = satelliteTileRef.current;
    if (!map || !normal || !satellite) return;
    if (basemap === "satellite") {
      if (map.hasLayer(normal)) map.removeLayer(normal);
      if (!map.hasLayer(satellite)) satellite.addTo(map);
    } else {
      if (map.hasLayer(satellite)) map.removeLayer(satellite);
      if (!map.hasLayer(normal)) normal.addTo(map);
    }
  }, [basemap]);

  // 加载网格
  useEffect(() => {
    api
      .listGrids()
      .then((g) => {
        setGrids(g);
        setSelectedId((prev) => prev ?? g[0]?.id ?? null);
        setLoading(false);
      })
      .catch((e) => {
        setError(e instanceof ApiError ? e.message : "加载网格失败");
        setLoading(false);
      });
  }, []);

  // 渲染多边形（核心逻辑不动，仅新增中心气泡标签）
  useEffect(() => {
    const map = mapRef.current;
    if (!map || grids.length === 0) return;
    Object.values(polygonsRef.current).forEach((layer) => map.removeLayer(layer));
    polygonsRef.current = {};

    grids.forEach((g) => {
      const poly = L.polygon(toLatLngs(g.bounds), {
        color: g.color,
        weight: 2,
        fillColor: g.color,
        fillOpacity: 0.34,
      }).addTo(map);

      poly.on("click", () => {
        if (!editingRef.current) setSelectedId(g.id);
      });

      poly.bindTooltip(
        `<span class="grid-label-pill" style="background:${g.color}">${g.name}</span>`,
        {
          permanent: true,
          direction: "center",
          className: "grid-label-wrap",
          opacity: 1,
          interactive: false,
        },
      );

      polygonsRef.current[g.id] = poly;
    });

    if (!didFitRef.current) {
      const group = L.featureGroup(Object.values(polygonsRef.current));
      map.fitBounds(group.getBounds().pad(0.12));
      didFitRef.current = true;
    }
  }, [grids]);

  // 选中态样式
  useEffect(() => {
    Object.entries(polygonsRef.current).forEach(([id, poly]) => {
      const g = grids.find((x) => x.id === id);
      const isSel = id === selectedId;
      poly.setStyle({
        color: g?.color ?? "#3E7C4F",
        weight: isSel ? 3.5 : 2,
        fillOpacity: isSel ? 0.48 : 0.34,
      });
      if (isSel) poly.bringToFront();
    });
  }, [selectedId, grids]);

  // 编辑态开关
  useEffect(() => {
    const id = selectedId;
    if (!id) return;
    const poly = polygonsRef.current[id];
    if (!poly) return;
    const pm = (poly as any).pm;
    if (editing) {
      originalRef.current[id] = getGeoJson(poly);
      pm.enable({ allowSelfIntersection: false });
    } else if (pm.enabled?.()) {
      pm.disable();
    }
  }, [editing, selectedId]);

  const selectedGrid = grids.find((g) => g.id === selectedId) ?? null;
  const filteredGrids = grids.filter((g) => g.name.includes(search.trim()));
  const totalPersons = grids.reduce((acc, g) => acc + (g._count?.persons ?? 0), 0);
  const totalArea = grids.reduce((acc, g) => acc + gridAreaKm2(g.bounds), 0);

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const startEdit = () => {
    if (selectedId) setEditing(true);
  };

  const cancelEdit = () => {
    const id = selectedId;
    if (id && originalRef.current[id]) {
      const poly = polygonsRef.current[id];
      if (poly) poly.setLatLngs(toLatLngs(originalRef.current[id]));
    }
    setEditing(false);
  };

  const save = async () => {
    const id = selectedId;
    if (!id) return;
    const poly = polygonsRef.current[id];
    if (!poly) return;
    setSaving(true);
    try {
      const bounds = getGeoJson(poly);
      await api.updateGrid(id, { bounds });
      setGrids((prev) => prev.map((g) => (g.id === id ? { ...g, bounds } : g)));
      setEditing(false);
      showToast("success", "网格边界已保存");
    } catch (e) {
      showToast("error", e instanceof ApiError ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <SkeletonRows rows={4} />;

  if (error) {
    return (
      <div className="rounded-card border border-risk-high/30 bg-risk-high/5 p-6 text-center text-risk-high">
        {error}
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[230px_1fr_210px]">
      {/* ===== 左侧：网格列表 + 网格统计 ===== */}
      <aside className="space-y-3">
        <div className="rounded-card border border-line bg-white p-3 shadow-sm">
          <p className="mb-2 text-caption font-semibold text-ink">网格列表</p>
          <input
            className="input mb-2 text-caption"
            placeholder="搜索网格名称"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="max-h-[240px] space-y-1 overflow-y-auto">
            {filteredGrids.length === 0 ? (
              <p className="px-2 py-3 text-caption text-ink-secondary">未找到网格</p>
            ) : (
              filteredGrids.map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    if (!editing) setSelectedId(g.id);
                  }}
                  className={`flex w-full items-center gap-2 rounded-control px-2 py-2 text-left transition ${
                    g.id === selectedId ? "bg-primary/10" : "hover:bg-paper"
                  }`}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: g.color }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body font-medium text-ink">{g.name}</span>
                    <span className="block text-caption text-ink-secondary">
                      档案 {g._count?.persons ?? 0} 人
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="rounded-card border border-line bg-white p-3 shadow-sm">
          <p className="mb-2 text-caption font-semibold text-ink">网格统计</p>
          <div className="space-y-2">
            <StatRow icon="🗺️" label="总网格数量" value={`${grids.length} 个`} />
            <StatRow icon="👥" label="总人数" value={`${totalPersons} 人`} />
            <StatRow icon="📐" label="总面积" value={`${totalArea.toFixed(1)} km²`} />
          </div>
        </div>
      </aside>

      {/* ===== 中间：地图 + 叠层 ===== */}
      <div className="relative overflow-hidden rounded-card border border-line bg-paper shadow-sm">
        <div ref={containerRef} className="h-[calc(100vh-130px)] min-h-[420px] w-full" />

        {/* 工具栏（左上） */}
        <div className="absolute left-3 top-3 z-[1000] flex flex-wrap items-center gap-2">
          {!editing ? (
            <button className="btn-primary shadow" disabled={!selectedId} onClick={startEdit}>
              ✎ 编辑边界
            </button>
          ) : (
            <>
              <button className="btn-primary shadow" disabled={saving} onClick={save}>
                💾 {saving ? "保存中…" : "保存"}
              </button>
              <button className="btn-secondary shadow" disabled={saving} onClick={cancelEdit}>
                ✕ 取消
              </button>
            </>
          )}
        </div>

        {/* 操作提示 / 保存反馈（顶部中间） */}
        {(editing || toast) && (
          <div className="pointer-events-none absolute left-1/2 top-3 z-[1000] -translate-x-1/2">
            {toast ? (
              <span
                className={`rounded-tag px-3 py-1.5 text-caption shadow ${
                  toast.type === "success"
                    ? "bg-primary text-white"
                    : "bg-risk-high text-white"
                }`}
              >
                {toast.msg}
              </span>
            ) : (
              <span className="rounded-tag bg-white/95 px-3 py-1.5 text-caption text-ink-secondary shadow">
                拖拽顶点或边中点调整边界
              </span>
            )}
          </div>
        )}

        {/* 图例（右上） */}
        <div className="pointer-events-none absolute right-3 top-3 z-[1000] hidden w-40 rounded-card border border-line bg-white/95 p-3 shadow md:block">
          <p className="mb-2 text-caption font-semibold text-ink">图例</p>
          <div className="space-y-1.5 text-caption text-ink-secondary">
            <div className="flex items-center gap-2">
              <span className="h-0.5 w-4 bg-ink-secondary" />
              网格边界
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-4 rounded-sm bg-primary/40" />
              选中态
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full border border-primary bg-white" />
              编辑顶点
            </div>
          </div>
        </div>

        {/* 当前网格信息（右下） */}
        {selectedGrid && (
          <div className="pointer-events-none absolute bottom-14 right-3 z-[1000] hidden w-44 rounded-card border border-line bg-white/95 p-3 shadow md:block">
            <p className="mb-1 text-caption font-semibold text-ink">当前网格信息</p>
            <dl className="space-y-1 text-caption">
              <div className="flex justify-between">
                <dt className="text-ink-secondary">网格名称</dt>
                <dd className="text-ink">{selectedGrid.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-secondary">重点人群</dt>
                <dd className="text-ink">{selectedGrid._count?.persons ?? 0}</dd>
              </div>
            </dl>
            <span className="mt-2 inline-block rounded-tag bg-primary/10 px-2 py-0.5 text-caption text-primary">
              已选中
            </span>
          </div>
        )}

        {/* 底图切换（右下角） */}
        <div className="absolute bottom-3 right-3 z-[1000] flex overflow-hidden rounded-control border border-line bg-white text-caption shadow">
          <button
            onClick={() => setBasemap("normal")}
            className={`px-3 py-1.5 transition ${
              basemap === "normal" ? "bg-primary text-white" : "text-ink-secondary hover:bg-paper"
            }`}
          >
            地图
          </button>
          <button
            onClick={() => setBasemap("satellite")}
            className={`px-3 py-1.5 transition ${
              basemap === "satellite" ? "bg-primary text-white" : "text-ink-secondary hover:bg-paper"
            }`}
          >
            卫星
          </button>
        </div>
      </div>

      {/* ===== 右侧：天气 / 今日概览 / 快捷操作 ===== */}
      <aside className="space-y-3">
        <div className="rounded-card border border-line bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-card-title">24°C</p>
              <p className="text-caption text-ink-secondary">多云</p>
            </div>
            <span className="text-2xl leading-none">⛅</span>
          </div>
          <p className="mt-2 border-t border-line pt-2 text-caption text-ink-secondary">
            {dateStr} · 深圳·龙岗
          </p>
        </div>

        <div className="rounded-card border border-line bg-white p-3 shadow-sm">
          <p className="mb-2 text-caption font-semibold text-ink">重点人群分布</p>
          <div className="space-y-1.5 text-caption">
            {grids.map((g) => (
              <OverviewRow key={g.id} icon="👥" label={g.name} value={g._count?.persons ?? 0} />
            ))}
          </div>
        </div>

      </aside>
    </div>
  );
}

function StatRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-caption text-ink-secondary">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-paper text-caption">{icon}</span>
        {label}
      </span>
      <span className="text-body font-medium text-ink">{value}</span>
    </div>
  );
}

function OverviewRow({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-ink-secondary">
        <span className="text-sm leading-none">{icon}</span>
        {label}
      </span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}

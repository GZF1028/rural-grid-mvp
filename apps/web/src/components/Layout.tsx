import type { ReactNode } from "react";
import { useState } from "react";

export function Layout({
  active,
  onNavigate,
  children,
}: {
  active: "list" | "map";
  onNavigate: (v: "list" | "map") => void;
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const tab = (key: "list" | "map", label: string) => (
    <button
      key={key}
      onClick={() => onNavigate(key)}
      className={`whitespace-nowrap rounded-control px-3 py-1.5 text-body transition ${
        active === key
          ? "bg-primary/10 font-medium text-primary"
          : "text-ink-secondary hover:bg-paper hover:text-ink"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="flex w-full items-center justify-between gap-2 px-4 py-2 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-lg leading-none">🌾</span>
            <span className="truncate text-caption font-semibold text-ink sm:text-card-title">
              数字乡村网格化管理后台
            </span>
          </div>

          <nav className="flex shrink-0 items-center gap-1">
            {tab("list", "档案列表")}
            {tab("map", "网格地图")}
          </nav>

          <div className="flex items-center gap-1.5">
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-full py-1 pl-1 pr-1.5 transition hover:bg-paper"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-caption text-white">
                  张
                </span>
                <span className="hidden text-caption text-ink sm:inline">管理员</span>
                <span className="text-caption text-ink-secondary">▾</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-9 w-44 overflow-hidden rounded-control border border-line bg-white py-1 shadow-lg">
                  <div className="border-b border-line px-3 py-2 text-caption text-ink-secondary">
                    当前网格员：张网格员
                  </div>
                  <button
                    className="block w-full px-3 py-1.5 text-left text-caption text-ink transition hover:bg-paper"
                    onClick={() => setMenuOpen(false)}
                  >
                    个人资料
                  </button>
                  <button
                    className="block w-full px-3 py-1.5 text-left text-caption text-ink transition hover:bg-paper"
                    onClick={() => setMenuOpen(false)}
                  >
                    退出登录
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="w-full px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}

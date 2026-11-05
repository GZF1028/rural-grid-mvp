const swatches = [
  { name: "primary 田野绿", cls: "bg-primary" },
  { name: "accent 稻穗金", cls: "bg-accent" },
  { name: "paper 暖白", cls: "bg-paper border border-line" },
  { name: "ink 深墨", cls: "bg-ink" },
  { name: "ink-secondary", cls: "bg-ink-secondary" },
  { name: "risk-high", cls: "bg-risk-high" },
  { name: "risk-mid", cls: "bg-risk-mid" },
  { name: "risk-low", cls: "bg-risk-low" },
];

const badges = [
  { label: "高风险", cls: "bg-risk-high/10 text-risk-high" },
  { label: "中风险", cls: "bg-risk-mid/10 text-risk-mid" },
  { label: "低风险", cls: "bg-risk-low/10 text-risk-low" },
];

export default function App() {
  return (
    <div className="min-h-screen p-8">
      <header className="mb-8">
        <h1 className="text-page-title">数字乡村网格化后台</h1>
        <p className="text-ink-secondary">脚手架预览 · 方向A 设计令牌（田野生机绿）</p>
      </header>

      <section className="mb-8 rounded-card border border-line bg-white p-6">
        <h2 className="mb-4 text-card-title">色板</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {swatches.map((s) => (
            <div key={s.name} className="flex items-center gap-2">
              <span className={`h-8 w-8 rounded-tag ${s.cls}`} />
              <span className="text-caption text-ink-secondary">{s.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8 rounded-card border border-line bg-white p-6">
        <h2 className="mb-4 text-card-title">按钮三态</h2>
        <div className="flex flex-wrap gap-3">
          <button className="rounded-control bg-primary px-4 py-2 text-white transition hover:bg-primary-dark active:translate-y-px">
            主按钮
          </button>
          <button className="rounded-control bg-primary px-4 py-2 text-white opacity-50" disabled>
            主按钮 disabled
          </button>
          <button className="rounded-control border border-line bg-white px-4 py-2 text-ink transition hover:bg-paper active:translate-y-px">
            次按钮
          </button>
        </div>
      </section>

      <section className="mb-8 rounded-card border border-line bg-white p-6">
        <h2 className="mb-4 text-card-title">风险徽标</h2>
        <div className="flex gap-3">
          {badges.map((b) => (
            <span key={b.label} className={`rounded-tag px-2 py-1 text-caption ${b.cls}`}>
              {b.label}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-card border border-line bg-white p-6">
        <h2 className="mb-4 text-card-title">示例档案卡片</h2>
        <div className="rounded-control border border-line p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-body font-semibold">张三</span>
              <span className="text-caption text-ink-secondary"> · 男 · 76岁</span>
            </div>
            <span className="rounded-tag bg-risk-low/10 px-2 py-1 text-caption text-risk-low">低风险</span>
          </div>
          <p className="mt-2 text-caption text-ink-secondary">上河组 · 独居老人 · 手机号 138****5678</p>
        </div>
      </section>
    </div>
  );
}

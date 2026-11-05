# 数字乡村网格化后台（rural-grid-mvp）

村干部/网格员使用的「重点人群档案 + 网格地图展示/编辑」迷你后台（试岗任务 MVP）。

## 仓库
https://github.com/GZF1028/rural-grid-mvp.git

## 技术栈
- 前端：React 18 + Vite + TypeScript + Tailwind CSS + Leaflet（react-leaflet + leaflet-geoman-free）
- 后端：Node.js + Fastify + Prisma + Zod
- 数据库：PostgreSQL（Neon 云端）
- 部署：Railway（后端 serve 前端 build，单公开 URL）

## 文档
- `docs/01-需求收敛.md` —— 需求收敛基准（已定稿）
- `assets/design/prompts.md` —— 生图 Prompt 模板（A/B 两方向 × 4 张）
- `docs/02-设计基准.md` —— 设计基准（待补）
- `docs/03-还原自查.md` —— 还原对比与差异清单（待补）
- `docs/04-复盘.md` —— 复盘（待补）

## 当前状态
需求收敛与生图 Prompt 已落盘；AI 生图进行中。

# 数字乡村网格化后台（rural-grid-mvp）

村干部/网格员使用的「重点人群档案 + 网格地图展示/编辑」迷你后台（3 天试岗任务 MVP）。

## 线上地址
https://rural-grid-mvp-production.up.railway.app

## 仓库
https://github.com/GZF1028/rural-grid-mvp.git

## 技术栈
- 前端：React 18 + Vite + TypeScript + Tailwind CSS
- 地图：Leaflet + leaflet-geoman-free + 高德瓦片（免 key）
- 后端：Node.js + Fastify + Prisma + Zod
- 数据库：PostgreSQL（Neon）
- 部署：Railway（单服务：后端托管前端 build + API）

## 本地运行
```bash
pnpm install
pnpm dev          # web:5173 / server:4000
```
> 需在 `apps/server/.env` 配置 `DATABASE_URL`（Neon）。

## 文档
- [需求收敛](docs/01-需求收敛.md)
- [设计基准](docs/02-设计基准.md)
- [还原自查（对比图）](docs/03-还原自查.md)
- [复盘](docs/04-复盘.md)
- [演示脚本与问答](docs/05-演示脚本与问答.md)
- [技术文档](docs/06-技术文档.md)
- [需求规格说明书](docs/07-需求规格说明书.md)
- [生图 Prompt 模板](assets/design/prompts.md)

## 状态
3 天闭环已完成：需求收敛 → AI 生图 → 设计基准 → 前后端 → 地图编辑持久化 → 部署 → 复盘。
> 地图演示区域：深圳·龙岗（双龙站一带）。

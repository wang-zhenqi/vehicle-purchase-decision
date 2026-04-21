# VehiclePurchaseDecision / 购车决策量化计算器

本仓库包含一个面向家庭购车决策的 Web 计算器：**输入可配置、结果可解释（追溯树）、支持导入导出**，并针对**手机浏览器**做了布局优化。

## 目录结构

- `web/`：前端工程（React + TypeScript + Vite + Tailwind）
- `docs/`：项目文档（PRD / 设计 / 部署）
- `dialogue.txt`：原始对话记录（需求来源）
- `购车计算器.html`：早期单文件样例（不作为最终产品形态）

## 本地开发

要求：Node.js **20+**（你当前环境为 20.19.5）

```bash
cd web
npm install
npm run dev
```

终端里会出现 **Local** 与 **Network** 地址（例如 `http://192.168.x.x:5173/`）。手机与电脑连**同一 WiFi**，在手机浏览器打开 **Network** 那一行即可。若打不开，检查本机防火墙是否放行 Node/Vite，或确认没有隔离访客 WiFi（AP isolation）。

构建：

```bash
cd web
npm run build
npm run preview -- --host
```

`preview` 加 `--host` 后同样会显示局域网 URL，便于手机访问构建产物预览。

## 文档

见：

- [docs/PRD.md](docs/PRD.md)
- [docs/DESIGN.md](docs/DESIGN.md)
- [docs/DEPLOY.md](docs/DEPLOY.md)
- [docs/CALC_PROCEDURE.md](docs/CALC_PROCEDURE.md)（输入→计算 Mermaid 流程）
- [docs/BACKLOG.md](docs/BACKLOG.md)（延迟购买等后续议题）

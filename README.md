# Design Portfolio Studio

个人/工作室作品展示与管理平台基础版（Next.js + Tailwind）。

## 技术栈

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Recharts（统计图表）

## 功能覆盖

- 前台展示
  - 首页（欢迎区、精选、最新）
  - 作品列表（搜索/分类/排序）
  - 作品详情（大图展示、多字段信息）
  - 关于页、联系页
- 后台管理
  - 概览看板
  - 作品管理（筛选、批量选择、操作入口）
  - 上传作品（封面/多图上传、预览、进度反馈）
  - 分类管理、标签管理
  - 状态与权限扩展预留
- 数据统计
  - KPI 卡片
  - 类型占比图
  - 每月完成趋势图
  - 近期新增趋势图
  - 年份筛选

## 后台登录鉴权

- 后台路径：`/admin`
- 登录页：`/admin/login`
- 默认账号：`admin`
- 默认密码：`admin123456`

建议创建 `.env.local`（可从 `.env.example` 复制）并修改为你自己的凭据和数据库连接：

```bash
cp .env.example .env.local
```

`.env.local` 示例：

```bash
ADMIN_USERNAME=your_admin_name
ADMIN_PASSWORD=your_strong_password
AUTH_SECRET=your_long_random_secret
DATABASE_URL="mysql://root:password@127.0.0.1:3306/design_portfolio?connection_limit=5"
```

> `AUTH_SECRET` 建议至少 32 位随机字符串。
> `DATABASE_URL` 可暂时留空；留空时会回退到内存数据模式。

## 项目结构

- `src/app`：页面路由
- `src/components`：UI 组件
- `src/data`：mock 数据
- `src/lib`：类型和统计逻辑
- `docs/architecture.md`：信息架构与模块说明
- `docs/launch-roadmap.md`：上线路线图

## 快速启动

1. 安装 Node.js 20+
2. 安装依赖

```bash
npm install
```

3. 启动开发环境

```bash
npm run dev
```

如果要启用 MySQL，再执行：

```bash
npm run prisma:generate
npm run prisma:migrate
```

4. 访问

- 前台：`http://localhost:3000`
- 后台：`http://localhost:3000/admin`

## 后续迭代建议

- 接入对象存储（OSS/S3/Cloudinary）替代 Base64 图片
- 接入鉴权与多角色权限
- 增加作品版本记录与操作日志

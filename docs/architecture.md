# Studio Archive 信息架构与模块设计

## 1. 信息架构

- 前台（访客）
  - 首页 `/`
  - 作品列表 `/works`
  - 作品详情 `/works/[id]`
  - 关于 `/about`
  - 联系 `/contact`
- 后台（管理员）
  - 概览 `/admin`
  - 作品管理 `/admin/works`
  - 上传作品 `/admin/works/new`
  - 分类管理 `/admin/categories`
  - 标签管理 `/admin/tags`
  - 数据统计 `/admin/analytics`
  - 权限预留 `/admin/settings`

## 2. 主要模块拆分

- 展示模块
  - 导航与页脚
  - 首页 Banner + 精选 + 最新
  - 作品列表筛选（搜索/分类/排序）
  - 作品详情（图集、标签、业务字段）
- 管理模块
  - 作品表格管理（筛选、批量选择、编辑入口）
  - 上传表单（封面、详情图、状态字段、上传进度）
  - 分类管理、标签管理
  - 权限结构预留
- 统计模块
  - KPI 指标卡
  - 分类占比环形图
  - 每月完成柱状图
  - 近期新增折线图
  - 年份筛选

## 3. 数据字段设计（Work）

- id
- name（作品名称）
- slug（详情路由标识）
- coverImage（封面图）
- detailImages（详情图数组）
- category（分类）
- tags（标签数组）
- projectType（项目类型）
- summary（项目简介）
- completedAt（完成日期）
- commercialIncluded（是否商业收录）
- commercialUse（是否商用）
- featured（是否推荐）
- isPublic（是否公开）
- status（草稿/已发布/已归档）
- projectBackground（可扩展）
- designDescription（可扩展）
- software（可扩展）
- deliverables（可扩展）
- createdAt
- updatedAt

## 4. 组件结构建议

- `src/components/site/*`：前台布局组件
- `src/components/works/*`：作品卡片、作品筛选、图集
- `src/components/admin/*`：后台壳子、表格、上传表单
- `src/components/dashboard/*`：统计图表
- `src/components/common/*`：通用视觉组件

## 5. 扩展建议

- 接入数据库（Prisma + PostgreSQL）
- 接入对象存储（OSS/S3）支持真实上传
- 接入鉴权（NextAuth/Auth.js）实现多角色权限
- 将后台管理动作接入 Server Actions/API Routes

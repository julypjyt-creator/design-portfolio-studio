import { Work, WorkCategory } from "@/lib/types";

export const categories: WorkCategory[] = [
  "室内设计",
  "彩平图",
  "效果图转平面图",
  "室外景观渲染",
  "其他"
];

export const tags = [
  "现代",
  "极简",
  "自然采光",
  "商业展示",
  "软装搭配",
  "动线优化",
  "材质深化",
  "品牌空间"
];

export const works: Work[] = [
  {
    id: "w-001",
    name: "澜庭私宅空间改造",
    slug: "lan-ting-residence",
    coverImage:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80",
    detailImages: [
      "https://images.unsplash.com/photo-1616594039964-3d5d6be4f2f1?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=1600&q=80"
    ],
    category: "室内设计",
    tags: ["现代", "极简", "自然采光"],
    projectType: "住宅",
    summary: "针对三代同堂需求，重构客餐厅与书房关系，提升采光与收纳效率。",
    completedAt: "2026-03-06",
    commercialIncluded: true,
    commercialUse: true,
    featured: true,
    isPublic: true,
    status: "已发布",
    projectBackground: "客户希望提升公共区互动效率，同时保留安静办公区。",
    designDescription: "采用低饱和材质与线性灯光，形成有序且克制的居住氛围。",
    software: ["SketchUp", "Enscape", "Photoshop"],
    deliverables: ["平面优化", "效果图", "施工节点建议"],
    createdAt: "2026-01-15T09:00:00.000Z",
    updatedAt: "2026-03-08T09:00:00.000Z"
  },
  {
    id: "w-002",
    name: "栖云办公会客厅彩平图",
    slug: "qiyun-plan-render",
    coverImage:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80",
    detailImages: [
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1497366858526-0766cadbe8fa?auto=format&fit=crop&w=1600&q=80"
    ],
    category: "彩平图",
    tags: ["动线优化", "品牌空间"],
    projectType: "商业空间",
    summary: "通过颜色分区和功能标注，提高甲方汇报阶段的可读性与决策效率。",
    completedAt: "2026-02-18",
    commercialIncluded: true,
    commercialUse: false,
    featured: true,
    isPublic: true,
    status: "已发布",
    createdAt: "2026-02-01T09:00:00.000Z",
    updatedAt: "2026-02-21T09:00:00.000Z"
  },
  {
    id: "w-003",
    name: "湖岸公园景观节点渲染",
    slug: "lakeside-park-render",
    coverImage:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
    detailImages: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80"
    ],
    category: "室外景观渲染",
    tags: ["自然采光", "商业展示"],
    projectType: "文旅景观",
    summary: "围绕滨水慢行系统与夜景灯光进行节点渲染，支持招商展示。",
    completedAt: "2026-01-22",
    commercialIncluded: false,
    commercialUse: false,
    featured: false,
    isPublic: true,
    status: "已发布",
    createdAt: "2026-01-06T09:00:00.000Z",
    updatedAt: "2026-01-24T09:00:00.000Z"
  },
  {
    id: "w-004",
    name: "星澜展示中心效果图转平面",
    slug: "xinglan-render-to-plan",
    coverImage:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80",
    detailImages: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1600&q=80"
    ],
    category: "效果图转平面图",
    tags: ["材质深化", "软装搭配"],
    projectType: "公共空间",
    summary: "将概念效果图转译为可落地平面逻辑，明确功能流线与节点尺寸。",
    completedAt: "2025-12-14",
    commercialIncluded: true,
    commercialUse: true,
    featured: false,
    isPublic: false,
    status: "草稿",
    createdAt: "2025-12-02T09:00:00.000Z",
    updatedAt: "2026-01-02T09:00:00.000Z"
  },
  {
    id: "w-005",
    name: "和序酒店大堂概念提案",
    slug: "hexu-hotel-lobby",
    coverImage:
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=80",
    detailImages: [
      "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80"
    ],
    category: "其他",
    tags: ["现代", "商业展示", "品牌空间"],
    projectType: "概念提案",
    summary: "面向酒店竞标的快速概念提案，重点展示入口形象与品牌记忆点。",
    completedAt: "2025-11-28",
    commercialIncluded: false,
    commercialUse: false,
    featured: true,
    isPublic: true,
    status: "已归档",
    createdAt: "2025-11-15T09:00:00.000Z",
    updatedAt: "2025-12-01T09:00:00.000Z"
  }
];

export const getWorkBySlug = (slug: string) => works.find((work) => work.slug === slug);

export const visibleWorks = works.filter((work) => work.isPublic && work.status === "已发布");

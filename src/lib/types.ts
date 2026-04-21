export type WorkCategory = string;

export type WorkStatus = "草稿" | "已发布" | "已归档";

export type ProjectType = "住宅" | "商业空间" | "公共空间" | "文旅景观" | "概念提案";

export interface Work {
  id: string;
  name: string;
  slug: string;
  coverImage: string;
  detailImages: string[];
  category: WorkCategory;
  tags: string[];
  projectType: ProjectType;
  summary: string;
  completedAt: string;
  commercialIncluded: boolean;
  commercialUse: boolean;
  featured: boolean;
  isPublic: boolean;
  status: WorkStatus;
  projectBackground?: string;
  designDescription?: string;
  software?: string[];
  deliverables?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetric {
  label: string;
  value: number;
  helper?: string;
}

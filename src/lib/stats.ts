import { works } from "@/data/works";
import { Work } from "@/lib/types";

function pick(source?: Work[]) {
  return source ?? works;
}

export function getKpis(source?: Work[]) {
  const data = pick(source);
  const total = data.length;
  const featured = data.filter((w) => w.featured).length;
  const publicCount = data.filter((w) => w.isPublic).length;
  const commercialIncluded = data.filter((w) => w.commercialIncluded).length;
  const commercialUse = data.filter((w) => w.commercialUse).length;

  return {
    total,
    featured,
    publicCount,
    privateCount: total - publicCount,
    commercialIncluded,
    commercialNotIncluded: total - commercialIncluded,
    commercialUse,
    commercialUseRate: total ? Number(((commercialUse / total) * 100).toFixed(1)) : 0
  };
}

export function getCategoryDistribution() {
  const data = pick();
  return Object.entries(
    data.reduce<Record<string, number>>((acc, work) => {
      acc[work.category] = (acc[work.category] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));
}

export function getCategoryDistributionFrom(source?: Work[]) {
  const data = pick(source);
  return Object.entries(
    data.reduce<Record<string, number>>((acc, work) => {
      acc[work.category] = (acc[work.category] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));
}

export function getMonthlyCompletions(source?: Work[]) {
  const data = pick(source);
  const map = data.reduce<Record<string, number>>((acc, work) => {
    const key = work.completedAt.slice(0, 7);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));
}

export function getRecentTrend(source?: Work[]) {
  const thisYear = new Date().getFullYear().toString();
  return getMonthlyCompletions(source).filter((row) => row.month.startsWith(thisYear));
}

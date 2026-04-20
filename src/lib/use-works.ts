"use client";

import { useCallback, useEffect, useState } from "react";
import { works as seedWorks } from "@/data/works";
import { Work } from "@/lib/types";

export function useWorks(scope: "public" | "all" = "public") {
  const [items, setItems] = useState<Work[]>(scope === "public" ? seedWorks.filter((work) => work.isPublic && work.status === "已发布") : seedWorks);

  const fetchWorks = useCallback(async () => {
    try {
      const response = await fetch(`/api/works?scope=${scope}`, {
        cache: "no-store"
      });
      const data = (await response.json()) as { items?: Work[] };

      if (Array.isArray(data.items)) {
        setItems(data.items);
      }
    } catch {
      // Ignore network failures and keep last-known UI state.
    }
  }, [scope]);

  useEffect(() => {
    fetchWorks();

    const sync = () => {
      fetchWorks();
    };

    window.addEventListener("works-updated", sync);

    return () => {
      window.removeEventListener("works-updated", sync);
    };
  }, [fetchWorks]);

  return items;
}

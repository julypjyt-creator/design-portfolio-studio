"use client";

import { useEffect, useState } from "react";
import { works as seedWorks } from "@/data/works";
import { Work } from "@/lib/types";
import { loadWorksFromStorage } from "@/lib/work-storage";

export function useWorks() {
  const [items, setItems] = useState<Work[]>(seedWorks);

  useEffect(() => {
    const sync = () => setItems(loadWorksFromStorage());

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("works-updated", sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("works-updated", sync);
    };
  }, []);

  return items;
}

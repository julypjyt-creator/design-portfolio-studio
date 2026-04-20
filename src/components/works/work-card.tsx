import Image from "next/image";
import Link from "next/link";
import { Chip } from "@/components/common/chip";
import { Work } from "@/lib/types";

export function WorkCard({ work }: { work: Work }) {
  return (
    <article className="group overflow-hidden rounded-xl2 border border-line bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/works/${work.slug}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={work.coverImage}
            alt={work.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </Link>
      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <Chip>{work.category}</Chip>
          {work.featured ? <Chip tone="accent">推荐</Chip> : null}
        </div>
        <h3 className="line-clamp-1 text-lg font-semibold text-ink">{work.name}</h3>
        <p className="line-clamp-2 text-sm leading-6 text-stone">{work.summary}</p>
        <p className="text-xs text-stone">完成时间：{work.completedAt}</p>
      </div>
    </article>
  );
}

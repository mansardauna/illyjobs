"use client";

interface SkeletonGridProps {
  count?: number;
  height?: string;
}

export function SkeletonGrid({ count = 3, height = "h-44" }: SkeletonGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${height} bg-slate-200 rounded-sm animate-pulse`} />
      ))}
    </div>
  );
}

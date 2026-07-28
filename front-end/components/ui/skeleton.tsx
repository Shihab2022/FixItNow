import { HTMLAttributes } from "react";

export function Skeleton({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-800 ${className}`}
      {...props}
    />
  );
}

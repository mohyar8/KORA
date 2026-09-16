import { clsx } from "clsx";
import type { ReactNode } from "react";

export function Container({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
}) {
  return (
    <Tag className={clsx("mx-auto w-full max-w-(--container-xl) px-6 md:px-10", className)}>
      {children}
    </Tag>
  );
}

import { Fragment } from "react";

interface BrandNameProps {
  readonly className?: string;
}

export function BrandName({ className = "" }: BrandNameProps) {
  return <span className={["brand-name", className].filter(Boolean).join(" ")}>كورة</span>;
}

export function BrandText({ children }: { readonly children: string }) {
  const parts = children.split("كورة");

  if (parts.length === 1) return children;

  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={`${index}-${part}`}>
          {part}
          {index < parts.length - 1 && <BrandName />}
        </Fragment>
      ))}
    </>
  );
}

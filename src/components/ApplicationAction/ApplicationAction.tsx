import type { ApplicationStatus } from "../../config/site";
import { siteConfig } from "../../config/site";

interface ApplicationActionProps {
  readonly status?: ApplicationStatus;
  readonly className?: string;
}

const labels: Record<ApplicationStatus, string> = {
  open: "ابدأ طلبك",
  closed: "انتهى التقديم",
  "coming-soon": "يفتح التقديم قريبًا",
};

export function ApplicationAction({
  status = siteConfig.applicationStatus,
  className = "",
}: ApplicationActionProps) {
  const classes = [
    "application-action",
    status === "open" ? "application-action--active" : "application-action--unavailable",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (status === "open") {
    return (
      <a
        className={classes}
        href={siteConfig.microsoftFormUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        {labels[status]}
      </a>
    );
  }

  return (
    <span className={classes} role="status">
      {labels[status]}
    </span>
  );
}
